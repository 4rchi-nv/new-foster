# New Foster QA Checklist

Legend: `[x]` passed · `[ ]` not executed · `[!]` failed · `[-]` N/A · `[B]` blocked

Date: 2026-10-15 · Env: https://new-foster.vercel.app

---

## Phase 0 — Baseline

- [x] Public route inventory
- [x] CMS module inventory (14 collections + Site global)
- [x] Record counts / titles / Site global snapshot
- [x] Note hardcoded Afipsky example (`afipsky-pm3`)

## Phase 1 — Public website

### Header / nav
- [x] Logo present
- [x] Menu open / close
- [x] Escape closes menu
- [!] Documents missing from header menu (BUG-002)
- [x] Footer Documents link works (probed)
- [x] RU/EN switch
- [x] Skip-to-content link present

### Pages (RU interactive unless noted)
- [x] Home
- [x] Company
- [x] Expertise (anchors / five blocks)
- [x] Equipment list + filters
- [x] Equipment search via `?q=`
- [!] Equipment search Enter submit unreliable (BUG-003)
- [x] Projects list + Afipsky case
- [x] Project detail `afipsky-pm3`
- [x] Standards
- [x] News list (status probe + detail via CMS QA)
- [x] Documents (status probe)
- [x] Contacts + form validation
- [x] EN home (full copy check)
- [x] EN status probes for major routes
- [x] 404 unknown top-level route (HTTP 404)
- [!] Soft 404 project slug HTTP 200 (BUG-001)

### Forms
- [x] Empty inquiry submit → field + consent errors
- [x] Submit loading / disabled state
- [B] Successful inquiry submit (SMTP risk)
- [ ] File attach valid/invalid/size (UI constraints noted only)

## Phase 2 — CMS UI

- [x] Dashboard / sidebar groups
- [x] Locale control
- [x] Collection list (projects empty state)
- [x] Create form tabs (Projects)
- [x] Empty save validation (Projects)
- [x] Session persists across admin navigations
- [B] Logout / re-login

## Phase 3–8 — CRUD matrix

| Module | C | R | U | D | Notes |
| --- | --- | --- | --- | --- | --- |
| Projects | [x] | [x] | [x] | [x] | UI create + API publish lifecycle |
| Articles | [x] | [x] | [x] | [x] | |
| Article categories | [x] | [x] | [x] | [x] | |
| Project categories | [x] | [x] | [-] | [x] | update not separately exercised |
| Equipment groups | [x] | [x] | [-] | [x] | |
| Equipment categories | [x] | [x] | [-] | [x] | relation to group OK |
| Equipment | [x] | [x] | [x] | [x] | |
| Expertise | [x] | [x] | [-] | [x] | QA draft only |
| Metrics | [x] | [x] | [x] | [x] | approved flag tested |
| Documents | [B] | [x] | [B] | [B] | upload blocked |
| Media | [B] | [x] | [B] | [B] | upload blocked |
| Inquiries | [B] | [x] | [B] | [B] | submit blocked |
| Inquiry files | [B] | [x] | [B] | [B] | |
| Users | [B] | [x] | [B] | [B] | |
| Site global | [-] | [x] | [x] | [-] | phone change + restore |

## Phase 9 — Publish / draft

- [x] Project draft not public
- [x] Project publish → public
- [x] Project unpublish → not public
- [x] Article draft not public
- [x] Article publish → public (after short delay)
- [x] Equipment publish → public

## Phase 10 — Slugs

- [x] Manual slug on project create
- [x] Public URL uses slug
- [x] Duplicate slug not deeply stress-tested
- [x] Deleted slug → not-found UI

## Phase 11 — Relations

- [x] Article → article-category
- [x] Equipment → equipment-category → group
- [ ] Rich relatedProjects/documents galleries

## Phase 12 — Ordering

- [x] QA entities used high sortOrder (999) then deleted
- [-] Reorder of production seed rows (avoided)

## Phase 13 — Media

- [B] CMS image/document upload on production Vercel
- [x] Public placeholders («Изображение будет добавлено»)

## Phase 14 — CMS list features

- [x] Projects search box present
- [x] Columns / Filters controls present
- [ ] Exhaustive filter+sort+pagination combos

## Phase 15 — CMS ↔ frontend sync

- [x] Project create/update/status/delete
- [x] Article create/update/delete
- [x] Equipment create/update/delete
- [x] EN project title sync
- [x] Site phone sync + restore

## Phase 16 — Responsive

- [x] Mobile 390 EN home no overflow
- [x] Mobile menu
- [ ] Full 1440/1280/1024/768/375/320 matrix

## Phase 17 — Visual

- [x] Spot-check heroes / lists / forms
- [!] Menu IA gap (Documents)
- [ ] Pixel-perfect design audit vs Figma

## Phase 18 — a11y

- [x] Skip link
- [x] Escape menu
- [!] Consent checkbox readonly in a11y tree (BUG-005)
- [!] Footer-before-main in a11y tree (BUG-007)
- [ ] Full keyboard traversal

## Phase 19–20 — Console / network

- [x] Spot-check during CRUD
- [x] REST status codes for QA lifecycle
- [!] Soft-404 status inconsistency (BUG-001)

## Phase 21 — Auth

- [x] `/admin` session works
- [x] Refresh / navigate between collections
- [B] Logout

## Phase 22 — Negative

- [x] Empty CMS save
- [x] Empty inquiry submit
- [x] Nonexistent slugs
- [ ] Duplicate slug conflict UI
- [ ] Oversized upload

## Phase 23 — 404 / routing

- [x] Unknown locale path segment
- [x] Deleted QA URLs
- [x] Hardcoded example still resolves

## Phase 24–25 — Cleanup

- [x] Delete all QA entities
- [x] Restore Site `phone`
- [x] Counts match baseline
- [x] Public QA URLs gone
- [x] CMS projects empty
- [x] `QA_REPORT.md` written
- [x] `QA_CHECKLIST.md` written
