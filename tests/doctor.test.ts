import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildEnvExample } from '../scripts/doctor/env-example.ts';
import { ENV_VARS, SERVICES, TASK_TITLES, supabaseRegionProblem, type AppEnv, type Env, type Phase } from '../scripts/doctor/registry.ts';
import { runDoctor } from '../scripts/doctor/run.ts';
import { makeRedactor, renderJson, renderReport } from '../scripts/doctor/render.ts';

const ownerTasks = readFileSync(new URL('../docs/OWNER_TASKS.md', import.meta.url), 'utf8');

// A complete, valid looking production configuration. Every secret is unique
// and easy to spot so the leak test can search for it.
const SUPA_HOST = 'aws-0-ca-central-1.pooler.supabase.com';
function fullEnv(): Env {
  return {
    APP_ENV: 'production',
    APP_BASE_URL: 'https://crm.jakoa.ca',
    CRON_SECRET: 'leakcheck-cron-0123456789abcdef0123456789',
    DOCTOR_TOKEN: 'leakcheck-doctor-0123456789abcdef012345678',
    NEXT_PUBLIC_SUPABASE_URL: 'https://abcdefghijklmnop.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_leakcheckpub123456',
    SUPABASE_SECRET_KEY: 'sb_secret_leakchecksecret1234567890',
    SUPABASE_DB_URL: `postgresql://postgres.abcdefghijklmnop:leakcheckdbpass@${SUPA_HOST}:5432/postgres`,
    BACKUP_S3_BUCKET: 'jakoa-crm-backups-123456',
    BACKUP_S3_REGION: 'ca-west-1',
    BACKUP_S3_ACCESS_KEY_ID: 'AKIA' + 'LEAKCHECK1234567', // split so secret scanners do not flag a fake key
    BACKUP_S3_SECRET_ACCESS_KEY: 'leakcheck/s3secret/0123456789abcdefghijklmn',
    BACKUP_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64'),
    RESTORE_DRILL_DB_URL: `postgresql://postgres.qrstuvwxyzabcdef:leakcheckdrillpass@${SUPA_HOST}:5432/postgres`,
    BETTERSTACK_HEARTBEAT_BACKUP_URL: 'https://uptime.betterstack.com/api/v1/heartbeat/leakcheckbackupbeat',
    BETTERSTACK_HEARTBEAT_HEALTH_URL: 'https://uptime.betterstack.com/api/v1/heartbeat/leakcheckhealthbeat',
    HUBSPOT_SERVICE_KEY: 'leakcheck-hubspot-service-key-0123456789',
  };
}

function fakeFetch(behaviour: Partial<{ twilioType: string }> = {}): typeof fetch {
  return (async (input: string | URL | Request) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    const echo = JSON.stringify(fullEnv()); // a hostile service that echoes secrets back
    if (url.hostname === 'api.twilio.com') {
      if (url.pathname.endsWith('IncomingPhoneNumbers.json')) {
        return new Response(JSON.stringify({ incoming_phone_numbers: [{ capabilities: { voice: true, sms: true } }], echo }), { status: 200 });
      }
      return new Response(JSON.stringify({ type: behaviour.twilioType ?? 'Full', status: 'active', echo }), { status: 200 });
    }
    if (url.hostname === 'challenges.cloudflare.com') {
      return new Response(JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'], echo }), { status: 200 });
    }
    return new Response(echo, { status: 200 });
  }) as typeof fetch;
}

const throwingFetch = (async () => {
  const err = new Error(`connect failed for ${fullEnv().SUPABASE_SECRET_KEY}`);
  (err as Error & { cause: unknown }).cause = { code: 'ECONNREFUSED' };
  throw err;
}) as unknown as typeof fetch;

async function run(env: Env, appEnv: AppEnv = 'production', phase: Phase = 1, f: typeof fetch = fakeFetch(), offline = false) {
  return runDoctor({ env, appEnv, phase, offline, fetch: f, lookupHost: async () => true, fileExists: () => true });
}

describe('registry and docs stay in sync', () => {
  it('.env.example matches the registry exactly', () => {
    const committed = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
    expect(committed).toBe(buildEnvExample());
  });

  it('every task id the doctor names exists in docs/OWNER_TASKS.md', () => {
    const ids = new Set([...ENV_VARS.map((v) => v.task), ...SERVICES.flatMap((s) => s.liveFix), ...Object.keys(TASK_TITLES)]);
    for (const id of ids) expect(ownerTasks, `task ${id}`).toContain(`**${id}**`);
  });

  it('every environment variable is explained in docs/OWNER_TASKS.md', () => {
    for (const v of ENV_VARS) expect(ownerTasks, v.name).toContain(v.name);
  });

  it('descriptions contain no hyphens or dashes', () => {
    const texts = [...ENV_VARS.map((v) => v.what), ...Object.values(TASK_TITLES), ...SERVICES.map((s) => s.name)];
    for (const t of texts) expect(t, t).not.toMatch(/[–—]|\w-\w|\s-\s/);
  });

  it('.env.example never carries a value for a secret', () => {
    for (const v of ENV_VARS.filter((x) => x.secret)) expect(v.example, v.name).toBeUndefined();
  });
});

describe('the doctor never prints a secret', () => {
  const secrets = ENV_VARS.filter((v) => v.secret)
    .map((v) => fullEnv()[v.name])
    .filter((v): v is string => Boolean(v));

  for (const [label, f, offline] of [
    ['hostile responses', fakeFetch(), false],
    ['network errors that contain secrets', throwingFetch, false],
    ['offline', fakeFetch(), true],
  ] as const) {
    it(`with ${label}`, async () => {
      const env = fullEnv();
      const report = await run(env, 'production', 5, f, offline);
      const text = renderReport(report, env, 'test') + renderJson(report, env);
      for (const s of secrets) expect(text).not.toContain(s);
      expect(text).not.toContain('leakcheck');
    });
  }

  it('the redactor hides secret values and credential shaped strings on its own', () => {
    const env = fullEnv();
    const redact = makeRedactor(env);
    const leaked = `a ${env.SUPABASE_SECRET_KEY} b ${env.CRON_SECRET} c sk-ant-api03-abcdefghijkl d ${'AKIA' + 'ABCDEFGHIJKLMNOP'}`;
    const out = redact(leaked);
    expect(out).not.toContain('leakcheck');
    expect(out).not.toContain('sk-ant-api03');
    expect(out).not.toContain('AKIA' + 'ABCDEFGHIJKLMNOP');
    expect(out).toContain('[hidden]');
  });

  it('even when a secret is invalid', async () => {
    const env = { ...fullEnv(), BACKUP_ENCRYPTION_KEY: 'leakcheck-not-base64-key', CRON_SECRET: 'leakcheck-short' };
    const report = await run(env);
    const text = renderReport(report, env, 'test');
    expect(text).toContain('BACKUP_ENCRYPTION_KEY');
    expect(text).not.toContain('leakcheck');
  });
});

describe('status logic', () => {
  it('an empty production environment is not ready and points at owner tasks', async () => {
    const report = await run({}, 'production', 1);
    expect(report.ok).toBe(false);
    const supa = report.rows.find((r) => r.service.id === 'supabase')!;
    expect(supa.configLabel).toBe('missing 4 of 4');
    expect(supa.fix).toContain('SB1');
    const twilio = report.rows.find((r) => r.service.id === 'twilio')!;
    expect(twilio.due).toBe(false);
    expect(twilio.configLabel).toBe('phase 4');
  });

  it('a complete phase 1 production setup with healthy services is ready', async () => {
    const report = await run(fullEnv(), 'production', 1);
    const notReady = report.rows.filter((r) => r.due && (r.config !== 'yes' || r.live.status === 'failing'));
    expect(notReady.map((r) => r.service.id)).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it('services production does not use in staging say so', async () => {
    const report = await run({ APP_ENV: 'staging' }, 'staging', 4);
    const twilio = report.rows.find((r) => r.service.id === 'twilio')!;
    expect(twilio.config).toBe('not used here');
    expect(twilio.due).toBe(false);
  });

  it('flags a database outside Canada', () => {
    expect(supabaseRegionProblem('postgresql://u:p@aws-0-us-east-1.pooler.supabase.com:5432/postgres')).toMatch(/outside Canada/);
    expect(supabaseRegionProblem(`postgresql://u:p@${SUPA_HOST}:5432/postgres`)).toBeNull();
  });

  it('refuses a restore drill target that is the production database', async () => {
    const env = { ...fullEnv() };
    env.RESTORE_DRILL_DB_URL = env.SUPABASE_DB_URL;
    const report = await run(env);
    const backups = report.rows.find((r) => r.service.id === 'backups')!;
    expect(backups.invalid.map((i) => i.problem).join(' ')).toMatch(/PRODUCTION database/);
    expect(report.ok).toBe(false);
  });

  it('catches a secret key placed in a browser variable', async () => {
    const env = { ...fullEnv(), NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_wrongplace123456' };
    const report = await run(env);
    const supa = report.rows.find((r) => r.service.id === 'supabase')!;
    expect(supa.config).toBe('invalid');
  });

  it('refuses real QuickBooks books outside production', async () => {
    const report = await run({ QBO_ENVIRONMENT: 'production' }, 'staging', 3);
    const qbo = report.rows.find((r) => r.service.id === 'quickbooks')!;
    expect(qbo.invalid[0]?.problem).toMatch(/sandbox outside production/);
  });

  it('reports a Twilio trial account as failing with the upgrade task', async () => {
    const env = {
      ...fullEnv(),
      TWILIO_ACCOUNT_SID: 'AC' + 'a'.repeat(32),
      TWILIO_API_KEY_SID: 'SK' + 'b'.repeat(32),
      TWILIO_API_KEY_SECRET: 'c'.repeat(32),
      TWILIO_PHONE_NUMBER: '+15145550100',
    };
    const report = await run(env, 'production', 4, fakeFetch({ twilioType: 'Trial' }));
    const twilio = report.rows.find((r) => r.service.id === 'twilio')!;
    expect(twilio.live.status).toBe('failing');
    expect(twilio.fix).toContain('TW2');
  });

  it('a network failure is reported without crashing', async () => {
    const report = await run(fullEnv(), 'production', 1, throwingFetch);
    const supa = report.rows.find((r) => r.service.id === 'supabase')!;
    expect(supa.live.status).toBe('failing');
    expect(supa.live.detail).toBe('the connection was refused');
  });
});
