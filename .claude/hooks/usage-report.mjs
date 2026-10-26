// Stop hook: after each task (one user prompt -> Claude finishes), print the
// agents used, tokens, and estimated cost for that task. Reads the session
// transcript plus <session>/subagents/*.jsonl. Cost is an ESTIMATE from the
// RATES table below (USD per million tokens) - verify against current pricing.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

// [input, output, cacheRead, cacheWrite(1h)] per 1M tokens. Matched by substring.
const RATES = {
  opus: [15, 75, 1.5, 30],
  sonnet: [3, 15, 0.3, 6],
  haiku: [1, 5, 0.1, 2],
  fable: [15, 75, 1.5, 30],
};
const DEFAULT_RATE = RATES.sonnet;

const rateFor = (model = '') =>
  Object.entries(RATES).find(([k]) => model.includes(k))?.[1] ?? DEFAULT_RATE;

const readJsonl = (path) =>
  readFileSync(path, 'utf8')
    .split('\n')
    .filter(Boolean)
    .flatMap((l) => {
      try {
        return [JSON.parse(l)];
      } catch {
        return [];
      }
    });

const isPrompt = (e) =>
  e.type === 'user' &&
  !e.isSidechain &&
  typeof e.promptId === 'string' &&
  !(Array.isArray(e.message?.content) && e.message.content.every((b) => b.type === 'tool_result'));

// One row per assistant message id (a message is logged once per content block).
function tally(entries, since) {
  const byId = new Map();
  for (const e of entries) {
    if (e.type !== 'assistant' || !e.message?.usage || e.timestamp < since) continue;
    byId.set(e.message.id ?? e.uuid, e);
  }
  const t = { in: 0, out: 0, read: 0, write: 0, cost: 0, calls: byId.size, models: new Set() };
  for (const e of byId.values()) {
    const u = e.message.usage;
    const r = rateFor(e.message.model);
    const [i, o, cr, cw] = [
      u.input_tokens ?? 0,
      u.output_tokens ?? 0,
      u.cache_read_input_tokens ?? 0,
      u.cache_creation_input_tokens ?? 0,
    ];
    t.in += i;
    t.out += o;
    t.read += cr;
    t.write += cw;
    t.cost += (i * r[0] + o * r[1] + cr * r[2] + cw * r[3]) / 1e6;
    if (e.message.model) t.models.add(e.message.model);
  }
  return t;
}

const k = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
const row = (label, t) =>
  `${label.padEnd(24)} ${String(t.calls).padStart(3)} calls  in ${k(t.in).padStart(6)}  out ${k(t.out).padStart(6)}  cache r/w ${k(t.read)}/${k(t.write)}  ~$${t.cost.toFixed(3)}`;

let input = '';
for await (const chunk of process.stdin) input += chunk;
const { transcript_path: path } = JSON.parse(input || '{}');
if (!path || !existsSync(path)) process.exit(0);

const main = readJsonl(path);
const lastPrompt = main.findLast(isPrompt);
if (!lastPrompt) process.exit(0);
const since = lastPrompt.timestamp;

const rows = [['main', tally(main, since)]];
const subDir = join(path.replace(/\.jsonl$/, ''), 'subagents');
if (existsSync(subDir)) {
  for (const f of readdirSync(subDir).filter((n) => n.endsWith('.jsonl'))) {
    const t = tally(readJsonl(join(subDir, f)), since);
    if (!t.calls) continue;
    let name = basename(f, '.jsonl');
    try {
      const meta = JSON.parse(
        readFileSync(join(subDir, f.replace(/\.jsonl$/, '.meta.json')), 'utf8'),
      );
      name = `${meta.agentType}${meta.description ? `: ${meta.description}` : ''}`.slice(0, 24);
    } catch {}
    rows.push([`  ↳ ${name}`, t]);
  }
}

const total = rows.reduce(
  (a, [, t]) => ({
    calls: a.calls + t.calls,
    in: a.in + t.in,
    out: a.out + t.out,
    read: a.read + t.read,
    write: a.write + t.write,
    cost: a.cost + t.cost,
  }),
  { calls: 0, in: 0, out: 0, read: 0, write: 0, cost: 0 },
);

const lines = ['Task usage (estimated):', ...rows.map(([l, t]) => row(l, t))];
if (rows.length > 1) lines.push(row('TOTAL', total));
console.log(JSON.stringify({ systemMessage: lines.join('\n') }));
