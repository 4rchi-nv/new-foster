# New Foster

Corporate site for ООО «Нью Фостер» / New Foster. Russian and English. Content is edited in Payload CMS; the public site reads only published records.

The visual direction is engineering precision: a light field, graphite type, and a chamfered rectangle used as a limited brand mark. There is no concept switcher in the public site.

## Setup

```bash
npm install
copy .env.example .env.local
```

Fill in `.env.local`:

| Variable | Purpose |
| --- | --- |
| `PAYLOAD_SECRET` | Session secret. Required. |
| `DATABASE_URL` | Local: `file:./data/payload.db`. On Vercel: Turso URL `libsql://…`. |
| `DATABASE_AUTH_TOKEN` | Turso auth token. Only for remote `DATABASE_URL`. Leave empty locally. |
| `NEXT_PUBLIC_SITE_URL` | Public origin, no trailing slash. Used for canonical URLs. |
| `PAYLOAD_ADMIN_EMAIL` | First editor email. Created only if no users exist. |
| `PAYLOAD_ADMIN_PASSWORD` | First editor password. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `INQUIRY_TO` | Optional mail delivery. |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER` | `ga4` or `ym`. |
| `NEXT_PUBLIC_ANALYTICS_ID` | Measurement id. Scripts load only after consent. |

```bash
npm run dev
```

Open `http://localhost:3000/ru`. The editor panel is `http://localhost:3000/admin`.

## Content rules

Do not publish figures, clients, certificates, addresses, or phone numbers that have not been approved. Empty fields stay off the public page. A metric appears only when it is published and marked approved.

The Afipsky refinery example from the brief is a content-structure sample. It is not seeded as a project.

## Editing

Sign in at `/admin`. The interface is in Russian by default.

- **Содержание сайта** — company, homepage blocks, page intros (company / expertise / equipment / projects / news / documents / contacts / standards), workflow sequence, principles, contacts, SEO.
- **Компетенции** — the five work areas, including stage steps on the expertise page.
- **Показатели** — approved numbers only.
- **Группы / категории / оборудование** — the equipment tree. A new category appears on the site without a code change.
- **Проекты** — case studies. Fill only the sections you have. Publish when the case is approved.
- **Материалы** — technical articles and news.
- **Документы** — standards and company files. Choose where the file is shown and what kind of document it is. A listed standard is not a certificate unless the certificate file itself is published.
- **Запросы** — project inquiries and their files.

Addresses are Latin slugs (`tubular-furnaces`). Leave the slug empty on create and it is built from the Russian title.

Paragraphs in long text fields are separated by a blank line.

## Languages

Each text field has Russian and English values. Edit both. The public URLs are `/ru/...` and `/en/...`. The language switch keeps the current page. Slugs are shared, so a project keeps the same address in both languages.

## Files

- Images: `media/`, served at `/api/media/file/...`.
- Public documents: `media/documents/`, available only when the document is published.
- Inquiry files: `storage/inquiries/`. The collection is closed to the public. Editors download them from the inquiry in the admin. They are not attached to email.

Allowed inquiry uploads: PDF, DOC, DOCX, XLS, XLSX. Up to 3 files, 15 MB each.

## Inquiries

A submission is validated in the browser and again on the server, then stored in **Запросы**. If SMTP variables are set, a notice is also emailed. If mail fails, the inquiry remains in the CMS. If the CMS write fails, the visitor sees an error and nothing is discarded quietly.

Rate limit: 5 inquiries per IP per hour, in memory, on one server process. Use a shared store before running more than one server.

## Analytics

Set the provider and id, then rebuild. A consent bar is shown. Events: `contact_cta_click`, `form_start`, `spec_upload`, `inquiry_success`, `project_opened`, `equipment_opened`. Events carry a page or slug, not the visitor’s name or email.

## Production

```bash
npm test
npm run lint
npm run build
npm start
```

SQLite schema is pushed on boot. That fits a single database file. Move to Payload migrations before more than one server uses the database.

Back up `data/payload.db`, `media/`, and `storage/`. Inquiry files are confidential customer documents.

Set `NEXT_PUBLIC_SITE_URL` to the real `https` origin so canonical, hreflang, sitemap, and robots URLs are correct.

### Turso (Vercel / staging DB)

Local stays `file:./data/payload.db`. Vercel needs a remote LibSQL DB.

**Windows:** the `install.sh` script does not run in Git Bash. Prefer the [dashboard](https://turso.tech/) (no CLI), or install the CLI inside **WSL** / Linux, then run the commands below.

```bash
# macOS / Linux / WSL — not Git Bash on Windows
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
turso db create new-foster
turso db show new-foster --url
turso db tokens create new-foster
```

**Dashboard path (any OS):** create a database → copy the `libsql://…` URL → create a token → paste both into Vercel as below.

Vercel → Settings → Environment Variables (Preview or Production):

| Name | Value |
| --- | --- |
| `PAYLOAD_SECRET` | long random string |
| `DATABASE_URL` | output of `turso db show … --url` (`libsql://…`) |
| `DATABASE_AUTH_TOKEN` | output of `turso db tokens create …` |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |
| `PAYLOAD_ADMIN_EMAIL` | first editor (empty DB only) |
| `PAYLOAD_ADMIN_PASSWORD` | first editor password |

Redeploy. Open `/ru` and `/admin`.

If Vercel still returns 500 and Turso is empty (no tables), create the schema once from the laptop:

1. Temporarily put the Turso `DATABASE_URL` + `DATABASE_AUTH_TOKEN` into `.env.local`.
2. Run `npm run dev` and open `http://localhost:3000/ru` once (first load can take 1–3 minutes).
3. Restore `.env.local` to `file:./data/payload.db`.
4. Reload `https://your-app.vercel.app/ru`.

Notes:

- Do **not** keep Turso credentials in `.env.local` for daily local work.
- Local `data/payload.db` is not uploaded. Seed fills the empty Turso DB on first successful init.
- Media/`storage` on Vercel are not durable until object storage is wired.

## Routes

`/ru` and `/en` with `company`, `expertise`, `documents`, `equipment`, `equipment/[slug]`, `projects`, `projects/[slug]`, `standards`, `news`, `news/[slug]`, `contacts`.
