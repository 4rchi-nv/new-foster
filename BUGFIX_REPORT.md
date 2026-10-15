# New Foster — Stage A Bugfix Report

**Date:** 2026-10-15  
**Basis:** `QA_REPORT.md`, `QA_CHECKLIST.md`  
**Scope:** Confirmed P2 fixes, verify-first P3, low-risk P4 only if cheap  
**Verdict:** CLIENT REVIEW READY

---

## Bug matrix

| Bug | Before | Action | After | Verification |
| --- | --- | --- | --- | --- |
| BUG-001 Soft HTTP 404 | Missing project/news/equipment slugs showed branded not-found UI but often returned **HTTP 200** on Turso (local sqlite check returned `null`, so proxy skipped hard 404) | Made `isPublishedSlug` async; local sqlite path unchanged; remote Turso via `@libsql/client/http`; proxy awaits and returns hard 404 when `published === false` | Missing slug → **HTTP 404**; `afipsky-pm3` → **200** | Local prod (`npm run build` + `npm start -p 3010`): `projects/nonexistent-qa-slug`, `news/nonexistent-qa`, `equipment/nonexistent-qa`, EN project miss → 404; example project → 200 |
| BUG-002 Documents missing from header | Footer had Documents; header + mobile overlay omitted it | Added `documents` to shared nav lists + `ui.nav` RU/EN labels | Menu shows «Документы» / «Documents» | Local RU menu overlay includes Документы; EN footer/nav includes Documents |
| BUG-003 Equipment search Enter | Automation Enter did not submit GET form | Reproduced: GET form works; `requestSubmit()` / `?q=` filter correctly; Enter via automation ≠ real HTML submit | **WORKING AS DESIGNED** | Browser verification on production |
| BUG-004 Required fields | Inputs lacked `required` / `aria-required`; form uses `noValidate` + custom errors | Added `required` + `aria-required` on name/company/phone/email/consent; kept `noValidate` so custom messages still own UX | A11y tree shows `required` on those fields | Local homepage snapshot: required on name/company/phone/email/consent |
| BUG-005 Consent readonly | Snapshot showed readonly | DOM: `readOnly=false`, `disabled=false`; click toggles checked | **NOT REPRODUCIBLE** | CDP + click on production contacts form |
| BUG-006 CMS mixed RU/EN chrome | Payload admin shows mixed English chrome strings | Would need Payload admin translation overrides / larger config work | **DEFERRED** | Not worth delaying client review |
| BUG-007 Footer before main in a11y snapshot | Snapshot ordering looked wrong | Real DOM: skip → `header` → `main#content` → `footer` | **NOT REPRODUCIBLE** | CDP landmark check on `/ru/contacts` and `/ru/company` |

### QA report count note

`QA_REPORT.md` executive summary said **P3: 4**, but only three P3 issues were filed (BUG-004, BUG-005, BUG-007). **No BUG-008 exists.** Summary count was inconsistent; no invented bug.

---

## Modified files

- `proxy.ts` — async published-slug gate
- `lib/http/published-slug.ts` — Turso/HTTP lookup + async API
- `lib/i18n/ui.ts` — `nav.documents` RU/EN
- `components/layout/SiteHeader.tsx` — Documents in desktop nav
- `components/layout/MobileNav.tsx` — Documents in overlay
- `components/layout/SiteFooter.tsx` — Documents via shared nav list (no duplicate entry)
- `components/inquiry/ProjectInquiryForm.tsx` — required semantics

**Tests added:** none kept in `npm test` (node runner cannot resolve `@/` imports used by the slug helper). Existing inquiry/slug/locale tests unchanged.

---

## Checks

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS (11) |
| `npm run build` | PASS (Proxy middleware listed) |
| Browser regression (local) | PASS — 404 statuses, menu Documents, form required |
| CMS smoke (production admin session) | PASS — dashboard/projects list still loads; no data mutations in this stage |

---

## Data / content

**PRESERVED** — no CMS records created/edited/deleted; no inquiry submits; no global settings changes; no logout.

---

## Remaining risks

1. **BUG-001 on Vercel** needs deploy to take effect; local file DB + Turso HTTP path verified in code; confirm HTTP 404 on production after deploy.
2. **BUG-006** Payload admin chrome still mixed EN/RU until a dedicated i18n pass.
3. **Publish revalidation lag** (from original QA) unchanged — editors may need a short wait/hard refresh after publish.
4. Media/document upload durability on Vercel remains out of scope (prior blocked items).

---

## Client handoff gate

- No P0/P1  
- Confirmed P2 fixed in codebase (001, 002); 003 WAD  
- Important P3: 004 fixed; 005/007 not real defects  
- P4 deferred with reason  
- Build/lint/typecheck/tests pass  
- No test data left from this stage  
