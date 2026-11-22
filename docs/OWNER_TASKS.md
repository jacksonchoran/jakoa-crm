# Owner tasks

Everything on this list can only be done by Jackson or Noah. Claude keeps it current: when Claude finds a new task it adds it here and tells you in one line.

How to use it:

* Do the items in order. `DO THIS FIRST` blocks phase 1 (plus Twilio, which you are doing this week).
* When you finish one, tick its box (edit this file on GitHub with the pencil icon) or just tell Claude "TW3 done" and Claude ticks it.
* Never paste a key, token or password into the chat. Every value below goes into the password manager (PM1) and then straight into a dashboard field. If you start to paste one, Claude will stop you.
* Dashboards rename buttons often. If a step does not match what you see, tell Claude the item id and what the screen shows; Claude fixes the step here.
* `npm run doctor` prints which of these are still missing, by item id.

Last checked against the vendors' current documentation: 22 November 2026.

# DO THIS FIRST

## A. Now (no decision needed)

* [ ] **PM1** Set up a shared password manager for the two of you
  * Who: Jackson, then Noah accepts. Time: 20 minutes.
  * Why: every key and recovery code below needs a home that is not chat, email or a notes app, and Noah must be able to reach all of them if Jackson is unavailable.
  * Start: https://bitwarden.com/go/start-free/ (skip this item if you already share a password manager; use that one).
  * Steps:
    1. Create an account with info@jakoa.ca and a long master password you write down and keep at home.
    2. Turn on two step login: **Settings**, **Security**, **Two step login**, choose **Authenticator app** (or a passkey).
    3. Click **New organization**, name it "Productions Jakoa", choose the **Free** plan (two people).
    4. In the organization, **Members**, **Invite member**, enter noah@jakoa.ca, role **Admin**. Noah accepts from his email and sets up his own two step login.
    5. Create a collection named "Jakoa CRM". Every value in this file goes there, named "Jakoa CRM / <what it is>".
  * Produces: a shared vault. Goes to: used by every item below.

* [ ] **GH1** GitHub: lock down the repository
  * Who: Jackson. Time: 10 minutes.
  * Why: the code holds the security rules; the GitHub account is the key to changing them.
  * Start: https://github.com/settings/security
  * Steps:
    1. On that page, under **Two factor authentication**, make sure it is enabled (passkey or authenticator app, not SMS).
    2. Open https://github.com/jacksonchoran/jakoa-crm/settings and scroll to **Danger Zone**: it must say the repository is private.
    3. In the left sidebar under **Security**, open **Advanced Security** (older name **Code security**). Turn on **Dependency graph**, **Dependabot alerts** and **Dependabot security updates**.
    4. On the same page, look for **Secret Protection** or **Secret scanning**. GitHub only offers it for private repositories owned by an organization on a paid plan, so on a personal repository it will most likely be missing or say it needs an upgrade. That is fine: Claude adds a secret scanner (gitleaks) to CI in phase 1, which runs on every push. If the toggle is offered for free, turn it on.
    5. **Settings**, **General**, under **Pull Requests**: tick **Allow auto merge** and **Automatically delete head branches**.
    6. **Settings**, **Collaborators**, **Add people**: add Noah's GitHub account.
  * Produces: nothing to copy.

* [ ] **SB1** Supabase: organization and production project in Canada
  * Who: Jackson, then Noah accepts the invite. Time: 15 minutes.
  * Why: this is the database, sign in and file storage. Choosing the region now is permanent; a project cannot move regions later.
  * Start: https://supabase.com/dashboard
  * Steps:
    1. Sign up or sign in with info@jakoa.ca.
    2. Open https://supabase.com/dashboard/account/security and turn on multi factor authentication with an authenticator app.
    3. Click **New organization**: name "Productions Jakoa", type **Company**, plan **Pro** (US$25 a month, includes compute for one small project). Add the company card.
    4. In the new organization click **New project**: name `jakoa-crm-production`; **Database password**: click **Generate a password**, copy it into the password manager as "Jakoa CRM / Supabase production database password"; **Region**: **Canada (Central)** (this is AWS `ca-central-1`, which is in Montreal); compute size **Micro**. If you see an option to turn on Row Level Security automatically for new tables, turn it on. Click **Create new project**.
    5. **Organization settings**, **Billing**: leave **Spend cap** on. Set the billing email to info@jakoa.ca.
    6. **Organization settings**, **Team**, **Invite**: noah@jakoa.ca with role **Owner** (so Noah can run everything without Jackson). Noah accepts and turns on multi factor authentication too.
    7. If **Organization settings**, **Security** offers **Require MFA**, turn it on once Noah has set his up.
  * Produces: the database password (now) and, later, the project URL, keys and connection string, which you copy in VC2 directly from the dashboard. Goes to: password manager now; Vercel in VC2.

* [ ] **TW1** Twilio: create the account under info@jakoa.ca with two factor
  * Who: Jackson. Time: 15 minutes.
  * Why: the tracking phone line (phase 4). You are doing Twilio this week, so it sits here.
  * Start: https://www.twilio.com/try-twilio
  * Steps:
    1. Sign up with info@jakoa.ca and a password from the password manager. Verify the email and your mobile number.
    2. In the onboarding questions choose Voice and SMS, "with code", Node.js. Name the account "Productions Jakoa".
    3. Click your profile icon (top right), **User settings** or **Profile**, **Two factor authentication**: choose an authenticator app, not SMS. Save the backup code in the password manager.
    4. On the Console home page, copy the **Account SID** (starts with AC) into the password manager as "Jakoa CRM / Twilio Account SID".
    5. Do not copy the **Auth Token** anywhere. The app never uses it.
  * Produces: Account SID. Goes to: password manager now; Vercel `TWILIO_ACCOUNT_SID` (Production) in VC2 when phase 4 starts.

* [ ] **TW2** Twilio: upgrade out of the trial
  * Who: Jackson. Time: 10 minutes.
  * Why: trial accounts can only ring phone numbers you verified by hand, and they play a trial message on every call.
  * Start: the **Upgrade account** button in the Console banner (or **Billing and Usage**, **Upgrade**).
  * Steps:
    1. Enter the business details: 9578 4682 Québec inc., operating as Productions Jakoa, the business address, and the company card.
    2. Add the first top up Twilio asks for (it is in US dollars; Twilio bills in USD).
    3. Turn on **Auto recharge**: recharge US$20 when the balance drops below US$10, so the line never goes dead quietly. The usage alerts in TW6 protect against runaway spend.
  * Produces: nothing to copy. The doctor reports "still a trial" until this is done.

* [ ] **TW3** Twilio: buy a Canadian 514 number with voice and SMS
  * Who: Jackson. Time: 10 minutes. Cost: about US$1.15 a month.
  * Start: Console, **Phone Numbers**, **Manage**, **Buy a number**.
  * Steps:
    1. **Country**: Canada. Search by **Number** starting with 514. Tick **Voice** and **SMS** under capabilities. Click **Search**.
    2. Pick an easy number and click **Buy**. If no 514 number with both voice and SMS is offered, stop and tell Claude; 438 is the same Montreal area but it is your call.
    3. Open the new number's configuration page. If **A call comes in** or **A message comes in** shows a demo URL, clear it and click **Save configuration**. The app sets these from code later.
    4. Copy the number in the form +1514XXXXXXX into the password manager as "Jakoa CRM / Twilio phone number".
    5. Do not port or change 514 865 6397 or 514 515 9465.
  * Produces: phone number. Goes to: Vercel `TWILIO_PHONE_NUMBER` (Production) in VC2 at phase 4.

* [ ] **TW4** Twilio: finish any address or regulatory step it asks for
  * Who: Jackson. Time: 5 to 15 minutes.
  * Why: some numbers need a registered business address before they activate.
  * Steps:
    1. If the purchase screen or **Phone Numbers**, **Regulatory compliance** shows a required address or bundle, add the company's legal name and Dollard Des Ormeaux business address and submit.
    2. If Twilio asks for an emergency (911) address, you can add the business address. The number only forwards calls to your cells and never dials 911, but Twilio charges US$75 if a 911 call is ever made from a number with no address, so adding it costs nothing.
  * Produces: nothing to copy.

* [ ] **TW5** Twilio: create a restricted API key for this app
  * Who: Jackson. Time: 10 minutes.
  * Why: if the key ever leaked, it could only do what the app needs, and you can revoke it without touching the account.
  * Start: Console, **Account** or **Admin** menu, **API keys and tokens**, **Create API key**.
  * Steps:
    1. **Friendly name**: `jakoa-crm-production`. **Region**: United States (US1) (restricted keys only exist there). **Key type**: **Restricted**.
    2. Grant only these permissions (names may differ slightly; pick the closest):
       * Voice: Calls read, create, update; Recordings read, delete.
       * Messaging: Messages read, create.
       * Phone Numbers: Incoming phone numbers read, update (so the app can set its own webhooks).
       * Accounts: read (lets the doctor confirm the account is upgraded).
       * Webhooks or Event Streams signing keys, if listed: read, create (lets the app sign webhooks with its own key instead of the Auth Token).
       * Usage: Records read.
    3. Click **Create**. Copy the **SID** (starts with SK) and the **Secret** (shown only once) into the password manager as "Jakoa CRM / Twilio API key SID" and "Jakoa CRM / Twilio API key secret".
  * Produces: API key SID and secret. Goes to: Vercel `TWILIO_API_KEY_SID` and `TWILIO_API_KEY_SECRET` (Production, secret marked **Sensitive**) in VC2 at phase 4. If the doctor later says a permission is missing, it names which one.

* [ ] **TW6** Twilio: usage alerts at CA$20 and CA$40
  * Who: Jackson. Time: 5 minutes.
  * Why: a stuck loop or abuse should email you long before it costs real money.
  * Start: Console, **Billing and Usage**, **Usage and Spend**, **Usage Triggers** tab, **Create Usage Trigger**. (In the older Console: **Admin**, **Account billing**, **Usage**, **Triggers**.)
  * Steps:
    1. Twilio counts in US dollars. At today's rate (about 1.43) CA$20 is about US$14 and CA$40 about US$28.
    2. Trigger 1: name "Jakoa CA$20", usage category **Total price**, value 14, recurring **Monthly**, notify by **Email** to info@jakoa.ca.
    3. Trigger 2: same, name "Jakoa CA$40", value 28.
  * Produces: nothing to copy.

* [ ] **HS1** HubSpot: a read only service key for the import
  * Who: Jackson (needs Super Admin in HubSpot). Time: 10 minutes.
  * Why: the importer and the 14 day daily diff read HubSpot. HubSpot stopped allowing new "private apps" on 26 October 2026; **service keys** replace them for this kind of job.
  * Start: https://app.hubspot.com
  * Steps:
    1. In the main sidebar open **Development**, **Keys**, **Service keys** (also reachable from the settings gear, **Integrations**, **Service Keys**). If you cannot find either, tell Claude what you see.
    2. Click **Create service key**. Name: "Jakoa CRM import (read only)".
    3. Tick only read scopes. Search and tick: `crm.objects.contacts.read`, `crm.objects.companies.read`, `crm.objects.deals.read`, `crm.objects.owners.read`, `crm.schemas.contacts.read`, `crm.schemas.companies.read`, `crm.schemas.deals.read`. If `crm.objects.notes.read` and `crm.objects.tasks.read` are offered, tick them too (otherwise the contacts scope covers notes and tasks). Tick nothing that ends in `.write`.
    4. Click **Create**, confirm, and copy the key into the password manager as "Jakoa CRM / HubSpot service key".
  * Produces: service key. Goes to: Vercel `HUBSPOT_SERVICE_KEY` (Production only, **Sensitive**) in VC2. Deleted on day 15 (HS4).

* [ ] **GW1** Google Workspace: enforce two step verification and allow passkeys
  * Who: Jackson as Workspace admin, then Jackson and Noah on their own accounts. Time: 15 minutes.
  * Why: the CRM reads info@jakoa.ca. Whoever controls that mailbox controls client data, so it needs the same protection as the CRM. (The CRM's own passkeys live on crm.jakoa.ca and do not depend on this setting.)
  * Start: https://admin.google.com
  * Steps:
    1. **Security**, **Authentication**, `2-Step Verification`: tick **Allow users to turn on** it, set **Enforcement** to **On** from a date a week out, and under methods choose **Any except verification codes via text, phone call**. Save.
    2. **Security**, **Authentication**, **Passkeys**: allow users to skip passwords at sign in by using passkeys. Save.
    3. Jackson and Noah each open https://myaccount.google.com/signinoptions/passkeys and add a passkey on their phone and laptop.
  * Produces: nothing to copy.

## B. Right after you approve the plan (blocks phase 1)

* [ ] **D1** Approve `docs/PLAN.md` and its open decisions
  * Who: Jackson (with Noah). Time: 30 minutes.
  * Why: Claude writes no app code until you approve. The plan lists the few decisions only you can make (hosting, staging cost, the extraction model, GitHub plan, Noah's Vercel seat).
  * Steps: read `docs/PLAN.md`, then reply in chat "plan approved" plus your answer to each decision, or tell Claude what to change.

* [ ] **D2** Decide how French text handles hyphens
  * Who: Jackson. Time: 2 minutes. Needed before phase 2 writes client templates.
  * Why: the brief bans hyphens in generated text. French grammar and Quebec place names use them: words like `peut-être`, questions like `Pouvez-vous`, and names like `Vaudreuil-Dorion` and `Saint-Laurent`. Claude can always rephrase French to avoid them, but place names look wrong to francophone clients without them.
  * Steps: tell Claude one of: "ban everywhere" (rephrase French, write place names without hyphens) or "allow in French only where grammar or an official place name needs one" (Claude recommends this). Em dashes stay banned either way.

* [ ] **SB2** Supabase: staging project
  * Who: Jackson. Time: 10 minutes. Cost: about US$10 a month extra on Pro (see D1 for the cheaper option).
  * Why: staging must use a separate database so tests never touch client data.
  * Start: https://supabase.com/dashboard, organization "Productions Jakoa", **New project**.
  * Steps:
    1. Name `jakoa-crm-staging`, generate and store a new database password ("Jakoa CRM / Supabase staging database password"), region **Canada (Central)**, compute **Micro**, Row Level Security on by default if offered.
    2. This project also hosts the monthly restore drill's temporary copy. The drill creates a scratch schema, checks it and deletes it.
  * Produces: the staging URL, keys and connection string. Goes to: Vercel (Preview) in VC2, and `RESTORE_DRILL_DB_URL` (Production) in VC2.

* [ ] **GH2** GitHub Pro and a rule that protects `main` (only if D1 approves it)
  * Who: Jackson. Time: 10 minutes. Cost: US$4 a month.
  * Why: on a free personal account GitHub cannot require tests to pass before code reaches `main`, and safe automatic dependency merges rely on that rule.
  * Start: https://github.com/settings/billing/plans
  * Steps:
    1. Upgrade the personal account to **Pro**.
    2. Open https://github.com/jacksonchoran/jakoa-crm/settings/rules, **New ruleset**, **New branch ruleset**. Name "main", **Enforcement status** Active, **Target branches** add **Include default branch**.
    3. Tick **Restrict deletions**, **Block force pushes**, **Require a pull request before merging** (required approvals 0, so one of you can merge alone).
    4. Tick **Require status checks to pass** and add the check named `ci` once Claude tells you the first CI run has finished. Click **Create**.
  * Produces: nothing to copy.

* [ ] **VC1** Vercel: team and project (pinned to Montréal)
  * Who: Jackson. Time: 20 minutes. Cost: Pro is US$20 a month with one deploying seat; read only seats are free.
  * Why: hosts the app. Functions run in Vercel's Montréal region (`yul1`, AWS `ca-central-1`), so request data is processed in Canada.
  * Start: https://vercel.com/signup
  * Steps:
    1. Click **Continue with GitHub** and sign in as jacksonchoran.
    2. Create a team "Productions Jakoa" on the **Pro** plan (the free Hobby plan does not allow commercial use).
    3. Open https://vercel.com/account/settings/authentication and turn on two factor authentication (passkey or authenticator app).
    4. **Add New**, **Project**, **Import Git Repository**. When asked to install the Vercel GitHub app, choose **Only select repositories** and pick `jakoa-crm`. Click **Import**, then **Deploy**. The first build may fail until Claude pushes the app; that is expected.
    5. Project **Settings**, **Git**: production branch `main`.
    6. Project **Settings**, **Domains**, **Add**: `crm.jakoa.ca` (production). Add again: `staging.crm.jakoa.ca`, and set its Git branch to `staging`. Vercel shows a DNS record for each; keep the tab open for DNS1.
    7. Team **Settings**, **Billing**, **Spend Management**: set a monthly amount equal to the hosting line in the plan and turn on notifications (Vercel alerts at 50, 75 and 100 percent). Do not tick "pause projects"; that would take the CRM offline.
    8. Team **Settings**, **Members**, **Invite**: noah@jakoa.ca with the role D1 decided (Viewer is free; Member costs US$20 a month and lets Noah change settings).
    9. If a deployment ever shows "blocked because the commit author is not a member of the team", click to authorize it and tell Claude; Claude will move deploys behind a CI step.
  * Produces: nothing to copy yet. After the first successful deploy, check **Settings**, **Functions** shows Montréal.

* [ ] **DNS1** GoDaddy: point crm.jakoa.ca and staging.crm.jakoa.ca at Vercel
  * Who: Jackson. Time: 10 minutes, then up to an hour for DNS to update.
  * Why: the app address. Your DNS is at GoDaddy (name servers ns49 and ns50.domaincontrol.com); jakoa.ca itself stays on Netlify.
  * Start: https://dcc.godaddy.com/control/portfolio/jakoa.ca/settings?tab=dns (or godaddy.com, **My Products**, jakoa.ca, **DNS**).
  * Steps:
    1. **Add New Record**: Type **CNAME**, Name `crm`, Value exactly what Vercel showed for crm.jakoa.ca (usually ends in `vercel-dns.com`), TTL 1 hour. **Save**.
    2. **Add New Record**: Type **CNAME**, Name `staging.crm`, Value what Vercel showed for staging.crm.jakoa.ca. **Save**.
    3. If Vercel also showed a **TXT** record named `_vercel`, add it exactly as shown.
    4. Do not touch the existing MX records (Google mail), the SPF, DKIM or DMARC records, or the A record for jakoa.ca (Netlify).
    5. Back in Vercel **Domains**, wait for both to show **Valid Configuration**.
  * Produces: nothing to copy. The doctor's App row turns from "does not resolve" to working.

* [ ] **BK1** AWS: backup bucket in Calgary, a user limited to that bucket, and the backup key
  * Who: Jackson. Time: 30 minutes. Cost: a few cents a month.
  * Why: the brief requires a nightly encrypted copy in a separate Canadian location. Supabase runs in Montreal; Calgary (`ca-west-1`) keeps a copy in another city, on another account, so one failure or one stolen password cannot take both.
  * Start: https://signin.aws.amazon.com/signup?request_type=register
  * Steps:
    1. Create an AWS account with info@jakoa.ca, account name "Jakoa backups", the company card, **Basic** support (free).
    2. Open https://console.aws.amazon.com/iam/home#/security_credentials and click **Assign MFA device** for the root user (passkey or authenticator app). Store the root password in the password manager.
    3. Account menu (top right), **Account**, **AWS Regions**: find **Canada West (Calgary)** and click **Enable** (it is off by default). Wait until it shows Enabled.
    4. Open **Billing and Cost Management**, **Budgets**, **Create budget**, **Monthly cost budget**, amount US$2, emails info@jakoa.ca and noah@jakoa.ca. Alerts at 80 percent.
    5. Switch the region selector (top right) to **Canada West (Calgary)**. Open **S3**, **Create bucket**: name `jakoa-crm-backups-` followed by six random digits; **Block all public access** on; **Bucket Versioning** Enable; **Default encryption** SSE S3; under **Advanced settings** enable **Object Lock**. Create.
    6. Open the bucket, **Properties**, **Object Lock**, **Edit**: default retention **Governance**, 35 days. Then **Management**, **Create lifecycle rule**: name "expire old backups", apply to all objects, expire current versions after 35 days and permanently delete noncurrent versions after 1 day. Save. Copy the bucket name into the password manager.
    7. Open **IAM**, **Policies**, **Create policy**, **JSON**, paste the policy below (replace BUCKET with your bucket name), name it `jakoa-crm-backup-writer`.
    8. **IAM**, **Users**, **Create user**: `jakoa-crm-backup`, no console access, attach the policy above. Open the user, **Security credentials**, **Create access key**, use case **Application running outside AWS**. Copy the access key id and secret into the password manager.
    9. On your laptop run `openssl rand -base64 32` in Terminal. Copy the output into the password manager as "Jakoa CRM / Backup encryption key", and also write it on the recovery code sheet (PK1). Without it, backups cannot be read.

    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        { "Effect": "Allow", "Action": ["s3:ListBucket"], "Resource": "arn:aws:s3:::BUCKET" },
        { "Effect": "Allow", "Action": ["s3:PutObject", "s3:GetObject"], "Resource": "arn:aws:s3:::BUCKET/*" }
      ]
    }
    ```
  * Produces: bucket name, access key id, secret access key, backup encryption key. Goes to: Vercel Production `BACKUP_S3_BUCKET`, `BACKUP_S3_REGION` (`ca-west-1`), `BACKUP_S3_ACCESS_KEY_ID`, `BACKUP_S3_SECRET_ACCESS_KEY`, `BACKUP_ENCRYPTION_KEY` in VC2.

* [ ] **MON1** Better Stack: monitoring account
  * Who: Jackson. Time: 10 minutes. Cost: free plan (10 monitors and heartbeats).
  * Why: something outside the app must notice when the app, or its scheduler, is down. The app cannot alert you about its own death.
  * Start: https://betterstack.com/users/sign-up
  * Steps:
    1. Sign up with info@jakoa.ca, team "Productions Jakoa", turn on two factor authentication under your profile.
    2. **Team**, invite noah@jakoa.ca.
    3. Each of you installs the Better Stack mobile app and allows push notifications. Set your own on call contact methods to push and email (not phone calls).
  * Produces: nothing yet; monitors and heartbeats are created in MON2.

* [ ] **VC2** Vercel: enter the environment variables
  * Who: Jackson. Time: 20 minutes for phase 1, a few minutes each later phase.
  * Why: this is the only place production and staging secrets live. Claude never sees them.
  * Start: Vercel project `jakoa-crm`, **Settings**, **Environment Variables**.
  * Steps for each row below: click **Add**, type the **Key**, paste the **Value** from the password manager, tick the environments shown, tick **Sensitive** for every row marked secret, click **Save**. When done, **Deployments**, latest, **Redeploy**. Preview is staging. Generate random values with `openssl rand -hex 32` on your laptop (run it once per value; never reuse one).
  * Phase 1:

    | Key | Production | Preview (staging) | Secret | From |
    | --- | --- | --- | --- | --- |
    | `APP_ENV` | `production` | `staging` | no | type it |
    | `APP_BASE_URL` | `https://crm.jakoa.ca` | `https://staging.crm.jakoa.ca` | no | type it |
    | `OUTBOUND_ALLOWLIST` | leave unset | your two emails and two cell numbers, comma separated, cells as +1514XXXXXXX | no | you |
    | `CRON_SECRET` | random value | another random value | yes | openssl |
    | `DOCTOR_TOKEN` | random value | another random value | yes | openssl |
    | `NEXT_PUBLIC_SUPABASE_URL` | SB1 project URL (**Connect** button, **App Frameworks** tab) | same from SB2 | no | SB1, SB2 |
    | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | SB1 **Project Settings**, **API Keys**, **Publishable key** | same from SB2 | no | SB1, SB2 |
    | `SUPABASE_SECRET_KEY` | SB1 **API Keys**, **Secret keys**, **New secret key** named `vercel` | same from SB2 | yes | SB1, SB2 |
    | `SUPABASE_DB_URL` | SB1 **Connect** button, **Session pooler** URI, with the database password filled in | same from SB2 | yes | SB1, SB2 |
    | `RESTORE_DRILL_DB_URL` | the SB2 session pooler URI (staging) | leave unset | yes | SB2 |
    | `BACKUP_S3_BUCKET` | your bucket name | leave unset | no | BK1 |
    | `BACKUP_S3_REGION` | `ca-west-1` | leave unset | no | BK1 |
    | `BACKUP_S3_ACCESS_KEY_ID` | from BK1 | leave unset | yes | BK1 |
    | `BACKUP_S3_SECRET_ACCESS_KEY` | from BK1 | leave unset | yes | BK1 |
    | `BACKUP_ENCRYPTION_KEY` | from BK1 | leave unset | yes | BK1 |
    | `BETTERSTACK_HEARTBEAT_BACKUP_URL` | from MON2 | leave unset | yes | MON2 |
    | `BETTERSTACK_HEARTBEAT_HEALTH_URL` | from MON2 | leave unset | yes | MON2 |
    | `HUBSPOT_SERVICE_KEY` | from HS1 | leave unset | yes | HS1 |

  * Phase 2 (add when Claude says phase 2 is ready):

    | Key | Production | Preview (staging) | Secret | From |
    | --- | --- | --- | --- | --- |
    | `GOOGLE_CLOUD_PROJECT_ID` | `jakoa-crm` project id | `jakoa-crm-staging` project id | no | GC1 |
    | `GOOGLE_OAUTH_CLIENT_ID` | production client | staging client | no | GC6 |
    | `GOOGLE_OAUTH_CLIENT_SECRET` | production client | staging client | yes | GC6 |
    | `GOOGLE_PUBSUB_TOPIC` | `projects/<production id>/topics/gmail-push` | same with the staging id | no | GC4 |
    | `GOOGLE_PUBSUB_PUSH_SERVICE_ACCOUNT` | production service account email | staging one | no | GC5 |
    | `GMAIL_MAILBOX` | `info@jakoa.ca` | `info@jakoa.ca` | no | type it |
    | `GMAIL_STAGING_LABEL` | leave unset | `CRM staging` | no | GW4 |
    | `GOOGLE_CALENDAR_ID` | Jakoa calendar id | Jakoa staging calendar id | no | GW3 |
    | `NETLIFY_FORMS_JWS_SECRET` | random value | leave unset | yes | NF1 |
    | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | from TS1 | same | no | TS1 |
    | `TURNSTILE_SECRET_KEY` | from TS1 | same | yes | TS1 |
    | `ANTHROPIC_API_KEY` | production workspace key | staging workspace key | yes | AN1 |
    | `ANTHROPIC_EXTRACTION_MODEL` | model chosen in D1 | same | no | D1 |

  * Phase 3:

    | Key | Production | Preview (staging) | Secret | From |
    | --- | --- | --- | --- | --- |
    | `QBO_ENVIRONMENT` | `production` | `sandbox` | no | type it |
    | `QBO_CLIENT_ID` | production keys | development (sandbox) keys | no | QB2, QB1 |
    | `QBO_CLIENT_SECRET` | production keys | development keys | yes | QB2, QB1 |
    | `QBO_WEBHOOK_VERIFIER_TOKEN` | production webhook token | development webhook token | yes | QB2, QB1 |
    | `NEXT_PUBLIC_GOOGLE_PICKER_API_KEY` | production Picker key | staging Picker key | no | GC8 |
    | `GOOGLE_CLOUD_PROJECT_NUMBER` | production project number | staging project number | no | GC1 |

  * Phase 4:

    | Key | Production | Preview (staging) | Secret | From |
    | --- | --- | --- | --- | --- |
    | `TWILIO_ACCOUNT_SID` | from TW1 | leave unset | no | TW1 |
    | `TWILIO_API_KEY_SID` | from TW5 | leave unset | no | TW5 |
    | `TWILIO_API_KEY_SECRET` | from TW5 | leave unset | yes | TW5 |
    | `TWILIO_PHONE_NUMBER` | from TW3 | leave unset | no | TW3 |
    | `META_APP_ID` | from META1 | leave unset | no | META1 |
    | `META_APP_SECRET` | from META1 | leave unset | yes | META1 |
    | `META_WEBHOOK_VERIFY_TOKEN` | random value | leave unset | yes | META2 |
    | `META_GRAPH_API_VERSION` | from META1 | leave unset | no | META1 |

  * Produces: a configured deployment. Run `npm run doctor` (Claude shows you how) to confirm.

# Phase 1: foundation

* [ ] **MON2** Better Stack: monitors and heartbeats
  * Who: Jackson. Time: 15 minutes. When: Claude tells you phase 1 is deployed.
  * Start: https://uptime.betterstack.com
  * Steps:
    1. **Monitors**, **Create monitor**: URL `https://crm.jakoa.ca/api/health`, alert when the URL is not available, check every 3 minutes, notify the whole team by push and email. Repeat for `https://staging.crm.jakoa.ca/api/health`.
    2. **Heartbeats**, **Create heartbeat**: name "Nightly backup", expected every 1 day, grace period 2 hours. Copy its URL into the password manager.
    3. Create another: "Daily health job", every 1 day, grace 2 hours. Copy its URL.
    4. Claude will give you more monitor URLs (inquiry form, each webhook) as each phase ships; add them the same way.
  * Produces: two heartbeat URLs. Goes to: Vercel Production `BETTERSTACK_HEARTBEAT_BACKUP_URL` and `BETTERSTACK_HEARTBEAT_HEALTH_URL` (VC2), then redeploy.

* [ ] **PK1** Passkeys, backup codes and recovery codes for both of you
  * Who: Jackson and Noah, each on their own devices. Time: 15 minutes each.
  * Why: passkeys are the only way into the CRM. No SMS codes exist, so the recovery codes are the only way back in if you lose every device.
  * Start: the invite email from the CRM (sent to info@jakoa.ca and noah@jakoa.ca when phase 1 is live).
  * Steps:
    1. Open the invite link on your phone. When asked, create a passkey (Face ID or fingerprint). It syncs through iCloud Keychain or Google Password Manager.
    2. Sign in on your laptop and add a second passkey there (**Account**, **Security**, **Add passkey**).
    3. Add an authenticator app as backup (**Add authenticator**), scan the QR code, type the six digit code.
    4. Click **Recovery codes**, print them, and keep the paper somewhere safe at home (with the backup encryption key from BK1). Also store them in the password manager.
  * Produces: recovery codes. Goes to: paper and password manager only.

* [ ] **CD1** Claude Docs: hand over "Jakoa engine log" and "Jakoa leads and actions"
  * Who: Jackson. Time: 5 minutes. When: Claude says the import page is live.
  * Why: the outreach history must move into the CRM. These exports contain personal data, so they must never be committed to the GitHub repository (the `imports/` folder is ignored by git for this reason).
  * Steps, pick one:
    1. Easiest: tell Claude "export the two Claude Docs yourself". Claude reads them through the Claude Docs connector and sends them straight to the CRM's import page. Nothing lands in the repository.
    2. Or: open each doc, use its export option to save it as Markdown on your laptop, then upload both files on **Import**, **Claude Docs** in the CRM.
  * Produces: nothing to copy; the CRM shows a reconciliation report.

* [ ] **HS2** Approve the HubSpot reconciliation and start the 14 day parallel run
  * Who: Jackson. Time: 20 minutes.
  * Steps: open **Import**, **HubSpot** in the CRM, read the counts per object, the 20 sample records side by side, and the failed list. Click **Approve** or tell Claude what is wrong. From approval, a daily diff report shows anything created in HubSpot but not in the CRM, for 14 days.
  * Produces: the approval date, which starts the 14 day clock for HS3.

# Phase 2: inbound automation

Claude will tell you when to start this section. GC items are done twice: once in a production project and once in a staging project. Production and staging get separate Google Cloud projects so a mistake in staging can never touch the production mail watch.

* [ ] **GC1** Google Cloud: two projects with billing and a budget
  * Who: Jackson. Time: 15 minutes.
  * Start: https://console.cloud.google.com/projectcreate
  * Steps:
    1. Project name `jakoa-crm`, organization jakoa.ca, location jakoa.ca. **Create**. Repeat with `jakoa-crm-staging`.
    2. Open https://console.cloud.google.com/billing, create a billing account with the company card (Pub/Sub needs one; usage will be close to zero), and link both projects to it.
    3. **Billing**, **Budgets and alerts**, **Create budget**: CA$5 a month for both projects, alerts at 80 and 100 percent to the billing admins.
    4. On each project's dashboard, **Project info** card: copy the **Project ID** and **Project number** into the password manager.
  * Produces: project ids and numbers. Goes to: `GOOGLE_CLOUD_PROJECT_ID` (phase 2) and `GOOGLE_CLOUD_PROJECT_NUMBER` (phase 3) in VC2.

* [ ] **GC2** Google Cloud: Internal consent screen
  * Who: Jackson. Time: 10 minutes per project.
  * Why: Internal means only jakoa.ca accounts can use it, Google does not need to review it, and its refresh tokens do not expire after 7 days.
  * Start: https://console.cloud.google.com/auth/overview?project=jakoa-crm
  * Steps:
    1. Click **Get started**. App name "Jakoa CRM", support email info@jakoa.ca. **Audience**: **Internal**. Contact email info@jakoa.ca. Agree and **Create**.
    2. **Branding**: app home page `https://crm.jakoa.ca`, privacy policy `https://crm.jakoa.ca/privacy`, authorized domain `jakoa.ca`. Save.
    3. You do not need to add scopes here; the app asks for them when you connect in GC7, and the plan lists each one with its reason.
    4. Repeat in `jakoa-crm-staging` with home page `https://staging.crm.jakoa.ca`.
  * Produces: nothing to copy.

* [ ] **GC3** Google Cloud: turn on the APIs
  * Who: Jackson. Time: 5 minutes per project.
  * Start: https://console.cloud.google.com/apis/library?project=jakoa-crm
  * Steps: search and click **Enable** for each of **Gmail API**, **Google Calendar API**, **Google Drive API**, **Google Picker API**, **Cloud Pub/Sub API**. Repeat in `jakoa-crm-staging`.
  * Produces: nothing to copy.

* [ ] **GC4** Google Cloud: Pub/Sub topic that Gmail can publish to
  * Who: Jackson. Time: 10 minutes per project, more if the policy fix below is needed.
  * Why: Gmail push sends a notice to this topic within seconds of new mail.
  * Start: https://console.cloud.google.com/cloudpubsub/topic/list?project=jakoa-crm
  * Steps:
    1. **Create topic**: Topic ID `gmail-push`, untick **Add a default subscription**, **Create**.
    2. On the topic page open **Permissions** (info panel), **Add principal**: `gmail-api-push@system.gserviceaccount.com`, role **Pub/Sub Publisher**, **Save**.
    3. If it fails with "do not belong to a permitted customer", your organization blocks outside accounts (a Google default for newer Workspace organizations). Fix it for this project only:
       * Open https://console.cloud.google.com/iam-admin/iam, switch the project picker at the top to the jakoa.ca organization, and grant yourself **Organization Policy Administrator**.
       * Open https://console.cloud.google.com/iam-admin/orgpolicies/list?project=jakoa-crm and find **Domain restricted sharing** (`iam.allowedPolicyMemberDomains`) or **Restrict allowed policy members** (`iam.managed.allowedPolicyMembers`). **Manage policy**, **Override parent's policy**, add a rule **Allow All**, **Set policy**.
       * Repeat step 2. Leave the override on this project only; every other project keeps the restriction.
    4. Copy the full topic name shown on the page, `projects/<project id>/topics/gmail-push`. Repeat everything in `jakoa-crm-staging`.
  * Produces: topic names. Goes to: `GOOGLE_PUBSUB_TOPIC` in VC2.

* [ ] **GC5** Google Cloud: signed push subscription to the CRM
  * Who: Jackson. Time: 10 minutes per project. When: after Claude deploys phase 2.
  * Start: https://console.cloud.google.com/iam-admin/serviceaccounts/create?project=jakoa-crm
  * Steps:
    1. Create a service account named `pubsub-push`, no roles. Copy its email.
    2. Open the `gmail-push` topic, **Create subscription**: ID `gmail-push-crm`, **Delivery type** **Push**, endpoint `https://crm.jakoa.ca/api/webhooks/gmail`, tick **Enable authentication**, service account `pubsub-push`, leave audience empty, message retention 7 days, **Retry policy** exponential backoff. **Create**.
    3. Repeat in `jakoa-crm-staging` with endpoint `https://staging.crm.jakoa.ca/api/webhooks/gmail`.
  * Produces: service account emails. Goes to: `GOOGLE_PUBSUB_PUSH_SERVICE_ACCOUNT` in VC2.

* [ ] **GC6** Google Cloud: OAuth client
  * Who: Jackson. Time: 5 minutes per project.
  * Start: https://console.cloud.google.com/auth/clients?project=jakoa-crm
  * Steps:
    1. **Create client**, type **Web application**, name "Jakoa CRM production", **Authorized redirect URIs**: `https://crm.jakoa.ca/api/integrations/google/callback`. **Create**.
    2. Copy the **Client ID** and **Client secret** into the password manager right away; Google shows the secret only once.
    3. Repeat in `jakoa-crm-staging`: name "Jakoa CRM staging", redirect `https://staging.crm.jakoa.ca/api/integrations/google/callback`.
  * Produces: client ids and secrets. Goes to: `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` in VC2.

* [ ] **GW2** Google Workspace: trust internal apps
  * Who: Jackson as admin. Time: 3 minutes.
  * Start: https://admin.google.com, **Security**, **Access and data control**, **API controls**.
  * Steps: click **Settings** (or **Manage third party app access** settings), tick `Trust internal, domain-owned apps`, **Save**.
  * Produces: nothing to copy.

* [ ] **GW3** Google Calendar: shared Jakoa calendar and a staging calendar
  * Who: Jackson. Time: 10 minutes.
  * Start: https://calendar.google.com signed in as info@jakoa.ca.
  * Steps:
    1. Next to **Other calendars** click **+**, **Create new calendar**: name "Jakoa", time zone Eastern Time (Toronto). **Create calendar**.
    2. Open its settings, **Share with specific people or groups**, add noah@jakoa.ca with **Make changes and manage sharing**.
    3. Under **Integrate calendar**, copy the **Calendar ID** (ends in `@group.calendar.google.com`).
    4. Repeat with a calendar named "Jakoa staging" (do not share it).
  * Produces: two calendar ids. Goes to: `GOOGLE_CALENDAR_ID` in VC2.

* [ ] **GW4** Gmail: staging label and filter
  * Who: Jackson. Time: 5 minutes.
  * Why: staging may only process mail carrying this label, which you apply to your own test emails.
  * Start: https://mail.google.com signed in as info@jakoa.ca, **Settings**, **See all settings**, **Labels**.
  * Steps:
    1. **Create new label**: `CRM staging`.
    2. **Filters and Blocked Addresses**, **Create a new filter**: From your and Noah's personal email addresses, Subject `CRM TEST`. **Create filter**, tick **Apply the label** `CRM staging`. **Create filter**.
  * Produces: label name. Goes to: `GMAIL_STAGING_LABEL` (Preview only) in VC2.

* [ ] **GC7** Connect Google inside the CRM
  * Who: Jackson. Time: 3 minutes per environment. When: after VC2 phase 2 values are in.
  * Steps: open https://crm.jakoa.ca, **System**, **Integrations**, **Google**, **Connect**. Choose info@jakoa.ca. Read the permission list (read mail, create drafts, manage events on calendars you own, files the app creates or you pick) and click **Allow**. Repeat on https://staging.crm.jakoa.ca.
  * Produces: nothing to copy; the token is stored encrypted inside the CRM.

* [ ] **NF1** Netlify: form notifications for the jakoa.ca contact form
  * Who: Jackson. Time: 10 minutes.
  * Why: jakoa.ca is a Netlify site and its quote form is a Netlify form named `quote`. Netlify can email each submission and also post it, signed, straight to the CRM. The signed post is faster and cannot be faked; the email is the backup and goes through the Gmail pipeline.
  * Start: https://app.netlify.com, project `jakoaproductions`, **Project configuration**, **Notifications**, **Emails and webhooks**, **Form submission notifications**.
  * Steps:
    1. If no email notification to info@jakoa.ca exists: **Add notification**, **Email notification**, event **New form submission**, email info@jakoa.ca, form `quote`. Save.
    2. Run `openssl rand -hex 32` on your laptop and store it as "Jakoa CRM / Netlify form secret".
    3. **Add notification**, **HTTP POST request**: event **New form submission**, URL `https://crm.jakoa.ca/api/webhooks/netlify-forms`, **JWS secret token**: the value from step 2, form `quote`. Save.
  * Produces: the form secret. Goes to: Vercel Production `NETLIFY_FORMS_JWS_SECRET` in VC2.

* [ ] **NF2** jakoa.ca: link the hosted inquiry form and test the embed
  * Who: Jackson. Time: 10 minutes. When: Claude says `crm.jakoa.ca/inquiry` is live.
  * Steps:
    1. In whatever you use to edit jakoa.ca, add a button or link "Request a quote" to `https://crm.jakoa.ca/inquiry` (French pages: `https://crm.jakoa.ca/inquiry?lang=fr`).
    2. Try the embed: add an HTML or Embed block with the code Claude gives you at that time (an iframe). The site is plain HTML on Netlify, so this should work; if your editor has no such block, the link alone is enough.
    3. Tell Claude whether the embed displayed.
  * Produces: nothing to copy.

* [ ] **TS1** Cloudflare Turnstile keys for the inquiry form
  * Who: Jackson. Time: 10 minutes. Cost: free.
  * Start: https://dash.cloudflare.com/sign-up
  * Steps:
    1. Create a free account with info@jakoa.ca and turn on two factor (**My Profile**, **Authentication**).
    2. Left sidebar **Turnstile**, **Add widget**: name "Jakoa CRM inquiry", hostnames `crm.jakoa.ca` and `staging.crm.jakoa.ca`, mode **Managed**, pre clearance **No**. **Create**.
    3. Copy the **Site Key** and **Secret Key** into the password manager.
  * Produces: site key and secret key. Goes to: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` (both environments) in VC2.

* [ ] **AN1** Anthropic: Claude API keys with a monthly spend limit
  * Who: Jackson. Time: 10 minutes.
  * Why: the extraction step that reads inquiries. Separate workspaces per environment keep a staging bug from spending production money.
  * Start: https://platform.claude.com
  * Steps:
    1. Sign in or sign up with info@jakoa.ca, organization "Productions Jakoa". Turn on two factor in your account settings. Add the company card under **Billing**; leave auto reload off.
    2. **Settings**, **Workspaces**, **Create workspace**: `jakoa-crm-production`. In that workspace's **Limits**, set a monthly spend limit (the plan's Claude line, rounded up; US$20 is safe).
    3. Create a second workspace `jakoa-crm-staging` with a US$5 limit.
    4. **API keys**, **Create key**: choose workspace `jakoa-crm-production`, name `vercel-production`. Copy it into the password manager. Repeat for staging.
  * Produces: two API keys. Goes to: `ANTHROPIC_API_KEY` in VC2 (production key in Production, staging key in Preview).

* [ ] **LAW1** jakoa.ca: name the person in charge of personal information
  * Who: Jackson. Time: 10 minutes. When: Claude publishes the privacy policy pages.
  * Why: Quebec Law 25 requires the title and contact details of the person in charge to be published on the business website.
  * Steps: add to the jakoa.ca footer, in English and French: "Person in charge of the protection of personal information: Jackson Choran, info@jakoa.ca" with links to `https://crm.jakoa.ca/privacy` and the French page Claude gives you.
  * Produces: nothing to copy.

# Phase 3: money

* [ ] **QB1** Intuit: developer account, app and Canadian sandbox company
  * Who: Jackson. Time: 30 minutes.
  * Start: https://developer.intuit.com
  * Steps:
    1. Sign in with the Intuit account that administers the real QuickBooks company. Turn on two step verification if Intuit offers it.
    2. **Dashboard**, **Create an app**, **QuickBooks Online and Payments**, name "Jakoa CRM", scope **Accounting** only (`com.intuit.quickbooks.accounting`).
    3. **Sandboxes**, **Add a sandbox**: QuickBooks Online Plus, country **Canada**.
    4. In the app, **Keys and credentials**, **Development**: add redirect URI `https://staging.crm.jakoa.ca/api/integrations/quickbooks/callback`. Copy the client id and secret.
    5. **Webhooks**, **Development**: endpoint `https://staging.crm.jakoa.ca/api/webhooks/quickbooks`, entities Customer, Estimate, Invoice, Payment. Save and copy the **Verifier token**.
  * Produces: development client id, secret, verifier token. Goes to: Preview `QBO_CLIENT_ID`, `QBO_CLIENT_SECRET`, `QBO_WEBHOOK_VERIFIER_TOKEN` in VC2.

* [ ] **QB2** Intuit: production keys (app assessment)
  * Who: Jackson. Time: 45 minutes plus Intuit's review.
  * Why: Intuit only issues production keys after a short questionnaire about the app's security and data use. Claude drafts every answer for you.
  * Steps: in the app, **Keys and credentials**, **Production**, follow **Get production keys**. Use host domain `crm.jakoa.ca`, launch URL `https://crm.jakoa.ca`, disconnect URL `https://crm.jakoa.ca/system/integrations`, privacy policy `https://crm.jakoa.ca/privacy`, terms `https://crm.jakoa.ca/terms`. Add production redirect URI `https://crm.jakoa.ca/api/integrations/quickbooks/callback` and production webhook endpoint `https://crm.jakoa.ca/api/webhooks/quickbooks`.
  * Produces: production client id, secret, verifier token. Goes to: Production `QBO_CLIENT_ID`, `QBO_CLIENT_SECRET`, `QBO_WEBHOOK_VERIFIER_TOKEN` in VC2.

* [ ] **QB3** Connect the real QuickBooks company
  * Who: Jackson (QuickBooks admin). Time: 5 minutes. When: Claude says the sandbox acceptance test passed.
  * Steps: CRM, **System**, **Integrations**, **QuickBooks**, **Connect**, sign in, choose 9578 4682 Québec inc., **Connect**. Claude asks before anything is written to the real books.
  * Produces: nothing to copy.

* [ ] **QB4** Stop using QuickBooks leads, opportunities, tasks and notes
  * Who: Jackson and Noah. Time: none. When: after Claude imports any that exist, once.
  * Steps: from then on, record leads only in the CRM. QuickBooks stays the accounting system only.

* [ ] **GC8** Google Picker key so Drive access stays per file
  * Who: Jackson. Time: 5 minutes per project.
  * Why: the app only gets the `drive.file` scope, which covers files the app creates or files you pick. The Picker is how you pick an existing contract.
  * Start: https://console.cloud.google.com/apis/credentials?project=jakoa-crm
  * Steps: **Create credentials**, **API key**. Edit it: application restriction **Websites**, add `https://crm.jakoa.ca/*`; API restriction **Restrict key**, **Google Picker API**. Save. Repeat in staging with `https://staging.crm.jakoa.ca/*`.
  * Produces: two browser keys. Goes to: `NEXT_PUBLIC_GOOGLE_PICKER_API_KEY` in VC2.

# Phase 4: calls, DMs and Claude

* [ ] **TW7** Put the tracking number on Google Ads and Google Business Profile
  * Who: Jackson. Time: 15 minutes. When: after the test call in TW8 works.
  * Steps:
    1. https://ads.google.com, **Campaigns**, **Assets**, **+**, **Call**: country Canada, the Twilio number, call reporting on. Save and apply to your campaigns.
    2. https://business.google.com, your profile, **Edit profile**, **Contact**: set the Twilio number as the primary phone and move 514 865 6397 to **Additional phone**, so listings stay consistent. Google may review the change for a day.
  * Produces: nothing to copy.

* [ ] **TW8** Test call and missed call text
  * Who: Jackson, with a phone that is not yours or Noah's. Time: 10 minutes.
  * Steps: call the tracking number from another phone; both your cells should ring. Hang up once unanswered: a deal and an urgent task appear, and the caller gets one text. Tell Claude the result.

* [ ] **META1** Meta: create the app under Jackson's own profile
  * Who: Jackson, logged in to his own personal Facebook profile, never the shared "Noah Jackson" account. Time: 30 minutes.
  * Start: https://developers.facebook.com/apps
  * Steps:
    1. **Create app**. Name "Jakoa CRM", contact email info@jakoa.ca. Choose the use cases for Messenger (engage with customers on Messenger) and Instagram (manage messaging and content on Instagram). Link the business portfolio "Productions Jakoa".
    2. **App settings**, **Basic**: privacy policy URL `https://crm.jakoa.ca/privacy`, user data deletion instructions URL `https://crm.jakoa.ca/privacy#deletion`, category Business and pages, app icon (Jakoa logo). Save. Copy the **App ID** and, with **Show**, the **App secret**.
    3. **App settings**, **Advanced**: note the Graph API version (for example v25.0).
    4. **App roles**, **Roles**: add Noah's own personal profile as Administrator.
  * Produces: app id, app secret, API version. Goes to: Production `META_APP_ID`, `META_APP_SECRET`, `META_GRAPH_API_VERSION` in VC2.

* [ ] **META2** Meta: webhook to the CRM
  * Who: Jackson. Time: 10 minutes. When: after VC2 has the META1 values and Claude has deployed.
  * Steps:
    1. Run `openssl rand -hex 32`, store it as "Jakoa CRM / Meta webhook verify token", put it in Vercel Production `META_WEBHOOK_VERIFY_TOKEN`, redeploy.
    2. In the app, Messenger use case, **Configure webhooks**: callback `https://crm.jakoa.ca/api/webhooks/meta`, verify token from step 1, **Verify and save**. Subscribe to `messages`, `messaging_postbacks`, `message_echoes`.
    3. Instagram use case, webhooks: same callback and token, subscribe to `messages`.
  * Produces: the verify token (step 1).

* [ ] **META3** Connect the Page and Instagram account in the CRM
  * Who: Jackson. Time: 5 minutes.
  * Steps: CRM, **System**, **Integrations**, **Meta**, **Connect**, log in as yourself, pick the Page "Productions Jakoa" and its Instagram account, approve.

* [ ] **META4** Email fallback for new messages
  * Who: Jackson. Time: 5 minutes. Do it now and keep it until META5 passes.
  * Steps: https://business.facebook.com, **Settings**, **Notifications**, **Inbox**: turn on email for new messages to info@jakoa.ca. Meta's emails often say only "you have a new message", so the CRM turns each one into a task with a link to the Meta inbox.

* [ ] **META5** Test a DM from someone with no role on the app
  * Who: Jackson, with a friend's account. Time: 10 minutes.
  * Why: Meta's current documentation says an app that only serves your own Page needs no App Review. This test proves it before you spend days on review.
  * Steps: have the friend send a DM to the Page and to the Instagram account. If both appear in the CRM within a minute, skip META6. If not, do META6.

* [ ] **META6** Meta: business verification and App Review (only if META5 fails)
  * Who: Jackson. Time: 1 to 2 hours plus Meta's review (days to weeks).
  * Steps:
    1. https://business.facebook.com, **Settings**, **Business info** or **Security Center**, **Start verification**: legal name 9578 4682 Québec inc., address, phone, website jakoa.ca, documents (Quebec enterprise register statement and a utility bill).
    2. **Brand safety**, **Domains**, add `jakoa.ca`; add the TXT record Meta shows at GoDaddy (DNS1 steps).
    3. App dashboard, **App Review**, **Permissions and features**: request advanced access for `pages_messaging`, `pages_manage_metadata`, `pages_read_engagement`, `pages_show_list`, `business_management`, `instagram_basic`, `instagram_manage_messages`. Claude writes each description and the screencast script.
  * Produces: nothing to copy.

* [ ] **MCP1** Add the CRM to Claude as custom connectors
  * Who: Jackson (Noah too if he uses Claude). Time: 5 minutes.
  * Steps:
    1. https://claude.ai, **Settings**, **Connectors**, **Add custom connector**: name "Jakoa CRM", URL `https://crm.jakoa.ca/mcp`. **Add**, **Connect**, sign in with your passkey, approve.
    2. Add a second one: "Jakoa CRM outreach", URL `https://crm.jakoa.ca/mcp/outreach`. This one only gets outreach tools; use it for the daily outreach skill.
    3. For Claude Code on your laptop, run `claude mcp add --transport http jakoa-crm https://crm.jakoa.ca/mcp`.
  * Produces: nothing to copy.

* [ ] **SK1** Apply the outreach skill changes
  * Who: Jackson. Time: 15 minutes.
  * Steps: Claude gives you an exact list of file changes for the jakoa daily outreach skill. Claude does not edit the skill itself.

# Phase 5: staff view (optional)

* [ ] **ST1** Create a test staff account
  * Who: Noah. Time: 10 minutes.
  * Steps: CRM, **Staff**, **Invite**, role **Staff**, using a test email of yours. Sign in with it on a second phone and confirm you see only that person's assignments and no client names, phones or emails.

# HubSpot switch off (day 15 of the parallel run)

* [ ] **HS3** Confirm HubSpot can be switched off
  * Who: Jackson. Time: 5 minutes.
  * Steps: read the last daily diff. If it is empty for the last 3 days, tell Claude "switch off HubSpot". Claude will not do anything until you say it.

* [ ] **HS4** Final HubSpot export, then close it
  * Who: Jackson. Time: 30 minutes.
  * Steps:
    1. In HubSpot, for each of contacts, companies, deals, notes and tasks: open the object list, **Export**, all properties, CSV. Save the files to the password manager's file attachments or another private place, not the repository.
    2. Delete the service key from HS1 (**Development**, **Keys**, **Service keys**).
    3. Remove `HUBSPOT_SERVICE_KEY` from Vercel.
    4. Close the account from HubSpot account settings (Claude gives you the current steps on the day).

# Recurring (the system tells you; nothing to schedule)

* When an alert arrives by push or email, open its link; it goes to the matching section of `docs/RUNBOOK.md`.
* About every 90 days, if alerted, reconnect QuickBooks (Intuit's connection expires after 100 idle days).
* Once a year: Intuit's security questionnaire, Meta's data use checkup, and a read of the privacy policy. Claude reminds you.
