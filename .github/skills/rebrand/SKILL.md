---
name: rebrand
description: "Rebrand the app from a project description file. Use when: replacing placeholder texts, updating app name/title/domain, rewriting email copy, updating logo alt text, renaming the app in metadata, onboarding copy, legal pages, and UI labels. Triggers: 'rebrand', 'update placeholders', 'apply project description', 'onboard project', 'replace placeholder title', 'set app name'."
argument-hint: "Path to the project description file (e.g. project.md)"
---

# Rebrand Skill

Reads a project description file and replaces every `[placeholder *]` token — and any other generic copy — throughout the codebase to match the real product.

## When to Use

- First-time project setup after cloning the template
- Renaming / rebranding the product
- Updating contact emails, domain, or sender names in emails

---

## Step 0 — Read the Project Description

Read the file provided as the skill argument. Extract and confirm these values before touching any code:

| Variable | Description | Example |
|---|---|---|
| `APP_NAME` | Short product name | `Bugger` |
| `APP_TAGLINE` | One-line subtitle shown under the logo | `Bug tracking for modern teams` |
| `APP_DOMAIN` | Production domain (no protocol) | `bugger.app` |
| `APP_URL` | Full canonical URL | `https://bugger.app` |
| `APP_DESCRIPTION` | 1–2 sentence SEO description | `Bugger is a lightweight…` |
| `APP_KEYWORDS` | Comma-separated SEO keywords | `bug tracker, issue tracking` |
| `SENDER_NAME` | Friendly from-name for transactional email | `Mike from Bugger` |
| `SENDER_EMAIL` | From address for transactional email | `mike@bugger.app` |
| `NOREPLY_EMAIL` | No-reply address | `no-reply@bugger.app` |
| `SUPPORT_EMAIL` | Public support / contact email | `hello@bugger.app` |
| `OG_TITLE` | Open Graph title | `Bugger — Bug Tracking` |
| `OG_DESCRIPTION` | Open Graph description | `Track bugs…` |
| `LOGO_ALT` | Alt text for logo image | `Bugger logo` |
| `ONBOARDING_ORG_PLACEHOLDER` | Input placeholder in onboarding | `Acme Inc.` |

If any value is missing, ask before proceeding.

---

## Step 1 — Global Metadata (`app/layout.tsx`)

Replace all `[placeholder *]` tokens in the root `metadata` export:

```
[placeholder title]            → APP_NAME
[placeholder description]      → APP_DESCRIPTION
[placeholder keyword 1/2]      → APP_KEYWORDS items
[placeholder og title]         → OG_TITLE
[placeholder og description]   → OG_DESCRIPTION
[placeholder twitter title/description] → same as OG equivalents
metadataBase URL               → APP_URL
```

---

## Step 2 — Dashboard Layout Metadata (`app/(dashboard)/app/layout.tsx`)

Same token replacements as Step 1 for the dashboard-specific metadata block (title, description, OG, Twitter).

---

## Step 3 — Logo Component (`components/logo.tsx`)

- Replace `[placeholder title]` in the rendered name text → `APP_NAME`
- Replace `"Logo"` alt text on the `<Image>` → `LOGO_ALT`
- Update the tagline string below the name → `APP_TAGLINE`

---

## Step 4 — Public Landing & Legal Pages

Files to update:

| File | Tokens |
|---|---|
| `app/(public)/page.tsx` | `[placeholder landing title]`, description |
| `app/(public)/_components/footer.tsx` | `[placeholder title]` in copyright line |
| `app/(public)/_components/primitives.tsx` | `app.[placeholder title].com` default URL |
| `app/(public)/contact/page.tsx` | `hello@[placeholder domain]` |
| `app/(public)/policies/privacy/page.tsx` | All `[placeholder title]`, `[placeholder url]` |
| `app/(public)/policies/terms/page.tsx` | All `[placeholder title]`, `[placeholder url]` |

---

## Step 5 — Settings UI (`app/(dashboard)/app/settings/`)

- `_components/settings-view.tsx`: `[placeholder reset-data description]` and any other descriptive copy → rewrite to match the product

---

## Step 6 — Email Templates (`emails/`)

Replace `[placeholder title]` → `APP_NAME` and `[placeholder url]` → `APP_URL` in every `.tsx` file under `emails/`:

- `welcome-email.tsx` — "Welcome to [placeholder title]" heading and body
- `magic-link-email.tsx`
- `forgot-password.tsx`
- `email-change-verification.tsx` / `email-change-confirmation.tsx`
- `password-change-confirmation.tsx`
- `account-deletion.tsx`
- `organization-invite.tsx`
- `subscription-started.tsx` / `subscription-cancelled.tsx` / `subscription-changed-email.tsx` / `subscription-past-due-email.tsx`
- `support-request-received.tsx` / `contact-request-received.tsx` / `contact-request.tsx`
- `email-container.tsx` — logo `src` URL: `[placeholder url]/logo.png` → `APP_URL/logo.png`

---

## Step 7 — Email Service (`lib/emails/email-service.ts`)

Replace all tokens in subjects, sender names, and sender addresses:

```
[placeholder title]     → APP_NAME
[placeholder domain]    → APP_DOMAIN
mike@[placeholder domain] → SENDER_EMAIL
Mike from [placeholder title] → SENDER_NAME
no-reply@[placeholder domain] → NOREPLY_EMAIL
```

---

## Step 8 — Onboarding UI

- `app/onboarding/_components/onboarding-form.tsx`: input placeholder `"Acme Inc."` → `ONBOARDING_ORG_PLACEHOLDER`

---

## Step 9 — CSS / Design System Comment (`app/globals.css`)

Update the design system comment that references `[placeholder title]` → `APP_NAME`.

---

## Step 10 — Verification

After all edits, run:

```
grep -r "\[placeholder" --include="*.tsx" --include="*.ts" --include="*.css" --include="*.md" .
```

Any remaining matches are missed tokens — fix them before finishing.

Report:
- Count of files changed
- Any remaining placeholders that could not be automatically resolved (e.g. policy page legal entity name)
- Files that may need manual review (long-form legal text)

---

## Notes

- **Do not** edit files under `components/ui/` (shadcn primitives).
- **Do not** edit `package.json`, `prisma/schema.prisma`, or migration files.
- Logo image file (`public/logo.svg` / `public/logo.png`) must be replaced manually — note this to the user.
- `[placeholder url]` in email templates must use the full `https://` URL, not just the domain.
- Legal pages (privacy, terms) contain long-form text with the product name woven throughout — rewrite the full page copy, not just token-replace, if the product category differs from the template.
