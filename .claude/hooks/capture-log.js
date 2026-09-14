#!/usr/bin/env node
// Agent capture hook for Claude Code.
// Wired to SessionStart, UserPromptSubmit and Stop in .claude/settings.json.
// Appends each prompt and the final response of each turn to
// .agent-logs/YYYY-MM-DD_HH-MM-SS_<session-id>.md. Entries are append-only;
// only the frontmatter counters are rewritten.
//
// Any turn the hook missed (e.g. turns sent before the hook was installed, or
// a Stop that fired before the transcript was flushed) is backfilled from the
// session transcript, using the transcript's own timestamps.

const fs = require('fs');
const os = require('os');
const path = require('path');

const AUTHOR = 'abdullah61305';
const TOOL = 'claude-code';
const PROJECT = 'amazon-clone';

function readStdin() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// ---------- transcript parsing ----------

function readTranscript(p) {
  if (!p || !fs.existsSync(p)) return [];
  const out = [];
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try {
      out.push(JSON.parse(line));
    } catch {
      // partially written last line
    }
  }
  return out;
}

function isHumanPrompt(e) {
  if (e.type !== 'user' || e.isSidechain || e.isMeta || e.toolUseResult) return false;
  const c = e.message && e.message.content;
  if (Array.isArray(c) && c.some((b) => b.type === 'tool_result')) return false;
  if (e.origin && e.origin.kind) return e.origin.kind === 'human';
  return typeof c === 'string' || (Array.isArray(c) && c.some((b) => b.type === 'text'));
}

function promptText(e) {
  const c = e.message.content;
  if (typeof c === 'string') return c;
  return c.filter((b) => b.type === 'text').map((b) => b.text).join('\n\n');
}

function isToolResult(e) {
  const c = e.message && e.message.content;
  return e.type === 'user' && (e.toolUseResult || (Array.isArray(c) && c.some((b) => b.type === 'tool_result')));
}

// Returns [{prompt, promptTs, response, responseTs, model}] for the main chain.
function parseTurns(entries) {
  const turns = [];
  let cur = null;
  let lastModel = null;
  for (const e of entries) {
    if (e.isSidechain) continue;
    if (isHumanPrompt(e)) {
      cur = { prompt: promptText(e), promptTs: e.timestamp, promptModel: lastModel, textsAfterTool: [], allTexts: [], model: null };
      turns.push(cur);
      continue;
    }
    if (!cur) continue;
    if (isToolResult(e)) {
      cur.textsAfterTool = [];
      continue;
    }
    if (e.type === 'assistant' && e.message) {
      if (e.message.model && e.message.model !== '<synthetic>') {
        cur.model = e.message.model;
        lastModel = e.message.model;
      }
      const c = e.message.content;
      const texts = Array.isArray(c) ? c.filter((b) => b.type === 'text' && b.text.trim()) : [];
      for (const b of texts) {
        const t = { text: b.text, ts: e.timestamp };
        cur.textsAfterTool.push(t);
        cur.allTexts.push(t);
      }
    }
  }
  for (const t of turns) {
    const src = t.textsAfterTool.length ? t.textsAfterTool : t.allTexts.slice(-1);
    t.response = src.length ? src.map((x) => x.text).join('\n\n') : null;
    t.responseTs = src.length ? src[src.length - 1].ts : null;
  }
  return turns;
}

// ---------- log file ----------

function logDir(input) {
  return path.join(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd(), '.agent-logs');
}

function findLog(dir, sessionId) {
  if (!fs.existsSync(dir)) return null;
  const f = fs.readdirSync(dir).find((n) => n.endsWith(`_${sessionId}.md`));
  return f ? path.join(dir, f) : null;
}

function fileStamp(iso) {
  return iso.replace('T', '_').replace(/:/g, '-').replace(/\.\d+Z$/, '').replace(/Z$/, '');
}

function readBody(file) {
  if (!file || !fs.existsSync(file)) return '';
  const raw = fs.readFileSync(file, 'utf8');
  const i = raw.indexOf('\n[LOG_ENTRY ');
  return i === -1 ? '' : raw.slice(i + 1);
}

function parseBody(body, short) {
  const entries = [];
  const re = new RegExp(`^\\[LOG_ENTRY type=(PROMPT|RESPONSE) num=(\\d+) session=${short}\\]\\ntimestamp: (\\S+)\\nmodel: .*\\n\\n`, 'gm');
  let m;
  const marks = [];
  while ((m = re.exec(body))) marks.push({ type: m[1], num: +m[2], ts: m[3], start: m.index, textStart: m.index + m[0].length });
  marks.forEach((mk, i) => {
    const end = i + 1 < marks.length ? marks[i + 1].start : body.length;
    entries.push({ ...mk, text: body.slice(mk.textStart, end).replace(/\n\n\n$/, '') });
  });
  return entries;
}

function entryBlock(type, num, short, ts, model, text) {
  return `[LOG_ENTRY type=${type} num=${num} session=${short}]\ntimestamp: ${ts}\nmodel: ${model || 'unknown'}\n\n${text}\n\n\n`;
}

function header(sessionId, short, body) {
  const prompts = parseBody(body, short).filter((e) => e.type === 'PROMPT');
  const first = prompts.length ? prompts[0].ts : new Date().toISOString();
  const last = prompts.length ? prompts[prompts.length - 1].ts : first;
  const models = [...body.matchAll(/^model: (.+)$/gm)].map((m) => m[1]).filter((m) => m !== 'unknown');
  const model = [...new Set(models)].join(', ') || 'unknown';
  const date = first.slice(0, 10);
  return [
    '---',
    `session_id: ${sessionId}`,
    `date: ${date}`,
    `author: ${AUTHOR}`,
    `model: ${model}`,
    `tool: ${TOOL}`,
    `project: ${PROJECT}`,
    `total_exchanges: ${prompts.length}`,
    `first_prompt_time: ${first}`,
    `last_prompt_time: ${last}`,
    '---',
    '',
    `# Session Log - ${date}`,
    '',
    `Session: \`${short}\` | Project: \`${PROJECT}\` | Author: \`${AUTHOR}\``,
    '',
    '---',
    '',
    '',
  ].join('\n');
}

// ---------- model cache (so the first prompt of a session has a model) ----------

function cachePath(sessionId) {
  return path.join(os.tmpdir(), `agent-capture-model-${sessionId}.txt`);
}

function cachedModel(sessionId) {
  try {
    return fs.readFileSync(cachePath(sessionId), 'utf8').trim() || null;
  } catch {
    return null;
  }
}

function normaliseModel(m) {
  if (!m) return null;
  if (typeof m === 'object') m = m.id || m.name || m.display_name;
  return String(m).replace(/\[1m\]$/i, '');
}

// ---------- main ----------

function main() {
  const input = readStdin();
  const event = input.hook_event_name;
  const sessionId = input.session_id;
  if (!sessionId) return;
  const short = sessionId.slice(0, 8);

  if (event === 'SessionStart') {
    const m = normaliseModel(input.model);
    if (m) fs.writeFileSync(cachePath(sessionId), m);
    return;
  }
  if (event !== 'UserPromptSubmit' && event !== 'Stop') return;

  let turns = parseTurns(readTranscript(input.transcript_path));

  const dir = logDir(input);
  fs.mkdirSync(dir, { recursive: true });
  let file = findLog(dir, sessionId);
  let body = readBody(file);
  let logged = parseBody(body, short);

  const fallbackModel = () => {
    for (let i = turns.length - 1; i >= 0; i--) if (turns[i].model) return turns[i].model;
    return cachedModel(sessionId) || normaliseModel(process.env.ANTHROPIC_MODEL) || 'unknown';
  };

  // Which transcript turns are "history" vs the live turn this event is about.
  let history = turns;
  if (event === 'UserPromptSubmit') {
    const last = turns[turns.length - 1];
    if (last && last.prompt === input.prompt && !last.response) history = turns.slice(0, -1);
  } else {
    // Stop: the live turn is the last one; wait briefly for its text to be flushed.
    for (let i = 0; i < 15 && turns.length && !turns[turns.length - 1].response && !input.last_assistant_message; i++) {
      sleep(200);
      turns = parseTurns(readTranscript(input.transcript_path));
    }
    history = turns.slice(0, -1);
  }

  const append = [];
  const promptCount = () => logged.filter((e) => e.type === 'PROMPT').length + append.filter((e) => e.type === 'PROMPT').length;
  const hasResponse = (n) => logged.some((e) => e.type === 'RESPONSE' && e.num === n) || append.some((e) => e.type === 'RESPONSE' && e.num === n);
  const add = (type, num, ts, model, text) => append.push({ type, num, ts, model, text });

  // Backfill: completed turns that are missing a prompt or response entry.
  history.forEach((t, i) => {
    const n = i + 1;
    if (n > promptCount()) add('PROMPT', n, t.promptTs, t.promptModel || t.model || fallbackModel(), t.prompt);
    if (t.response && !hasResponse(n)) add('RESPONSE', n, t.responseTs, t.model || fallbackModel(), t.response);
  });

  if (event === 'UserPromptSubmit') {
    const n = history.length + 1;
    if (n > promptCount()) add('PROMPT', n, new Date().toISOString(), fallbackModel(), input.prompt);
  } else if (turns.length) {
    const live = turns[turns.length - 1];
    const n = turns.length;
    if (n > promptCount()) add('PROMPT', n, live.promptTs, live.promptModel || live.model || fallbackModel(), live.prompt);
    const text = live.response || input.last_assistant_message;
    if (text) {
      const prev = logged.filter((e) => e.type === 'RESPONSE' && e.num === n).pop();
      // A Stop can fire more than once for a prompt (e.g. a background task
      // re-invokes the agent). Log each distinct final response.
      if (!prev || prev.text !== text) add('RESPONSE', n, (live.response && live.responseTs) || new Date().toISOString(), live.model || fallbackModel(), text);
    }
  }

  if (!append.length) return;

  body += append.map((e) => entryBlock(e.type, e.num, short, e.ts, e.model, e.text)).join('');
  if (!file) {
    const firstTs = parseBody(body, short)[0].ts;
    file = path.join(dir, `${fileStamp(firstTs)}_${sessionId}.md`);
  }
  fs.writeFileSync(file, header(sessionId, short, body) + body);
}

try {
  main();
} catch (err) {
  try {
    fs.appendFileSync(path.join(os.tmpdir(), 'agent-capture-errors.log'), `${new Date().toISOString()} ${err.stack}\n`);
  } catch {}
}
process.exit(0);
