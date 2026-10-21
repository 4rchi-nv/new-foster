# New Foster — Final Handoff Report (Stage C)

**Date:** 2026-10-15  
**Target:** https://new-foster.vercel.app/

---

## 1. Deployment

| Item | Value |
| --- | --- |
| Tested URL | https://new-foster.vercel.app/ |
| CMS URL | https://new-foster.vercel.app/admin |
| Branch | `main` |
| Local commit | `1ed7b7f33339cdbd371c4be1ee8613ba6ccab0fa` (`fix:qa1.0`) |
| Vercel Production SHA | `1ed7b7f33339cdbd371c4be1ee8613ba6ccab0fa` |
| Deployment status | Production Ready (GitHub deployment `7092168143`, 2026-10-15) |
| Deployment identity verified | **Yes** |
| Stage A on Vercel | **Yes** (behavioral + SHA match) |

---

## 2. Stage A regression

| Bug | Vercel status | Result |
| --- | --- | --- |
| BUG-001 HTTP 404 | `/ru/projects/nonexistent-qa-slug` → **404**; `/en/projects/nonexistent-qa-slug` → **404**; `/ru/news/nonexistent-qa-slug` → **404**; `/ru/equipment/nonexistent-qa-slug` → **404**; `/ru/projects/afipsky-pm3` → **200** | **PASS** |
| BUG-002 Documents nav | Present in header, mobile menu, footer (RU + EN); `/ru/documents` and `/en/documents` load **200** | **PASS** |
| BUG-003 Equipment search | `?q=трубчатые` → **200**, filtered to Трубчатые печи; form GET action present; clear (`/ru/equipment`) → **200** | **PASS** |
| BUG-004 Form validation | `required` + `aria-required` on name/company/phone/email/consent; empty submit shows field errors; invalid email → `typeMismatch` | **PASS** (no real submit) |
| BUG-005 Consent | Interactive (`checked` on click); a11y tree may label `readonly` falsely | **PASS** |
| BUG-007 Landmarks | `HEADER` → `MAIN` → `FOOTER` | **PASS** |
| BUG-006 Admin i18n | Deferred | **SKIP** |

---

## 3. Public site

All major RU/EN routes return **HTTP 200** (home, company, expertise, equipment, projects, standards, news, documents, contacts). No HTTP 500 observed. Pages render with content (no blank shells). Language switch RU↔EN works. Mobile (390×844): home loads, Documents in nav, no horizontal overflow. Desktop smoke OK.

Demo project/news content is largely **code frames** (e.g. `afipsky-pm3`), not CMS rows — expected when collections are empty.

---

## 4. CMS

Authenticated `/admin` dashboard loads. Site global editor opens with fields/controls. Lists open for Projects, Articles (Материалы), Equipment, Documents, Media. Create / Bulk Upload controls present.

**Note:** Public API and admin lists currently show **0 docs** for projects/articles/equipment/media/documents on this deployment DB. Site global still has content. Editors are available for client content entry; frame-based demo pages remain visible on the public site.

No content modified. No logout.

---

## 5. Integrations

| Area | Classification | Notes |
| --- | --- | --- |
| Media / Documents uploads | **BLOCKED** (durable storage) | Still `staticDir` only (`media`, `media/documents`, `storage/inquiries`). No S3/Blob adapter. Uploads on Vercel are not reliable across redeploys. Public Documents page is structure-only (“files to be added”). |
| Inquiry / SMTP | **Cannot determine** (env) / **end-to-end unverified** | SMTP vars optional per README; Vercel secret values not inspected. Validation only tested — **no claim that email delivery works**. Inquiries can still persist in CMS if write path works. |
| Cache / revalidation | Known lag possible | Prior QA: short CMS→public delay after publish; not re-stressed this stage. |

---

## 6. Critical issues

None that block browsing the public site or opening the CMS for acceptance of layout/navigation/localization.

**Disclose before handoff:** Media/Documents file uploads are not production-durable on Vercel until object storage is configured.

---

## 7. Known limitations

- Media/Documents: local filesystem storage only — not durable on Vercel.
- Inquiry email delivery: not end-to-end verified; do not assume SMTP is live.
- Document downloads: unavailable by design until files are published.
- CMS content collections currently empty; public demo content comes from code frames + Site global.
- Payload admin chrome mixed RU/EN (BUG-006 deferred).
- Contact phone/email/map placeholders pending client confirmation.
- Prior local-only hydration warning **not** reproduced on production (no Next overlay / hydration text).

---

## 8. Final verdict

**READY FOR CLIENT REVIEW WITH LIMITATIONS**

---

## 9. Final recommendation

Share **https://new-foster.vercel.app/** with the client for acceptance of public site browse, RU/EN, navigation (including Documents), and CMS shell access.

Communicate explicitly:

1. **Do not rely on Media/Documents uploads** on this Vercel build until persistent object storage is wired.
2. **Inquiry email** is unverified — treat form testing as UI/validation only unless SMTP is confirmed separately.
3. Much of the visible demo catalog is **frame/seed structure**, not editable CMS rows; Site global and new CMS entries are the path for real content.
4. This is a **development review** URL, not a production certification.
