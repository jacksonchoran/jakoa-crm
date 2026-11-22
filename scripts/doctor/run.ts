// Evaluates every service for one environment and phase. Pure apart from the
// injected fetch, DNS and file checks, so tests can drive it completely.

import { LIVE_CHECKS, type CheckContext, type LiveResult } from './checks.ts';
import { ENV_VARS, REPO_FILES, SERVICES, type AppEnv, type Env, type Phase, type ServiceDef } from './registry.ts';

export type ConfigStatus = 'yes' | 'missing' | 'invalid' | 'not used here' | 'later';

export interface Row {
  service: ServiceDef;
  /** True when this row counts toward the exit code for the chosen phase. */
  due: boolean;
  config: ConfigStatus;
  configLabel: string;
  live: LiveResult;
  missing: string[];
  invalid: { name: string; problem: string }[];
  fix: string[];
}

export interface RunOptions {
  env: Env;
  appEnv: AppEnv;
  phase: Phase;
  offline: boolean;
  fetch: typeof fetch;
  lookupHost: (host: string) => Promise<boolean>;
  fileExists: (path: string) => boolean;
  timeoutMs?: number;
}

export interface Report {
  appEnv: AppEnv;
  phase: Phase;
  rows: Row[];
  ok: boolean;
}

const isSet = (v: string | undefined): v is string => typeof v === 'string' && v.trim().length > 0;

function uniq(xs: string[]): string[] {
  return [...new Set(xs)];
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export async function runDoctor(opts: RunOptions): Promise<Report> {
  const ctx: CheckContext = {
    env: opts.env,
    appEnv: opts.appEnv,
    fetch: opts.fetch,
    lookupHost: opts.lookupHost,
    timeoutMs: opts.timeoutMs ?? 8000,
  };

  const rows = await Promise.all(
    SERVICES.map(async (service): Promise<Row> => {
      const later = service.phase > opts.phase;
      const vars = ENV_VARS.filter((v) => v.service === service.id);
      const required = vars.filter((v) => v.requiredIn.includes(opts.appEnv) && v.phase <= Math.max(opts.phase, service.phase));
      const missing = required.filter((v) => !isSet(opts.env[v.name])).map((v) => v.name);
      const invalid = vars
        .filter((v) => isSet(opts.env[v.name]) && v.validate)
        .map((v) => ({ name: v.name, problem: v.validate!(opts.env[v.name]!.trim(), opts.env, opts.appEnv) }))
        .filter((x): x is { name: string; problem: string } => x.problem !== null);

      let config: ConfigStatus;
      let configLabel: string;
      let fix = uniq([
        ...required.filter((v) => missing.includes(v.name)).map((v) => v.task),
        ...vars.filter((v) => invalid.some((i) => i.name === v.name)).map((v) => v.task),
      ]);
      const usedHere = service.id === 'github' || vars.some((v) => v.requiredIn.includes(opts.appEnv));

      if (service.id === 'github') {
        const absent = REPO_FILES.filter((f) => !f.anyOf.some((p) => opts.fileExists(p)));
        missing.push(...absent.map((f) => f.label));
        config = absent.length ? 'missing' : 'yes';
        configLabel = absent.length ? plural(absent.length, 'repo file') + ' missing' : 'yes';
        if (absent.length) fix = ['Claude'];
      } else if (!usedHere) {
        config = 'not used here';
        configLabel = `not used in ${opts.appEnv}`;
      } else if (invalid.length) {
        config = 'invalid';
        configLabel = `${invalid.length} invalid`;
      } else if (missing.length) {
        config = later ? 'later' : 'missing';
        configLabel =
          later && missing.length === required.length
            ? `phase ${service.phase}`
            : `missing ${missing.length} of ${required.length}`;
      } else {
        config = 'yes';
        configLabel = 'yes';
      }

      let live: LiveResult;
      if (config !== 'yes') {
        live = { status: 'not checked', detail: config === 'not used here' || config === 'later' ? undefined : 'configure it first' };
      } else if (opts.offline && service.id !== 'github') {
        live = { status: 'not checked', detail: 'offline mode' };
      } else {
        const check = LIVE_CHECKS[service.id];
        live = check ? await check(ctx) : { status: 'not checked' };
      }
      if (live.status === 'failing' || live.status === 'check by hand') {
        fix = uniq([...fix, ...(live.fix ?? service.liveFix)]);
      }

      return { service, due: !later && config !== 'not used here', config, configLabel, live, missing, invalid, fix };
    }),
  );

  const ok = rows.every(
    (r) => !r.due || (r.config === 'yes' && r.live.status !== 'failing'),
  );
  return { appEnv: opts.appEnv, phase: opts.phase, rows, ok };
}
