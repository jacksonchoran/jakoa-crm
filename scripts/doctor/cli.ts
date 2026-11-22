// npm run doctor [-- options]
//
//   --env local|staging|production   which environment's rules to apply
//                                    (default: APP_ENV, otherwise local)
//   --env-file PATH                  load settings from a file first (repeatable)
//   --phase 1..5                     which phase must be ready (default 1)
//   --offline                        skip live checks
//   --json                           machine readable output
//
// Exit code 0 when everything the chosen phase needs is configured and not
// failing, 1 otherwise, 2 for a usage error.
//
// For production, do not copy production secrets to a laptop. From phase 1
// the deployed app answers the same checks itself (remote mode), so the only
// value a laptop needs is DOCTOR_TOKEN.

import { existsSync } from 'node:fs';
import { lookup } from 'node:dns/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runDoctor } from './run.ts';
import { renderJson, renderReport } from './render.ts';
import type { AppEnv, Phase } from './registry.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

function usage(msg: string): never {
  process.stderr.write(`${msg}\nUsage: npm run doctor -- [--env local|staging|production] [--env-file PATH] [--phase 1..5] [--offline] [--json]\n`);
  process.exit(2);
}

const args = process.argv.slice(2);
let appEnvArg: string | undefined;
let phase: Phase = 1;
let offline = false;
let json = false;
const envFiles: string[] = [];

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--env') appEnvArg = args[++i];
  else if (a === '--env-file') {
    const f = args[++i];
    if (!f) usage('--env-file needs a path');
    envFiles.push(f);
  } else if (a === '--phase') {
    const n = Number(args[++i]);
    if (![1, 2, 3, 4, 5].includes(n)) usage('--phase must be 1 to 5');
    phase = n as Phase;
  } else if (a === '--offline') offline = true;
  else if (a === '--json') json = true;
  else if (a === '--help' || a === '-h') usage('Jakoa CRM setup checker.');
  else usage(`Unknown option ${a}`);
}

for (const f of envFiles) {
  if (!existsSync(f)) usage(`No such file: ${f}`);
  process.loadEnvFile(f);
}

const appEnvRaw = appEnvArg ?? process.env.APP_ENV ?? 'local';
if (!['local', 'staging', 'production'].includes(appEnvRaw)) usage('--env must be local, staging or production');
const appEnv = appEnvRaw as AppEnv;

const sourceNote = envFiles.length
  ? `Settings read from ${envFiles.length === 1 ? 'one file' : `${envFiles.length} files`} plus the shell.`
  : 'Settings read from the shell environment only.';

const report = await runDoctor({
  env: process.env,
  appEnv,
  phase,
  offline,
  fetch: globalThis.fetch,
  lookupHost: async (host) => {
    try {
      await lookup(host);
      return true;
    } catch {
      return false;
    }
  },
  fileExists: (p) => existsSync(join(repoRoot, p)),
});

process.stdout.write((json ? renderJson(report, process.env) : renderReport(report, process.env, sourceNote)) + '\n');
process.exit(report.ok ? 0 : 1);
