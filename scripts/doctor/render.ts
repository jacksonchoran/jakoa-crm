// Turns a report into the plain English table. Every string that leaves the
// doctor passes through redact(), which removes the value of every secret
// variable and anything shaped like a known credential, as a second safety
// net behind the rule that checks never put values into messages.

import { plural, type Report } from './run.ts';
import { ENV_VARS, TASK_TITLES, type Env } from './registry.ts';

const CREDENTIAL_SHAPES: RegExp[] = [
  /sk-ant-[A-Za-z0-9_-]{8,}/g,
  /sb_secret_[A-Za-z0-9_-]{8,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /SK[0-9a-f]{32}/g,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
  /postgres(?:ql)?:\/\/[^\s]+/g,
];

export function makeRedactor(env: Env): (text: string) => string {
  const secrets = ENV_VARS.filter((v) => v.secret)
    .map((v) => env[v.name]?.trim())
    .filter((v): v is string => typeof v === 'string' && v.length >= 4)
    .sort((a, b) => b.length - a.length);
  return (text: string) => {
    let out = text;
    for (const s of secrets) out = out.split(s).join('[hidden]');
    for (const re of CREDENTIAL_SHAPES) out = out.replace(re, '[hidden]');
    return out;
  };
}

function pad(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length);
}

function table(headers: string[], rows: string[][]): string {
  const widths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => (r[i] ?? '').length)));
  const line = (l: string, m: string, r: string) => l + widths.map((w) => '─'.repeat(w + 2)).join(m) + r;
  const row = (cells: string[]) => '│' + cells.map((c, i) => ' ' + pad(c, widths[i]!) + ' ').join('│') + '│';
  return [line('┌', '┬', '┐'), row(headers), line('├', '┼', '┤'), ...rows.map(row), line('└', '┴', '┘')].join('\n');
}

const byDocOrder = (ids: string[]) => [...ids].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
const fixLabel = (ids: string[]) => (ids.length ? byDocOrder(ids).join(', ') : 'none');

export function renderReport(report: Report, env: Env, sourceNote: string): string {
  const redact = makeRedactor(env);
  const out: string[] = [];
  out.push('Jakoa CRM doctor');
  out.push(`Environment checked: ${report.appEnv}. Phase checked: ${report.phase}. ${sourceNote}`);
  out.push('Values are never printed; only names of settings and plain reasons.');
  out.push('');

  const rows = report.rows.map((r) => [
    r.service.name,
    String(r.service.phase),
    r.configLabel,
    r.config === 'later' ? '' : r.live.status,
    r.due || r.config === 'later' ? fixLabel(r.fix) : '',
  ]);
  out.push(table(['Service', 'Phase', 'Configured', 'Working', 'Fix in OWNER_TASKS'], rows));

  const todo = report.rows.filter((r) => r.due && (r.config !== 'yes' || r.live.status === 'failing'));
  if (todo.length) {
    out.push('');
    out.push('What to do, in order:');
    for (const r of todo) {
      const parts: string[] = [];
      if (r.service.id === 'github' && r.missing.length) {
        parts.push(`missing ${r.missing.join(' and ')}; Claude adds these while building phase 1`);
      } else if (r.missing.length) {
        parts.push(`missing ${r.missing.join(', ')}`);
      }
      for (const i of r.invalid) parts.push(`${i.name} ${i.problem}`);
      if (r.live.status === 'failing' && r.live.detail) parts.push(r.live.detail);
      const tasks = byDocOrder(r.fix)
        .filter((id) => id !== 'Claude')
        .map((id) => (TASK_TITLES[id] ? `${id} (${TASK_TITLES[id]})` : id));
      const enter = r.missing.length && r.service.id !== 'github' && !r.fix.includes('VC2') ? '; then enter the values as described in VC2' : '';
      out.push(`* ${r.service.name}: ${parts.join('; ')}.${tasks.length ? ` Fix: ${tasks.join(', ')}${enter}.` : ''}`);
    }
  }

  const notes = report.rows.filter((r) => r.due && r.config === 'yes' && r.live.detail && r.live.status !== 'failing');
  if (notes.length) {
    out.push('');
    out.push('Notes:');
    for (const r of notes) {
      const byHand = r.live.status === 'check by hand' ? ` Confirm ${fixLabel(r.live.fix ?? r.service.liveFix)} is ticked in docs/OWNER_TASKS.md.` : '';
      out.push(`* ${r.service.name}: ${r.live.detail}.${byHand}`);
    }
  }

  const due = report.rows.filter((r) => r.due);
  const ready = due.filter((r) => r.config === 'yes' && r.live.status !== 'failing');
  out.push('');
  out.push(
    `Result: ${ready.length} of ${plural(due.length, 'service')} needed by phase ${report.phase} ${ready.length === 1 ? 'is' : 'are'} ready. ` +
      (report.ok ? 'Everything due is in place.' : 'Not ready yet.'),
  );
  return redact(out.join('\n'));
}

export function renderJson(report: Report, env: Env): string {
  const redact = makeRedactor(env);
  const data = {
    environment: report.appEnv,
    phase: report.phase,
    ok: report.ok,
    services: report.rows.map((r) => ({
      id: r.service.id,
      name: r.service.name,
      phase: r.service.phase,
      due: r.due,
      configured: r.config,
      missing: r.missing,
      invalid: r.invalid,
      working: r.live.status,
      detail: r.live.detail ?? null,
      fix: r.fix,
    })),
  };
  return redact(JSON.stringify(data, null, 2));
}
