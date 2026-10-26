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
  const out = execSync(`gh pr view ${args} --json baseRefName,mergeStateStatus,statusCheckRollup`, {
    cwd,
    encoding: 'utf8',
  });
  return JSON.parse(out);
}

// Agents may merge a PR only into dev, with every CI check green. main and
// staging stay human-only (docs/AI-WORKFLOW.md, "Autonomous loop").
function checkMerge(c, cwd, prInfo) {
  if (/--admin\b/.test(c)) return deny('Admin merge is blocked.');
  const args = c
    .replace(/^.*\bgh pr merge\b/, '')
    .trim()
    .split(' ')
    .filter((a) => a && !a.startsWith('-'));
  const target = args[0] ?? '';
  let info;
  try {
    info = prInfo(target, cwd);
  } catch {
    return deny('Could not read the PR from GitHub; merge blocked. Pass an explicit PR number.');
  }
  if (info.baseRefName !== 'dev') {
    return deny(
      `Merging into ${info.baseRefName} is a human gate. Only PRs into dev may be agent-merged.`,
    );
  }
  // GitHub Actions jobs are CheckRuns and must all be green. Deployment
  // statuses (Vercel previews) are StatusContexts and don't gate a merge.
  const runs = (info.statusCheckRollup ?? []).filter((k) => k.__typename !== 'StatusContext');
  const green =
    runs.length > 0 && runs.every((k) => ['SUCCESS', 'SKIPPED', 'NEUTRAL'].includes(k.conclusion));
  if (!green) return deny('CI checks are not all green yet; merge blocked.');
  if (['BLOCKED', 'DIRTY', 'BEHIND'].includes(info.mergeStateStatus)) {
    return deny(`GitHub reports the PR as ${info.mergeStateStatus}; merge blocked.`);
  }
  return null;
}

// Remove text that only describes things (heredoc bodies, commit/PR messages)
// so words like "dev" or "merge" inside them don't look like commands.
function stripProse(command) {
  return command
    .replace(/<<-?\s*(['"]?)(\w+)\1[\s\S]*?\n\s*\2\b/g, ' ')
    .replace(/(-m|--message|-b|--body|--title|--notes)(\s+|=)("[^"]*"|'[^']*')/g, '$1 ""');
}

// Judge each command of a chain on its own: `a && b` is two commands.
export function check(command, cwd = process.cwd(), prInfo = ghPrInfo) {
  let softest = null;
  for (const segment of stripProse(command).split(/&&|\|\||;|\||\n/)) {
    const result = checkCommand(segment.replace(/\s+/g, ' ').trim(), cwd, prInfo);
    if (result?.decision === 'deny') return result;
    softest ??= result;
  }
  return softest;
}

function checkCommand(c, cwd, prInfo) {
  if (/\bgit\b.*\bpush\b/.test(c)) {
    if (/(\s-f\b|--force\b|--force-with-lease)/.test(c)) return deny('Force-push is blocked.');
    const targetsProtected = PROTECTED.some((b) =>
      new RegExp(`(\\s|:|/|["'])${b}(["']|\\s|$)`).test(c.replace(/^.*\bpush\b/, '')),
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
