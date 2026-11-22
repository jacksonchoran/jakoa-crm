// Live checks: each one makes a harmless read only request and reports
// working or failing in plain words. They never print response bodies,
// never write anything, never refresh or rotate tokens, and never ping a
// heartbeat (that would hide a dead job).

import type { AppEnv, Env, ServiceId } from './registry.ts';

export type LiveStatus = 'working' | 'failing' | 'not checked' | 'check by hand';

export interface LiveResult {
  status: LiveStatus;
  detail?: string;
  /** OWNER_TASKS item that fixes this particular failure, when it is specific. */
  fix?: string[];
}

export interface CheckContext {
  env: Env;
  appEnv: AppEnv;
  fetch: typeof fetch;
  lookupHost: (host: string) => Promise<boolean>;
  timeoutMs: number;
}

type LiveCheck = (ctx: CheckContext) => Promise<LiveResult>;

async function request(ctx: CheckContext, url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ctx.timeoutMs);
  try {
    return await ctx.fetch(url, { ...init, signal: controller.signal, redirect: 'manual' });
  } finally {
    clearTimeout(timer);
  }
}

/** Turns a network error into words without echoing anything sensitive. */
export function describeError(err: unknown): string {
  if (err instanceof Error && err.name === 'AbortError') return 'no answer before the timeout';
  const cause = (err as { cause?: { code?: unknown } } | null)?.cause;
  const code = cause && typeof cause.code === 'string' ? cause.code : undefined;
  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') return 'the address does not resolve (DNS)';
  if (code === 'ECONNREFUSED') return 'the connection was refused';
  if (code) return `network error ${code}`;
  return 'network error';
}

const fail = (detail: string, fix?: string[]): LiveResult => ({ status: 'failing', detail, ...(fix ? { fix } : {}) });

const checkApp: LiveCheck = async (ctx) => {
  const base = ctx.env.APP_BASE_URL ?? '';
  let url: URL;
  try {
    url = new URL(base);
  } catch {
    return fail('APP_BASE_URL is not a URL');
  }
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return { status: 'not checked', detail: 'local address; start the app and open it in a browser' };
  }
  if (!(await ctx.lookupHost(url.hostname))) {
    return fail(`${url.hostname} does not resolve yet`, ['DNS1']);
  }
  try {
    const res = await request(ctx, new URL('/api/health', url).toString());
    if (res.status === 200) return { status: 'working' };
    if (res.status === 404) return fail('the domain answers but the app is not deployed there yet', ['VC1']);
    return fail(`health endpoint answered HTTP ${res.status}`, ['VC1']);
  } catch (err) {
    return fail(describeError(err), ['VC1', 'DNS1']);
  }
};

const checkSupabase: LiveCheck = async (ctx) => {
  const base = ctx.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const pub = ctx.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
  const secret = ctx.env.SUPABASE_SECRET_KEY ?? '';
  try {
    const health = await request(ctx, new URL('/auth/v1/health', base).toString(), { headers: { apikey: pub } });
    if (health.status === 401 || health.status === 403) return fail('the publishable key does not belong to this project');
    if (health.status !== 200) return fail(`auth health answered HTTP ${health.status}`);
    const rest = await request(ctx, new URL('/rest/v1/', base).toString(), {
      headers: { apikey: secret, authorization: `Bearer ${secret}` },
    });
    await rest.body?.cancel();
    if (rest.status === 401 || rest.status === 403) return fail('the secret key does not belong to this project');
    if (rest.status >= 500) return fail(`database API answered HTTP ${rest.status}`);
    return { status: 'working', detail: ctx.env.SUPABASE_DB_URL?.includes('.pooler.supabase.com') ? 'region confirmed Canada' : undefined };
  } catch (err) {
    return fail(describeError(err));
  }
};

const checkHubspot: LiveCheck = async (ctx) => {
  try {
    const res = await request(ctx, 'https://api.hubapi.com/account-info/v3/details', {
      headers: { authorization: `Bearer ${ctx.env.HUBSPOT_SERVICE_KEY ?? ''}` },
    });
    await res.body?.cancel();
    if (res.status === 200) return { status: 'working' };
    if (res.status === 401) return fail('HubSpot rejected the key');
    if (res.status === 403) return fail('the key works but lacks a scope; add the read scopes listed in HS1');
    return fail(`HubSpot answered HTTP ${res.status}`);
  } catch (err) {
    return fail(describeError(err));
  }
};

const checkTurnstile: LiveCheck = async (ctx) => {
  try {
    const body = new URLSearchParams({ secret: ctx.env.TURNSTILE_SECRET_KEY ?? '', response: 'doctor-probe' });
    const res = await request(ctx, 'https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const json = (await res.json()) as { 'error-codes'?: string[] };
    const codes = json['error-codes'] ?? [];
    if (codes.includes('invalid-input-secret')) return fail('Cloudflare rejected the secret key');
    return { status: 'working' };
  } catch (err) {
    return fail(describeError(err));
  }
};

const checkAnthropic: LiveCheck = async (ctx) => {
  const headers = { 'x-api-key': ctx.env.ANTHROPIC_API_KEY ?? '', 'anthropic-version': '2023-06-01' };
  try {
    const model = ctx.env.ANTHROPIC_EXTRACTION_MODEL ?? '';
    const res = await request(ctx, `https://api.anthropic.com/v1/models/${encodeURIComponent(model)}`, { headers });
    await res.body?.cancel();
    if (res.status === 200) return { status: 'working' };
    if (res.status === 401) return fail('the API key was rejected');
    if (res.status === 404) return fail('the key works but that model id does not exist');
    return fail(`Claude API answered HTTP ${res.status}`);
  } catch (err) {
    return fail(describeError(err));
  }
};

const checkTwilio: LiveCheck = async (ctx) => {
  const sid = ctx.env.TWILIO_ACCOUNT_SID ?? '';
  const auth = Buffer.from(`${ctx.env.TWILIO_API_KEY_SID ?? ''}:${ctx.env.TWILIO_API_KEY_SECRET ?? ''}`).toString('base64');
  const headers = { authorization: `Basic ${auth}` };
  try {
    const acct = await request(ctx, `https://api.twilio.com/2010-04-01/Accounts/${sid}.json`, { headers });
    if (acct.status === 401) return fail('Twilio rejected the API key', ['TW5']);
    if (acct.status === 403) return fail('the key lacks permission to read the account; see the permission list in TW5', ['TW5']);
    if (acct.status !== 200) return fail(`Twilio answered HTTP ${acct.status}`);
    const info = (await acct.json()) as { type?: string; status?: string };
    if (info.status && info.status !== 'active') return fail(`the account is ${info.status}`, ['TW2']);
    if (info.type === 'Trial') return fail('the account is still a trial and cannot ring unverified phones', ['TW2']);
    const q = new URLSearchParams({ PhoneNumber: ctx.env.TWILIO_PHONE_NUMBER ?? '' });
    const nums = await request(ctx, `https://api.twilio.com/2010-04-01/Accounts/${sid}/IncomingPhoneNumbers.json?${q}`, { headers });
    if (nums.status === 403) return fail('the key lacks permission to read phone numbers; see TW5', ['TW5']);
    if (nums.status !== 200) return fail(`phone number lookup answered HTTP ${nums.status}`);
    const list = (await nums.json()) as { incoming_phone_numbers?: { capabilities?: { voice?: boolean; sms?: boolean } }[] };
    const num = list.incoming_phone_numbers?.[0];
    if (!num) return fail('this account does not own TWILIO_PHONE_NUMBER', ['TW3']);
    if (!num.capabilities?.voice || !num.capabilities?.sms) return fail('the number is missing voice or SMS capability', ['TW3']);
    return { status: 'working' };
  } catch (err) {
    return fail(describeError(err));
  }
};

const checkMeta: LiveCheck = async (ctx) => {
  const id = ctx.env.META_APP_ID ?? '';
  const token = `${id}|${ctx.env.META_APP_SECRET ?? ''}`;
  const version = ctx.env.META_GRAPH_API_VERSION ?? 'v25.0';
  try {
    const q = new URLSearchParams({ fields: 'id', access_token: token });
    const res = await request(ctx, `https://graph.facebook.com/${version}/${id}?${q}`);
    await res.body?.cancel();
    if (res.status === 200) return { status: 'working' };
    if (res.status === 400 || res.status === 401 || res.status === 403) return fail('Meta rejected the app id and secret pair');
    return fail(`Meta answered HTTP ${res.status}`);
  } catch (err) {
    return fail(describeError(err));
  }
};

const notCheckedHere = (detail: string): LiveCheck => async () => ({ status: 'not checked', detail });

export const LIVE_CHECKS: Partial<Record<ServiceId, LiveCheck>> = {
  app: checkApp,
  supabase: checkSupabase,
  backups: notCheckedHere('the System page shows the last backup and restore drill'),
  monitoring: notCheckedHere('heartbeats are never pinged by the doctor; Better Stack shows them'),
  github: async () => ({ status: 'check by hand', detail: 'Dependabot and two factor settings live in GitHub', fix: ['GH1'] }),
  hubspot: checkHubspot,
  google: notCheckedHere('needs the in app Google connection; the System page shows it'),
  website: notCheckedHere('the System page shows the last signed form received'),
  turnstile: checkTurnstile,
  anthropic: checkAnthropic,
  quickbooks: notCheckedHere('checking would rotate tokens; the System page shows the connection'),
  twilio: checkTwilio,
  meta: checkMeta,
};
