// Prints .env.example from the registry. Regenerate with: npm run env:example
// A test fails if the committed file differs from this output.

import { ENV_VARS, SERVICES } from './registry.ts';

export function buildEnvExample(): string {
  const lines: string[] = [
    '# Jakoa CRM environment variables. Generated from scripts/doctor/registry.ts by npm run env:example; do not edit by hand.',
    '# Never put real values here. Real values live only in Vercel and Supabase, entered by Jackson or Noah (docs/OWNER_TASKS.md, item VC2).',
    '# For local work copy this file to .env.local (ignored by git) and fill in local values only.',
    '# Each comment says: what it is. Service. OWNER_TASKS item that produces it. Secret or not. First phase that needs it. Where it must be set.',
  ];
  for (const s of SERVICES) {
    const vars = ENV_VARS.filter((v) => v.service === s.id);
    if (!vars.length) continue;
    lines.push('', `# ${s.name}`);
    for (const v of vars) {
      lines.push(
        `# ${v.what}. Service: ${s.name}. Task: ${v.task}. Secret: ${v.secret ? 'yes' : 'no'}. Phase: ${v.phase}. Required in: ${v.requiredIn.join(', ')}.`,
      );
      lines.push(`${v.name}=${v.example ?? ''}`);
    }
  }
  return lines.join('\n') + '\n';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(buildEnvExample());
}
