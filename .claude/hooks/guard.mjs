// PreToolUse guard for Bash/PowerShell. Enforces the human gates in
// docs/AI-WORKFLOW.md: agents never push to protected branches, merge PRs,
// force-push, skip hooks, or run destructive DB commands.
import { execSync } from 'node:child_process';

const PROTECTED = ['main', 'staging', 'dev'];

const deny = (reason) => ({ decision: 'deny', reason });
const ask = (reason) => ({ decision: 'ask', reason });

function currentBranch(cwd) {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { cwd, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function ghPrInfo(args, cwd) {
  const out = execSync(`gh pr view ${args} --json baseRefName,statusCheckRollup`, {
    cwd,
    encoding: 'utf8',
  });
  return JSON.parse(out);
}

// Agents may merge a PR only into dev, with every CI check green. main and
// staging stay human-only (docs/AI-WORKFLOW.md, "Autonomous loop").
function checkMerge(c, cwd, prInfo) {
  if (/--admin\b/.test(c)) return deny('Admin merge is blocked.');
  const args = c.replace(/^.*\bgh pr merge\b/, '').trim().split(' ').filter((a) => a && !a.startsWith('-'));
  const target = args[0] ?? '';
  let info;
  try {
    info = prInfo(target, cwd);
  } catch {
    return deny('Could not read the PR from GitHub; merge blocked. Pass an explicit PR number.');
  }
  if (info.baseRefName !== 'dev') {
    return deny(`Merging into ${info.baseRefName} is a human gate. Only PRs into dev may be agent-merged.`);
  }
  const checks = info.statusCheckRollup ?? [];
  const green = checks.length > 0 && checks.every((k) => ['SUCCESS', 'SKIPPED', 'NEUTRAL'].includes(k.conclusion));
  if (!green) return deny('CI checks are not all green yet; merge blocked.');
  return null;
}

export function check(command, cwd = process.cwd(), prInfo = ghPrInfo) {
  const c = command.replace(/\s+/g, ' ');

  if (/\bgit\b.*\bpush\b/.test(c)) {
    if (/(\s-f\b|--force\b|--force-with-lease)/.test(c)) return deny('Force-push is blocked.');
    const targetsProtected = PROTECTED.some((b) =>
      new RegExp(`(\\s|:|/)${b}(\\s|$)`).test(c.replace(/^.*\bpush\b/, '')),
    );
    if (targetsProtected)
      return deny('Pushing to main/staging/dev is blocked. Push a feature branch and open a PR.');
    const hasExplicitRef = /\bpush\b(\s+-\S+)*\s+\S+\s+\S+/.test(c);
    if (!hasExplicitRef && PROTECTED.includes(currentBranch(cwd))) {
      return deny('You are on a protected branch. Create a feature branch and push that.');
    }
  }

  if (/\bgit\b.*--no-verify\b|\bgit commit\b.*\s-n\b/.test(c))
    return deny('Skipping git hooks is blocked.');
  if (/\bgh pr merge\b/.test(c)) return checkMerge(c, cwd, prInfo);
  if (/\bprisma migrate (deploy|reset)\b|\bprisma db push\b.*--force-reset/.test(c)) {
    return deny('Destructive Prisma command is blocked.');
  }
  if (/\brm\s+(-\w*r\w*f|-\w*f\w*r)\w*\s+(\/|~|\*|\.|\.\.|\$HOME)(\s|$)/.test(c))
    return deny('Dangerous rm -rf target.');

  if (
    /\bgit reset --hard\b|\bgit clean\b.*-\w*f|\bgit branch -D\b|\bgit worktree remove\b.*--force/.test(
      c,
    )
  ) {
    return ask('Destructive git command: confirm with the user.');
  }
  return null;
}

// Run as a hook only when executed directly (keeps `check` importable for tests).
if (
  import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` ||
  process.argv[1]?.endsWith('guard.mjs')
) {
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    let input;
    try {
      input = JSON.parse(raw);
    } catch {
      return;
    }
    const command = input?.tool_input?.command;
    if (typeof command !== 'string') return;
    const result = check(command, input.cwd);
    if (!result) return;
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: result.decision,
          permissionDecisionReason: result.reason,
        },
      }),
    );
  });
}
