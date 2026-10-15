# New Foster Full Manual QA Report

## 1. Executive Summary

**Verdict: PASS WITH MINOR ISSUES**

Browser-driven QA of production `https://new-foster.vercel.app` (public + authenticated Payload admin) completed on 15 Oct 2026. Core CMS CRUD and CMS→public publish/draft/update/delete sync work for the main content types. No P0/P1 blockers. Production data restored to pre-QA baseline.

| Metric | Value |
| --- | --- |
| Public routes checked (RU+EN) | 26+ path probes + interactive walk |
| CMS modules inventoried | 14 collections + 1 global |
| CRUD entities lifecycle-tested | 9 (projects, articles, article-categories, project-categories, equipment-groups, equipment-categories, equipment, metrics, expertise) |
| Bugs | P0: 0 · P1: 0 · P2: 3 · P3: 4 · P4: 1 |
| Restoration | **Confirmed restored** — no `QA_TEST_*` remaining; CMS counts match baseline |

## 2. Test Environment

| Item | Value |
| --- | --- |
| Public URL | https://new-foster.vercel.app/ |
| CMS URL | https://new-foster.vercel.app/admin |
| Browser | Cursor IDE browser (Chromium-based automation) |
| Date | 2026-10-15 |
| Locales | RU (default), EN |
| Viewports exercised | ~desktop default, ~390×844 mobile emulation |
| Auth | Existing admin session reused (no logout) |

## 3. Public Route Coverage

| Route | RU | EN | Desktop | Mobile | Result | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | OK | OK | OK | OK (390) | Pass | Hero, CTAs, inquiry form present |
| `/company` | OK | probed | OK | — | Pass | Breadcrumbs OK |
| `/expertise` | OK | probed | OK | — | Pass | 5 competencies + steps |
| `/equipment` | OK | probed | OK | — | Pass | Filters + search (`?q=`) |
| `/equipment/[slug]` | OK | — | OK | — | Pass | CMS-published QA item rendered; deleted after |
| `/projects` | OK | probed | OK | — | Pass | Shows hardcoded Afipsky example when CMS empty |
| `/projects/afipsky-pm3` | OK | probed | OK | — | Pass | Intentional hardcoded example |
| `/projects/[slug]` CMS | OK | OK | OK | — | Pass | Publish/update/EN/unpublish/delete sync verified |
| `/standards` | OK | probed | OK | — | Pass | Directory structure / placeholders |
| `/news` | probed | probed | — | — | Pass | Listing structure |
| `/news/[slug]` | OK | — | OK | — | Pass | CMS article sync (ISR delay possible) |
| `/documents` | probed | probed | — | — | Pass | Structure; downloads unavailable by design |
| `/contacts` | OK | probed | OK | — | Pass | Form validation exercised |
| unknown `/does-not-exist-qa` | 404 | 404 | OK | — | Pass | True HTTP 404 |
| unknown project/news slug | 200 + 404 UI | 200 + 404 UI | OK | — | Fail (soft) | See BUG-001 |

## 4. CMS Coverage

| Module | List | Create | Read | Update | Delete | Publish | Localization | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Содержание сайта (Site global) | — | — | OK | OK* | — | N/A | RU/EN fields | Pass (*minimal phone change + restore) |
| Пользователи | OK | [B] | OK | [B] | [B] | N/A | N/A | Blocked — avoid auth risk |
| Изображения (Media) | OK empty | [B] | — | — | — | N/A | alt localized | Blocked — upload/durable storage on Vercel |
| Документы | OK empty | [B] | — | — | — | Yes | title/desc | Blocked — requires file upload |
| Рубрики (article-categories) | OK | OK | OK | OK | OK | Yes | title | Pass |
| Материалы (articles) | OK | OK | OK | OK | OK | Yes | title/body/excerpt | Pass |
| Группы оборудования | OK | OK | OK | — | OK | Yes | title | Pass |
| Категории оборудования | OK | OK | OK | — | OK | Yes | title + group relation | Pass |
| Оборудование | OK | OK | OK | OK | OK | Yes | title/summary | Pass |
| Направления проектов | OK | OK | OK | — | OK | Yes | title | Pass |
| Проекты | OK | OK (UI) | OK | OK | OK | Yes | title RU/EN | Pass — empty-save validation via UI |
| Компетенции | OK | OK | OK | — | OK | Yes | title/text | Pass (QA draft only; seed rows untouched) |
| Показатели | OK | OK | OK | OK | OK | Yes + approved | label | Pass |
| Файлы запросов | OK empty | [B] | — | — | — | N/A | — | Blocked — upload / sensitive |
| Запросы | OK empty | [B] | — | — | — | N/A | — | Blocked — full submit may email |

`[B]` = blocked (see §11). For non-project entities, create/update/delete were executed via authenticated Payload REST from the admin session and verified in admin lists + public pages. Project create empty-validation and successful create were exercised in the admin UI.

## 5. CMS → Public Integration

| Entity | Create sync | Update sync | Status sync | Delete sync | Result |
| --- | --- | --- | --- | --- | --- |
| Projects | Draft hidden; publish shows | Title update reflected | Draft removes from public | 404 UI after delete | Pass |
| Articles | Draft hidden; publish shows (possible short ISR lag) | Update reflected | — | Removed | Pass w/ note |
| Equipment | Publish shows (possible short ISR lag) | Update reflected | — | Removed | Pass w/ note |
| Metrics | Create/publish OK in CMS | approved flag set | Public visibility gated by approved (by design) | Deleted | Pass |
| Site global | — | Phone change appeared on contacts | — | Restored to `null` | Pass |

## 6. Forms

### Public inquiry (homepage + `/contacts`)

| Check | Result |
| --- | --- |
| Empty submit | Shows field errors: name/company/phone/email + consent message |
| Loading state | Button becomes «Отправка» / disabled during submit |
| HTML `required` | **Not set** on inputs (custom validation only) — BUG-004 |
| Consent checkbox a11y | Exposed as `readonly` in accessibility tree — BUG-005 |
| Full successful submit | **BLOCKED** — may trigger SMTP to production inbox |
| File upload constraints | UI states PDF/DOC/DOCX/XLS/XLSX, max 3 × 15 MB |

### CMS forms

| Check | Result |
| --- | --- |
| Projects empty Save | Validation badge «Общие 1», required «Объект» highlighted |
| Projects create with title+slug | Saved as draft id=1, redirected to edit |

## 7. Responsive

| Viewport | Checks | Result |
| --- | --- | --- |
| Default desktop | Home, company, expertise, equipment, projects, contacts, standards | Pass |
| ~390 mobile | EN home: no horizontal overflow (`scrollWidth === clientWidth`); Menu opens/closes | Pass |
| Header menu | Opens («Закрыть»), Escape closes; **Documents missing from overlay menu** | Fail — BUG-002 |
| CMS | Usable at laptop width; dark admin UI OK | Pass |

## 8. Localization

| Check | Result |
| --- | --- |
| RU↔EN URL switch | Works (`/ru/...` ↔ `/en/...`) |
| EN home copy | Fully English (H1 «Engineering, manufacturing, results») |
| Skip link | RU «К содержанию» / EN «Skip to content» |
| CMS locale switcher | «Locale: Русский» present |
| CMS chrome language | Mixed RU/EN («No Results.», «Log out», «Search by Объект») — BUG-006 |
| CMS content locales | Project/article EN titles rendered on `/en/...` |

## 9. Console / Network Findings

- No application uncaught errors captured on walked public pages (extension noise discarded).
- Payload REST CRUD: create `201`, update/delete `200` for QA entities.
- Soft-404 detail routes often return **HTTP 200** with in-page 404 UI (projects); some news misses returned **HTTP 404** — inconsistent status codes.
- After publish, immediate `fetch` of article/equipment sometimes returned 404 before content appeared (ISR/revalidation lag ~1–2s+). Browser navigation shortly after showed content.

## 10. Bugs

### BUG-001 — Soft 404 returns HTTP 200 for missing project (and similar) slugs

**Severity:** P2  
**Area:** Public / Routing  
**Route:** `/ru/projects/nonexistent-qa-slug` (also observed pattern on news)  
**Environment / viewport:** Production desktop  
**Preconditions:** None  
**Steps to reproduce:**
1. Open `/ru/projects/nonexistent-qa-slug`.
2. Observe UI and HTTP status.

**Expected:** HTTP 404 (or documented equivalent) with not-found page.  
**Actual:** Branded 404 UI («Такой страницы нет в схеме») but response status **200**. Unknown top-level path `/ru/does-not-exist-qa` correctly returns **404**.  
**Reproducibility:** 100%  
**Console:** none  
**Network:** GET 200  
**Notes:** SEO/crawlers may index empty/error pages.

---

### BUG-002 — Header menu omits «Документы» / Documents

**Severity:** P2  
**Area:** Public / Navigation  
**Route:** Any page → Меню  
**Environment / viewport:** Desktop & mobile overlay  
**Preconditions:** None  
**Steps to reproduce:**
1. Click «Меню».
2. Compare overlay links to footer links.

**Expected:** All primary sections reachable from header menu, including Documents.  
**Actual:** Overlay includes Company, Expertise, Equipment, Projects, Standards, News, Contacts (+ CTA). **Documents only in footer**.  
**Reproducibility:** 100%  
**Evidence:** Menu snapshot on `/ru/expertise`  
**Notes:** Footer still has Documents — workaround exists.

---

### BUG-003 — Equipment search does not filter until GET navigation; Enter submit unreliable in automation

**Severity:** P2  
**Area:** Public / Search  
**Route:** `/ru/equipment`  
**Environment / viewport:** Desktop  
**Preconditions:** None  
**Steps to reproduce:**
1. Type `трубчатые` in search field.
2. Observe list still shows all cards.
3. Navigate to `/ru/equipment?q=трубчатые`.

**Expected:** Typing+Enter submits GET form and filters.  
**Actual:** Filtering works when `?q=` is present (only «Трубчатые печи» remains). Enter from field did not change URL during automation.  
**Reproducibility:** intermittent for Enter; 100% that client-side live filter is absent (GET form by design)  
**Notes:** May be automation quirk; confirm manually that Enter submits. UX expect live filter is unmet.

---

### BUG-004 — Inquiry form inputs lack native `required` / HTML5 validation

**Severity:** P3  
**Area:** Public / Forms / a11y  
**Route:** `/ru/contacts`, homepage inquiry  
**Steps:** Inspect form fields before submit.  
**Expected:** Required fields use `required` (or equivalent ARIA).  
**Actual:** `required=false` on name/company/phone/email/consent; validation appears after server/action round-trip.  
**Reproducibility:** 100%  

---

### BUG-005 — Consent checkbox exposed as readonly in accessibility tree

**Severity:** P3  
**Area:** Public / a11y  
**Route:** `/ru/contacts`  
**Actual:** Snapshot shows checkbox `states: [readonly]` while visual UI allows unchecked + error «Нужно согласие…».  
**Reproducibility:** 100% in automation tree  

---

### BUG-006 — CMS admin chrome mixes English and Russian

**Severity:** P4  
**Area:** CMS / Localization  
**Route:** e.g. `/admin/collections/projects`  
**Actual:** «No Results.», «Log out», «Search by Объект», «Create new Проект».  
**Expected:** Consistent RU admin UI (per README).  

---

### BUG-007 — Accessibility tree order places footer before main content on several pages

**Severity:** P3  
**Area:** Public / a11y  
**Route:** e.g. `/ru/contacts`, `/ru/news/[slug]`, `/ru/standards`  
**Actual:** Snapshot lists footer navigation before breadcrumb/H1. Visual layout still readable.  
**Notes:** Impacts screen-reader order / skip-to-content effectiveness after skip target.

## 11. Blocked Tests

| Test | Reason |
| --- | --- |
| Inquiry successful submit | Possible production SMTP / irreversible external email |
| Media / Documents file upload CRUD | Requires binary upload; Vercel media not durable per README |
| Inquiry-files create | Sensitive storage; upload-only |
| Users create/update/delete/logout | Avoid locking shared admin session |
| Full keyboard matrix on every page | Partial only (Escape menu, Tab not exhaustively mapped) |
| Every CMS field on every tab (SEO/gallery/etc.) | Spot-checked primary fields; deep gallery/SEO left as residual risk |

## 12. Cleanup / Restoration Audit

### PRE-QA BASELINE (captured)

| Collection | Count | Notes |
| --- | --- | --- |
| projects | 0 | Public Afipsky is hardcoded example |
| articles | 0 | |
| documents | 0 | |
| equipment | 0 | |
| equipment-groups | 3 | Промышленные печи, Технологическое оборудование, Комплектующие |
| equipment-categories | 9 | |
| project-categories | 3 | |
| article-categories | 5 | |
| expertise | 5 | |
| metrics | 0 | |
| media | 0 | |
| inquiries | 0 | |
| inquiry-files | 0 | |
| users | 1 | editor@newfoster.local |
| Site global | phone/email/address null; home/pages/workflow/principles populated RU+EN | |

### Post-QA checklist

- [x] No QA entities remain (API search for `QA_TEST` / `qa-test` empty)
- [x] No QA uploads remain visible (media still 0)
- [x] No existing entities were deleted (seed categories/groups/expertise counts match)
- [x] Existing records contain original content (groups/categories/expertise titles unchanged)
- [x] Existing ordering restored (QA used sortOrder 999 only; deleted)
- [x] Existing statuses restored (no leftover published QA)
- [x] RU content restored
- [x] EN content restored
- [x] Global settings restored (`phone` back to `null` after test)
- [x] Public site no longer shows QA content (deleted slugs show not-found)
- [x] CMS no longer shows QA content (projects list «No Results»)
- [x] No temporary draft remains
- [x] No test slug remains
- [x] No test category/tag remains

## 13. Final Verdict

`PASS WITH MINOR ISSUES`

Release is acceptable for continued content work. Address BUG-001 (HTTP status on soft 404) and BUG-002 (Documents in header menu) before marketing push / SEO emphasis. Revalidation lag on new publishes is worth documenting for editors (hard refresh / short wait).
