// Single source of truth for every environment variable the app needs.
// .env.example is generated from this file (npm run env:example) and a test
// fails if the two drift apart, or if a task id here is missing from
// docs/OWNER_TASKS.md. Descriptions are written without hyphens or dashes.

export type AppEnv = 'local' | 'staging' | 'production';
export type Phase = 1 | 2 | 3 | 4 | 5;

export type ServiceId =
  | 'app'
  | 'supabase'
  | 'backups'
  | 'monitoring'
  | 'github'
  | 'hubspot'
  | 'google'
  | 'website'
  | 'turnstile'
  | 'anthropic'
  | 'quickbooks'
  | 'twilio'
  | 'meta';

export type Env = Record<string, string | undefined>;

export interface EnvVar {
  name: string;
  /** One line, plain English, no hyphens. */
  what: string;
  service: ServiceId;
  /** OWNER_TASKS item that produces the value. */
  task: string;
  secret: boolean;
  /** First phase that needs it. */
  phase: Phase;
  /** Environments where it must be set. */
  requiredIn: AppEnv[];
  /** Safe default written into .env.example. Never a real secret. */
  example?: string;
  /** Returns a problem description, or null. Must never include the value. */
  validate?: (value: string, env: Env, appEnv: AppEnv) => string | null;
}

export interface ServiceDef {
  id: ServiceId;
  name: string;
  phase: Phase;
  /** OWNER_TASKS items that fix a failing live check. */
  liveFix: string[];
}

export const SERVICES: ServiceDef[] = [
  { id: 'app', name: 'App and domain', phase: 1, liveFix: ['VC1', 'DNS1'] },
  { id: 'supabase', name: 'Supabase database', phase: 1, liveFix: ['SB1', 'SB2', 'VC2'] },
  { id: 'backups', name: 'Backups in Canada', phase: 1, liveFix: ['BK1'] },
  { id: 'monitoring', name: 'Uptime monitoring', phase: 1, liveFix: ['MON2'] },
  { id: 'github', name: 'GitHub repository', phase: 1, liveFix: ['GH1'] },
  { id: 'hubspot', name: 'HubSpot import', phase: 1, liveFix: ['HS1'] },
  { id: 'google', name: 'Google Gmail Calendar', phase: 2, liveFix: ['GC6', 'GC7'] },
  { id: 'website', name: 'Website form', phase: 2, liveFix: ['NF1'] },
  { id: 'turnstile', name: 'Inquiry form shield', phase: 2, liveFix: ['TS1'] },
  { id: 'anthropic', name: 'Claude API', phase: 2, liveFix: ['AN1'] },
  { id: 'quickbooks', name: 'QuickBooks', phase: 3, liveFix: ['QB1', 'QB2'] },
  { id: 'twilio', name: 'Twilio phone line', phase: 4, liveFix: ['TW2', 'TW3', 'TW5'] },
  { id: 'meta', name: 'Instagram Facebook', phase: 4, liveFix: ['META1', 'META2'] },
];

/** Short titles for OWNER_TASKS items referenced by the doctor. */
export const TASK_TITLES: Record<string, string> = {
  GH1: 'GitHub security settings',
  SB1: 'Supabase production project',
  SB2: 'Supabase staging project',
  VC1: 'Vercel team and project',
  VC2: 'Vercel environment variables',
  DNS1: 'DNS records at GoDaddy',
  BK1: 'Backup bucket in Canada',
  MON1: 'Better Stack account',
  MON2: 'Monitors and heartbeats',
  HS1: 'HubSpot read only key',
  GC1: 'Google Cloud projects',
  GC4: 'Pub/Sub topic for Gmail',
  GC5: 'Pub/Sub push subscription',
  GC6: 'Google OAuth client',
  GC7: 'Connect Google in the CRM',
  GC8: 'Google Picker key',
  GW3: 'Shared Jakoa calendar',
  GW4: 'Gmail staging label',
  NF1: 'Netlify form webhook',
  TS1: 'Cloudflare Turnstile keys',
  AN1: 'Claude API key with spend limit',
  QB1: 'Intuit app and sandbox',
  QB2: 'Intuit production keys',
  TW2: 'Twilio upgrade out of trial',
  TW3: 'Twilio 514 number',
  TW5: 'Twilio restricted API key',
  META1: 'Meta app',
  META2: 'Meta webhook',
};

// Validators. Each returns a problem in plain words, never the value itself.

const isHttpsUrl = (v: string): boolean => {
  try {
    return new URL(v).protocol === 'https:';
  } catch {
    return false;
  }
};

const minLength = (n: number) => (v: string) =>
  v.length >= n ? null : `must be at least ${n} characters (generate it with the command in the task)`;

const httpsUrl = (v: string) => (isHttpsUrl(v) ? null : 'must be an https URL');

const pattern = (re: RegExp, problem: string) => (v: string) => (re.test(v) ? null : problem);

const E164 = /^\+[1-9]\d{7,14}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const postgresUrl = (v: string): string | null => {
  try {
    const u = new URL(v);
    if (u.protocol !== 'postgres:' && u.protocol !== 'postgresql:') return 'must start with postgresql://';
    return null;
  } catch {
    return 'is not a valid connection string';
  }
};

/** Supabase pooler hosts carry the AWS region, so we can prove the database is in Canada. */
export function supabaseRegionProblem(dbUrl: string): string | null {
  let host: string;
  try {
    host = new URL(dbUrl).hostname;
  } catch {
    return null;
  }
  const m = host.match(/^aws-\d+-([a-z]+-[a-z]+-\d+)\.pooler\.supabase\.com$/);
  if (m && m[1] !== 'ca-central-1') {
    return `points at a database outside Canada (region ${m[1]}); the project must be in Canada (Central)`;
  }
  return null;
}

export const ENV_VARS: EnvVar[] = [
  // App and domain
  {
    name: 'APP_ENV',
    what: 'Which environment this is: local, staging or production. Anything other than production can never reach real outside people',
    service: 'app',
    task: 'VC2',
    secret: false,
    phase: 1,
    requiredIn: ['local', 'staging', 'production'],
    example: 'local',
    validate: pattern(/^(local|staging|production)$/, 'must be exactly local, staging or production'),
  },
  {
    name: 'APP_BASE_URL',
    what: 'Public address of the app; passkeys are bound to its host name',
    service: 'app',
    task: 'VC2',
    secret: false,
    phase: 1,
    requiredIn: ['local', 'staging', 'production'],
    example: 'http://localhost:3000',
    validate: (v, _env, appEnv) => {
      if (appEnv === 'local') return /^https?:\/\//.test(v) ? null : 'must be a URL';
      if (!isHttpsUrl(v)) return 'must be an https URL';
      const host = new URL(v).hostname;
      if (appEnv === 'production' && host !== 'crm.jakoa.ca') return 'must be https://crm.jakoa.ca in production';
      if (appEnv === 'staging' && host === 'crm.jakoa.ca') return 'staging must not use the production address';
      return null;
    },
  },
  {
    name: 'OUTBOUND_ALLOWLIST',
    what: 'Comma separated emails, @domains and E.164 phones that local and staging may contact; everyone else is blocked in code',
    service: 'app',
    task: 'VC2',
    secret: false,
    phase: 1,
    requiredIn: ['local', 'staging'],
    validate: (v) => {
      const bad = v
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .filter((s) => !(EMAIL.test(s) || /^@[^\s@]+\.[^\s@]+$/.test(s) || E164.test(s)));
      return bad.length ? `has ${bad.length} ${bad.length === 1 ? 'entry that is' : 'entries that are'} not an email, @domain or E.164 phone` : null;
    },
  },
  {
    name: 'CRON_SECRET',
    what: 'Random string that scheduled jobs present so nobody else can trigger them',
    service: 'app',
    task: 'VC2',
    secret: true,
    phase: 1,
    requiredIn: ['staging', 'production'],
    validate: minLength(32),
  },
  {
    name: 'DOCTOR_TOKEN',
    what: 'Random string that lets npm run doctor ask the deployed app for its health without holding any other secret',
    service: 'app',
    task: 'VC2',
    secret: true,
    phase: 1,
    requiredIn: ['staging', 'production'],
    validate: minLength(32),
  },

  // Supabase
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    what: 'Supabase project URL, safe in the browser',
    service: 'supabase',
    task: 'SB1',
    secret: false,
    phase: 1,
    requiredIn: ['local', 'staging', 'production'],
    example: 'http://127.0.0.1:54321',
    validate: (v, _env, appEnv) => {
      if (appEnv === 'local') return /^https?:\/\//.test(v) ? null : 'must be a URL';
      return isHttpsUrl(v) ? null : 'must be an https URL';
    },
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    what: 'Supabase publishable key, safe in the browser because Row Level Security guards every table',
    service: 'supabase',
    task: 'SB1',
    secret: false,
    phase: 1,
    requiredIn: ['local', 'staging', 'production'],
    validate: (v) => {
      if (v.startsWith('sb_secret_')) return 'holds a SECRET key; a secret key in a browser variable would expose the whole database';
      return null;
    },
  },
  {
    name: 'SUPABASE_SECRET_KEY',
    what: 'Supabase secret key for server code only; it bypasses Row Level Security',
    service: 'supabase',
    task: 'SB1',
    secret: true,
    phase: 1,
    requiredIn: ['local', 'staging', 'production'],
    validate: (v) => (v.startsWith('sb_publishable_') ? 'holds the publishable key, not the secret key' : null),
  },
  {
    name: 'SUPABASE_DB_URL',
    what: 'Postgres connection string (session pooler) used by migrations and the nightly backup',
    service: 'supabase',
    task: 'SB1',
    secret: true,
    phase: 1,
    requiredIn: ['staging', 'production'],
    validate: (v) => postgresUrl(v) ?? supabaseRegionProblem(v),
  },

  // Backups
  {
    name: 'BACKUP_S3_BUCKET',
    what: 'Name of the bucket that holds the nightly encrypted backup',
    service: 'backups',
    task: 'BK1',
    secret: false,
    phase: 1,
    requiredIn: ['production'],
    validate: pattern(/^[a-z0-9][a-z0-9.\-]{1,61}[a-z0-9]$/, 'is not a valid bucket name'),
  },
  {
    name: 'BACKUP_S3_REGION',
    what: 'AWS region of the backup bucket; must be a Canadian region',
    service: 'backups',
    task: 'BK1',
    secret: false,
    phase: 1,
    requiredIn: ['production'],
    example: 'ca-west-1',
    validate: pattern(/^ca-(west|central)-1$/, 'must be a Canadian region (ca-west-1 Calgary or ca-central-1 Montreal)'),
  },
  {
    name: 'BACKUP_S3_ACCESS_KEY_ID',
    what: 'Access key id of the backup user that can only write and read that one bucket',
    service: 'backups',
    task: 'BK1',
    secret: true,
    phase: 1,
    requiredIn: ['production'],
    validate: pattern(/^AKIA[0-9A-Z]{16}$/, 'does not look like an AWS access key id'),
  },
  {
    name: 'BACKUP_S3_SECRET_ACCESS_KEY',
    what: 'Secret access key of the backup user',
    service: 'backups',
    task: 'BK1',
    secret: true,
    phase: 1,
    requiredIn: ['production'],
    validate: minLength(40),
  },
  {
    name: 'BACKUP_ENCRYPTION_KEY',
    what: 'Key that encrypts every backup before it leaves Supabase; also kept in the password manager and on paper',
    service: 'backups',
    task: 'BK1',
    secret: true,
    phase: 1,
    requiredIn: ['production'],
    validate: (v) => {
      const bytes = Buffer.from(v, 'base64');
      return bytes.length === 32 ? null : 'must be 32 random bytes in base64 (use the command in BK1)';
    },
  },
  {
    name: 'RESTORE_DRILL_DB_URL',
    what: 'Connection string of the scratch database the monthly restore drill fills and then wipes',
    service: 'backups',
    task: 'SB2',
    secret: true,
    phase: 1,
    requiredIn: ['production'],
    validate: (v, env) => {
      const p = postgresUrl(v) ?? supabaseRegionProblem(v);
      if (p) return p;
      if (env.SUPABASE_DB_URL && sameDatabase(v, env.SUPABASE_DB_URL)) {
        return 'points at the PRODUCTION database; the drill would overwrite live data';
      }
      return null;
    },
  },

  // Monitoring
  {
    name: 'BETTERSTACK_HEARTBEAT_BACKUP_URL',
    what: 'Heartbeat the nightly backup calls when it succeeds; silence for a day raises an alert',
    service: 'monitoring',
    task: 'MON2',
    secret: true,
    phase: 1,
    requiredIn: ['production'],
    validate: httpsUrl,
  },
  {
    name: 'BETTERSTACK_HEARTBEAT_HEALTH_URL',
    what: 'Heartbeat the daily health job calls; silence means the scheduler itself is down',
    service: 'monitoring',
    task: 'MON2',
    secret: true,
    phase: 1,
    requiredIn: ['production'],
    validate: httpsUrl,
  },

  // HubSpot (production only, removed after the switch off)
  {
    name: 'HUBSPOT_SERVICE_KEY',
    what: 'HubSpot service key with read only scopes, used for the import and the 14 day daily diff, then deleted',
    service: 'hubspot',
    task: 'HS1',
    secret: true,
    phase: 1,
    requiredIn: ['production'],
    validate: minLength(20),
  },

  // Google
  {
    name: 'GOOGLE_CLOUD_PROJECT_ID',
    what: 'Google Cloud project id for this environment',
    service: 'google',
    task: 'GC1',
    secret: false,
    phase: 2,
    requiredIn: ['staging', 'production'],
    validate: pattern(/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/, 'is not a valid Google Cloud project id'),
  },
  {
    name: 'GOOGLE_OAUTH_CLIENT_ID',
    what: 'OAuth client id of the Internal Google app',
    service: 'google',
    task: 'GC6',
    secret: false,
    phase: 2,
    requiredIn: ['staging', 'production'],
    validate: pattern(/\.apps\.googleusercontent\.com$/, 'must end in .apps.googleusercontent.com'),
  },
  {
    name: 'GOOGLE_OAUTH_CLIENT_SECRET',
    what: 'OAuth client secret of the Internal Google app',
    service: 'google',
    task: 'GC6',
    secret: true,
    phase: 2,
    requiredIn: ['staging', 'production'],
    validate: minLength(20),
  },
  {
    name: 'GOOGLE_PUBSUB_TOPIC',
    what: 'Full name of the Pub/Sub topic Gmail publishes new mail notices to',
    service: 'google',
    task: 'GC4',
    secret: false,
    phase: 2,
    requiredIn: ['staging', 'production'],
    validate: pattern(/^projects\/[a-z][a-z0-9-]{4,28}[a-z0-9]\/topics\/[A-Za-z][\w.~+%-]{2,254}$/, 'must look like projects/PROJECT/topics/NAME'),
  },
  {
    name: 'GOOGLE_PUBSUB_PUSH_SERVICE_ACCOUNT',
    what: 'Service account that signs each Pub/Sub push; any push signed by anyone else is rejected',
    service: 'google',
    task: 'GC5',
    secret: false,
    phase: 2,
    requiredIn: ['staging', 'production'],
    validate: pattern(/^[a-z][a-z0-9-]{4,28}[a-z0-9]@[a-z][a-z0-9-]{4,28}[a-z0-9]\.iam\.gserviceaccount\.com$/, 'must be a service account email ending in .iam.gserviceaccount.com'),
  },
  {
    name: 'GMAIL_MAILBOX',
    what: 'Mailbox the CRM reads and drafts replies in',
    service: 'google',
    task: 'GC7',
    secret: false,
    phase: 2,
    requiredIn: ['staging', 'production'],
    example: 'info@jakoa.ca',
    validate: pattern(EMAIL, 'must be an email address'),
  },
  {
    name: 'GMAIL_STAGING_LABEL',
    what: 'Staging only: the Gmail label staging is allowed to process; must be empty in production',
    service: 'google',
    task: 'GW4',
    secret: false,
    phase: 2,
    requiredIn: ['staging'],
    validate: (v, _env, appEnv) => (appEnv === 'production' && v ? 'must not be set in production (production would ignore real mail)' : null),
  },
  {
    name: 'GOOGLE_CALENDAR_ID',
    what: 'Id of the shared Jakoa calendar (a separate test calendar in staging)',
    service: 'google',
    task: 'GW3',
    secret: false,
    phase: 2,
    requiredIn: ['staging', 'production'],
    validate: pattern(EMAIL, 'must look like an email, usually ending in @group.calendar.google.com'),
  },
  {
    name: 'NEXT_PUBLIC_GOOGLE_PICKER_API_KEY',
    what: 'Browser key for the Google Picker, locked to the app address, so Drive access stays per file',
    service: 'google',
    task: 'GC8',
    secret: false,
    phase: 3,
    requiredIn: ['staging', 'production'],
    validate: pattern(/^AIza[0-9A-Za-z_-]{35}$/, 'does not look like a Google API key'),
  },
  {
    name: 'GOOGLE_CLOUD_PROJECT_NUMBER',
    what: 'Numeric Google Cloud project number, which the Picker needs as its app id',
    service: 'google',
    task: 'GC1',
    secret: false,
    phase: 3,
    requiredIn: ['staging', 'production'],
    validate: pattern(/^\d{6,20}$/, 'must be digits only'),
  },

  // Website form (Netlify)
  {
    name: 'NETLIFY_FORMS_JWS_SECRET',
    what: 'Shared secret Netlify uses to sign each website form submission it posts to the CRM',
    service: 'website',
    task: 'NF1',
    secret: true,
    phase: 2,
    requiredIn: ['production'],
    validate: minLength(32),
  },

  // Turnstile
  {
    name: 'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
    what: 'Cloudflare Turnstile site key for the hosted inquiry form',
    service: 'turnstile',
    task: 'TS1',
    secret: false,
    phase: 2,
    requiredIn: ['staging', 'production'],
    validate: (v, _env, appEnv) => {
      if (appEnv === 'production' && /^[123]x0{20}/.test(v)) return 'is a Cloudflare test key; production needs the real site key';
      return null;
    },
  },
  {
    name: 'TURNSTILE_SECRET_KEY',
    what: 'Cloudflare Turnstile secret key used by the server to verify each form',
    service: 'turnstile',
    task: 'TS1',
    secret: true,
    phase: 2,
    requiredIn: ['staging', 'production'],
    validate: (v, _env, appEnv) => {
      if (appEnv === 'production' && /^[123]x0{30}/.test(v)) return 'is a Cloudflare test key; production needs the real secret key';
      return null;
    },
  },

  // Claude API
  {
    name: 'ANTHROPIC_API_KEY',
    what: 'Claude API key from a workspace with a monthly spend limit; used only for the no tools extraction step',
    service: 'anthropic',
    task: 'AN1',
    secret: true,
    phase: 2,
    requiredIn: ['staging', 'production'],
    validate: pattern(/^sk-ant-/, 'does not look like a Claude API key'),
  },
  {
    name: 'ANTHROPIC_EXTRACTION_MODEL',
    what: 'Claude model id for extraction; changing it needs no code change',
    service: 'anthropic',
    task: 'AN1',
    secret: false,
    phase: 2,
    requiredIn: ['staging', 'production'],
    example: 'claude-opus-5-5',
    validate: pattern(/^claude-[a-z0-9-]+$/, 'must be a Claude model id'),
  },

  // QuickBooks
  {
    name: 'QBO_ENVIRONMENT',
    what: 'sandbox or production; staging must always use sandbox',
    service: 'quickbooks',
    task: 'QB1',
    secret: false,
    phase: 3,
    requiredIn: ['staging', 'production'],
    example: 'sandbox',
    validate: (v, _env, appEnv) => {
      if (v !== 'sandbox' && v !== 'production') return 'must be sandbox or production';
      if (appEnv !== 'production' && v === 'production') return 'must be sandbox outside production (it would touch the real books)';
      if (appEnv === 'production' && v !== 'production') return 'must be production in production';
      return null;
    },
  },
  {
    name: 'QBO_CLIENT_ID',
    what: 'Intuit app client id (sandbox keys in staging, production keys in production)',
    service: 'quickbooks',
    task: 'QB1',
    secret: false,
    phase: 3,
    requiredIn: ['staging', 'production'],
    validate: minLength(20),
  },
  {
    name: 'QBO_CLIENT_SECRET',
    what: 'Intuit app client secret',
    service: 'quickbooks',
    task: 'QB1',
    secret: true,
    phase: 3,
    requiredIn: ['staging', 'production'],
    validate: minLength(20),
  },
  {
    name: 'QBO_WEBHOOK_VERIFIER_TOKEN',
    what: 'Intuit webhook verifier token used to check the signature on every QuickBooks webhook',
    service: 'quickbooks',
    task: 'QB1',
    secret: true,
    phase: 3,
    requiredIn: ['staging', 'production'],
    validate: minLength(20),
  },

  // Twilio
  {
    name: 'TWILIO_ACCOUNT_SID',
    what: 'Twilio Account SID (starts with AC); an identifier, not a password',
    service: 'twilio',
    task: 'TW1',
    secret: false,
    phase: 4,
    requiredIn: ['production'],
    validate: pattern(/^AC[0-9a-f]{32}$/, 'must be AC followed by 32 hex characters'),
  },
  {
    name: 'TWILIO_API_KEY_SID',
    what: 'SID of the restricted API key made for this app (starts with SK)',
    service: 'twilio',
    task: 'TW5',
    secret: false,
    phase: 4,
    requiredIn: ['production'],
    validate: pattern(/^SK[0-9a-f]{32}$/, 'must be SK followed by 32 hex characters'),
  },
  {
    name: 'TWILIO_API_KEY_SECRET',
    what: 'Secret of the restricted API key; never the account Auth Token',
    service: 'twilio',
    task: 'TW5',
    secret: true,
    phase: 4,
    requiredIn: ['production'],
    validate: minLength(32),
  },
  {
    name: 'TWILIO_PHONE_NUMBER',
    what: 'The Jakoa tracking line in E.164 form, for example +15145550100',
    service: 'twilio',
    task: 'TW3',
    secret: false,
    phase: 4,
    requiredIn: ['production'],
    validate: pattern(/^\+1(514|438)\d{7}$/, 'must be a +1 514 or +1 438 number in E.164 form'),
  },

  // Meta
  {
    name: 'META_APP_ID',
    what: 'Meta app id (created under Jackson\'s own profile)',
    service: 'meta',
    task: 'META1',
    secret: false,
    phase: 4,
    requiredIn: ['production'],
    validate: pattern(/^\d{10,20}$/, 'must be digits only'),
  },
  {
    name: 'META_APP_SECRET',
    what: 'Meta app secret, used to check the signature on every Messenger and Instagram webhook',
    service: 'meta',
    task: 'META1',
    secret: true,
    phase: 4,
    requiredIn: ['production'],
    validate: pattern(/^[0-9a-f]{32}$/, 'must be 32 hex characters'),
  },
  {
    name: 'META_WEBHOOK_VERIFY_TOKEN',
    what: 'Random string we choose and also type into the Meta webhook settings',
    service: 'meta',
    task: 'META2',
    secret: true,
    phase: 4,
    requiredIn: ['production'],
    validate: minLength(32),
  },
  {
    name: 'META_GRAPH_API_VERSION',
    what: 'Graph API version the app is pinned to, as shown in the Meta app dashboard',
    service: 'meta',
    task: 'META1',
    secret: false,
    phase: 4,
    requiredIn: ['production'],
    validate: pattern(/^v\d{2}\.\d$/, 'must look like v25.0'),
  },
];

function sameDatabase(a: string, b: string): boolean {
  try {
    const ua = new URL(a);
    const ub = new URL(b);
    const user = (u: URL) => decodeURIComponent(u.username).split('.').slice(1).join('.') || decodeURIComponent(u.username);
    return ua.hostname === ub.hostname && ua.pathname === ub.pathname && user(ua) === user(ub);
  } catch {
    return false;
  }
}

/** Files the repository must hold once phase 1 is built. */
export const REPO_FILES: { anyOf: string[]; label: string }[] = [
  { anyOf: ['.github/dependabot.yml', 'renovate.json'], label: 'dependency update config' },
  { anyOf: ['.github/workflows/ci.yml'], label: 'CI workflow' },
];
