// Headless runner for the /work-board loop. One cycle = one fresh worktree off
// origin/dev + one `claude -p` session that completes one ticket.
//
//   node .claude/scripts/agent-loop.mjs --env-file <path> [--cycles 3]
//        [--cycle-budget 5] [--total-budget 15] [--model sonnet] [--dry-run]
//
// Safety, enforced here and not left to the agent:
//  - runs only if an issue labelled `ai-ready` exists (no model call otherwise)
//  - the env file must use the Neon `agents` role, never the owner/production one
//  - the worktree must contain the guard hook, or the cycle is refused
//  - spend is capped per cycle and in total; two failed cycles in a row stop the loop
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const flag = (name) => args.includes(`--${name}`);

const maxCycles = Number(opt('cycles', 3));
const cycleBudget = Number(opt('cycle-budget', 5));
const totalBudget = Number(opt('total-budget', 15));
const model = opt('model', 'sonnet');
const cycleMinutes = Number(opt('cycle-minutes', 90));
const envFile = opt('env-file', process.env.AGENT_ENV_FILE);
const dbUser = process.env.AGENT_DB_USER ?? 'agents';
const dryRun = flag('dry-run');

const repo = path.resolve(import.meta.dirname, '..', '..');
const wtRoot = path.resolve(repo, '..', `${path.basename(repo)}-wt`);
const logDir = path.join(wtRoot, '_logs');

const run = (cmd, cmdArgs, options = {}) =>
  spawnSync(cmd, cmdArgs, { encoding: 'utf8', shell: cmd === 'pnpm', ...options });
const die = (msg) => {
  console.error(`agent-loop: ${msg}`);
  process.exit(1);
};

if (!envFile || !existsSync(envFile))
  die('pass --env-file (or set AGENT_ENV_FILE) pointing at the agents-branch .env');
const urlLine = readFileSync(envFile, 'utf8')
  .split(/\r?\n/)
  .filter((l) => l.startsWith('DATABASE_URL='));
if (urlLine.length !== 1)
  die(`env file must contain exactly one DATABASE_URL line (found ${urlLine.length})`);
const dbUrl = new URL(urlLine[0].slice('DATABASE_URL='.length).replace(/^"|"$/g, ''));
if (dbUrl.username !== dbUser)
  die(`refusing: DATABASE_URL user is "${dbUrl.username}", expected "${dbUser}"`);

mkdirSync(logDir, { recursive: true });
let spent = 0;
let failures = 0;

for (let cycle = 1; cycle <= maxCycles; cycle++) {
  if (spent + cycleBudget > totalBudget) {
    console.log(
      `stop: next cycle could exceed the total budget ($${spent.toFixed(2)} of $${totalBudget})`,
    );
    break;
  }
  const ready = run(
    'gh',
    [
      'issue',
      'list',
      '--label',
      'ai-ready',
      '--state',
      'open',
      '--json',
      'number,title',
      '--limit',
      '1',
    ],
    { cwd: repo },
  );
  if (ready.status !== 0) die(`gh failed: ${ready.stderr.trim()}`);
  const tickets = JSON.parse(ready.stdout);
  if (tickets.length === 0) {
    console.log('stop: no open issue labelled ai-ready');
    break;
  }
  console.log(
    `\ncycle ${cycle}/${maxCycles}: next ready issue is #${tickets[0].number} ${tickets[0].title}`,
  );
  if (dryRun) {
    console.log('dry run: would create a worktree, run claude, and clean up');
    continue;
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const wt = path.join(wtRoot, `loop-${stamp}`);
  run('git', ['fetch', '-q', 'origin', 'dev'], { cwd: repo });
  const add = run('git', ['worktree', 'add', '--detach', wt, 'origin/dev'], { cwd: repo });
  if (add.status !== 0) die(`worktree failed: ${add.stderr.trim()}`);
  copyFileSync(envFile, path.join(wt, '.env'));

  const settings = path.join(wt, '.claude', 'settings.json');
  const guarded =
    existsSync(path.join(wt, '.claude', 'hooks', 'guard.mjs')) &&
    existsSync(settings) &&
    readFileSync(settings, 'utf8').includes('guard.mjs');
  if (!guarded)
    die(`refusing: ${wt} has no guard hook (merge the agent tooling PR into dev first)`);

  console.log('installing dependencies...');
  const install = run('pnpm', ['install', '--frozen-lockfile'], { cwd: wt });
  if (install.status !== 0) die(`pnpm install failed in ${wt}`);

  const prompt = 'Use the work-board skill to complete exactly one ticket, then stop.';
  const started = Date.now();
  const result = run(
    'claude',
    [
      '-p',
      prompt,
      '--permission-mode',
      'auto',
      '--model',
      model,
      '--max-budget-usd',
      String(cycleBudget),
      '--output-format',
      'json',
    ],
    { cwd: wt, timeout: cycleMinutes * 60_000, maxBuffer: 64 * 1024 * 1024 },
  );

  let summary = {};
  try {
    summary = JSON.parse(result.stdout);
  } catch {
    summary = {
      is_error: true,
      result: (result.stderr || result.stdout || 'no output').slice(0, 500),
    };
  }
  const cost = Number(summary.total_cost_usd ?? 0);
  spent += cost;
  const failed = result.status !== 0 || summary.is_error === true;
  failures = failed ? failures + 1 : 0;

  const log = path.join(logDir, `cycle-${stamp}.json`);
  writeFileSync(
    log,
    JSON.stringify(
      { cycle, ticket: tickets[0], minutes: (Date.now() - started) / 60000, cost, failed, summary },
      null,
      2,
    ),
  );
  console.log(
    `${failed ? 'FAILED' : 'ok'}: $${cost.toFixed(2)} this cycle, $${spent.toFixed(2)} total, log ${log}`,
  );

  const dirty = run('git', ['status', '--porcelain'], { cwd: wt }).stdout.trim();
  if (dirty) {
    console.log(`worktree kept (uncommitted changes): ${wt}`);
  } else {
    run('git', ['worktree', 'remove', wt], { cwd: repo });
  }

  if (failures >= 2) {
    console.log('stop: two failed cycles in a row');
    break;
  }
}
console.log(`\ndone. spent $${spent.toFixed(2)}. logs: ${logDir}`);
