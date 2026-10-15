# New Foster — Pre-Handoff Smoke Report (Stage B)

**Date:** 2026-10-15

## 1. Verdict

**PENDING DEPLOYMENT VERIFICATION** for the hosted review URL.

| Build | Verdict |
| --- | --- |
| **Local** (`http://localhost:3001`, Stage A working tree) | **READY WITH KNOWN LIMITATIONS** |
| **Vercel** (`https://new-foster.vercel.app`) | **NOT READY for Stage A handoff** — still serves pre–Stage A code |

Client acceptance testing on **Vercel alone must wait** until Stage A is committed and deployed (or a Preview URL is provided). Local build is functionally ready for review with disclosed limitations below.

This is **not** production certification.

---

## 2. Tested Build

| Item | Value |
| --- | --- |
| Branch | `main` |
| Remote HEAD | `fea8210` (`fix:cms`) — matches `origin/main` |
| Local working tree | **Uncommitted Stage A fixes** on top of `fea8210` (`proxy.ts`, `published-slug.ts`, nav, inquiry form, etc.) |
| Local test URL | `http://localhost:3001` (`next dev`) |
| Hosted URL | `https://new-foster.vercel.app` |
| Stage A on Vercel? | **No** — missing-slug routes still **HTTP 200**; header menu still omits Documents; form fields lack `required` |
| Stage A on local? | **Yes** — missing slugs **HTTP 404**; menu includes Документы; required semantics present |

---

## 3. Smoke Test Results

| Area | Result | Notes |
| --- | --- | --- |
| Public routes RU/EN (local) | PASS | All major pages HTTP 200: home, company, expertise, equipment, projects, standards, news, documents, contacts |
| Public routes (Vercel) | PASS (baseline) | Site loads; Stage A regressions remain |
| Navigation (local) | PASS | Menu includes Документы; footer includes Documents |
| Navigation (Vercel) | FAIL Stage A | Overlay: Company…News → Contacts — **no Documents** |
| RU/EN | PASS (local) | Switch and EN copy OK |
| BUG-001 HTTP 404 | PASS local / FAIL Vercel | Local: project/news/equipment miss → **404**; example `afipsky-pm3` → **200**. Vercel miss → **200** |
| BUG-002 Documents nav | PASS local / FAIL Vercel | Confirmed above |
| BUG-003 Equipment search | PASS (local) | `?q=трубчатые` filters to Трубчатые печи |
| BUG-004 Required fields | PASS local / FAIL Vercel | Local: name/company/phone/email/consent `required`; Vercel: no required state |
| BUG-005 Consent toggle | PASS (DOM) | `readOnly: false`, `disabled: false`, `required: true` (local) |
| BUG-007 Landmark order | PASS | `HEADER` → `MAIN#content` → `FOOTER` |
| Forms (empty submit) | NOT RE-RUN deep | Semantics verified; full submit **NOT VERIFIED — production SMTP side effect avoided** |
| CMS (local) | PASS | Dashboard + Projects list load; auth session OK; create controls present |
| CMS (Vercel) | PASS (read-only) | Projects list still available from earlier session |
| CRUD re-cycle | SKIPPED | Prior full QA covered; no safe need; data safety prioritized |
| Media / Documents uploads | LIMITATION | Local filesystem `media/` + `media/documents/`; **no S3/Blob adapter wired**; README: not durable on Vercel |
| Responsive 390 | PASS | Equipment page: no horizontal overflow |
| Console / network | NOTE | Local Next.js DevTools showed a **hydration warning** on homepage (layout). No production 500s observed. Extension noise ignored |
| Cleanup | N/A | No QA records created this stage |

---

## 4. Findings

1. **Handoff blocker for Vercel URL:** Stage A not deployed (uncommitted locally). Soft 404 + missing Documents in header remain on production URL.
2. **Media/Documents persistence:** CMS UI exposes uploads, but storage is local `staticDir` only. On Vercel, uploads will not survive redeploys. Treat as **known limitation / workflow blocker** until object storage is configured — disclose to client.
3. **Dev hydration warning (local):** Next.js overlay reported a hydration mismatch from `app/(frontend)/[locale]/layout.tsx`. Not confirmed as a production visual break; defer unless seen after production build deploy.
4. **No new P0/P1 functional breakers** on the Stage A local build for public browse + CMS open.

---

## 5. Remaining Risks

- Stage A must be **committed + deployed** before client uses Vercel.
- Media/document uploads **not production-capable** on Vercel without object storage.
- Inquiry **successful submit / email** not verified (SMTP risk).
- Payload admin chrome still mixed EN/RU (BUG-006 deferred).
- Short CMS→public revalidation lag after publish (known).

---

## 6. Client Handoff Checklist

- [ ] Correct build deployed to review URL (**pending** — Stage A uncommitted/undeployed)
- [x] Public site works (**local** Stage A; Vercel baseline OK but missing Stage A)
- [x] CMS works (local + Vercel read)
- [x] No test data remains (none created)
- [x] Critical browse/nav/404/form-semantics verified **on local Stage A**
- [x] Unverified functionality disclosed (SMTP submit; Vercel media durability)
- [ ] Review credentials/access provided securely (**out of band**)

---

## 7. Final Recommendation

**Do not hand the current Vercel URL to the client as the Stage A review build.**

1. Commit Stage A changes.
2. Deploy to Vercel (or a Preview URL).
3. Re-check BUG-001 (true HTTP 404) and BUG-002 (Documents in menu) on that URL (~5 minutes).
4. Then invite the client to acceptance testing on that deployed URL.

**Local Stage A build:** ready for internal/client review **with known limitations** (media persistence on hosted env; inquiry email untested).

**Media/Documents:** not production-capable for durable uploads on Vercel today — disclose explicitly if the client will upload during review.
