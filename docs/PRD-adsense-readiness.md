# PRD: AdSense-Ready SajiloTools + Removal of Donation ("चाय पिउनुहोस्") Feature

**Owner:** SajiloTools team
**Status:** In progress
**Last updated:** 2026-08-06

---

## 1. Background

SajiloTools is a Next.js (App Router) site offering 100+ free online tools (PDF, image, text, Nepal-specific utilities, etc.). The team wants to monetize via Google AdSense. Two things are needed:

1. The site's technical/content foundation must meet AdSense's program policies well enough to pass review and perform well once live.
2. The existing "Support SajiloTools ☕ / चाय पिउनुहोस्" donation feature (eSewa/Khalti tip jar) should be removed — it's redundant with ad monetization, adds payment-handling surface area/liability, and clutters the UI right where ad placements will go.

## 2. Goals

- Get the site approved by Google AdSense on the first review pass.
- Maximize approved ad placements' performance without hurting UX or Core Web Vitals.
- Cleanly remove the donation feature (UI, API routes, env vars, assets) with zero dead code or broken links.
- Keep the codebase in a state where adding real ad units later is a 5-minute job.

## 3. Non-goals

- Building a full analytics/reporting dashboard for ad revenue.
- Redesigning the site's visual identity.
- Re-introducing any alternate monetization (affiliate, sponsorships) — out of scope for this PRD.

## 4. Feature A — Remove the donation ("chiya") feature

### 4.1 What it was
A modal (`SupportModal.tsx`) triggered from the header ("Support ☕" button, desktop + mobile), letting users tip via eSewa/Khalti QR codes or a phone number, with a Nepali headline "चाय पिउनुहोस् ☕" (lit. "please drink tea"). Backed by:
- `src/components/SupportModal.tsx`
- Header trigger buttons in `src/components/layout/SiteHeader.tsx` (desktop nav + mobile menu "COMMUNITY" section)
- `src/app/api/payment/esewa/initiate/route.ts`, `src/app/api/payment/khalti/initiate/route.ts`
- `src/lib/esewa.ts`, `src/lib/khalti.ts`
- `src/app/payment/success/page.tsx`, `src/app/payment/failure/page.tsx`
- `public/images/qr/esewa-qr.png`, `khalti-qr.png`
- Env vars `NEXT_PUBLIC_ESEWA_ID`, `NEXT_PUBLIC_KHALTI_ID`

### 4.2 Requirements
| # | Requirement | Status |
|---|---|---|
| A1 | Remove Support buttons from desktop header and mobile menu | ✅ Done |
| A2 | Delete `SupportModal.tsx` and all imports/state referencing it | ✅ Done |
| A3 | Delete payment API routes and provider libs (`esewa.ts`, `khalti.ts`) | ✅ Done |
| A4 | Delete `/payment/success` and `/payment/failure` pages | ✅ Done |
| A5 | Delete unused QR code images | ✅ Done |
| A6 | Remove donation env vars from `.env.example` | ✅ Done |
| A7 | Sweep repo for dangling references (`grep`) | ✅ Done — none found |
| A8 | Manual smoke test: header renders, mobile menu opens, no console errors | ⬜ To verify locally with `npm run dev` |

### 4.3 Acceptance criteria
- No visible "Support"/"चाय"/coffee-cup UI anywhere on the site.
- `npm run build` completes with no TypeScript errors related to removed files.
- No 404s from old QR image or `/payment/*` links (checked via sitemap + manual click-through).

## 5. Feature B — AdSense readiness

### 5.1 Requirements

**B1. Account & site verification**
- Apply at adsense.google.com with the production domain.
- Site already has Google Search Console verification meta tag (`NEXT_PUBLIC_GSC_VERIFICATION` in `layout.tsx`) — reuse this, don't duplicate verification methods.

**B2. AdSense script injection**
- Global `<script>` loader added to `src/app/layout.tsx`, gated behind `NEXT_PUBLIC_ADSENSE_CLIENT_ID` so local/dev/staging builds don't load ads. — ✅ Done

**B3. `ads.txt`**
- `public/ads.txt` created with placeholder `pub-0000000000000000`. Must be replaced with the real publisher ID **before** requesting review, or AdSense will flag it. — ✅ Scaffolded, ⬜ needs real ID

**B4. Reusable ad unit component**
- `src/components/AdUnit.tsx` created (`<AdUnit slot="..." />`), renders nothing if no client ID is set (avoids empty/broken ad boxes pre-approval). — ✅ Done

**B5. Content policy compliance**
- Privacy Policy page: exists at `/privacy-policy` — ⬜ verify it discloses use of Google AdSense/cookies specifically (AdSense requires this explicitly, generic privacy text isn't enough).
- Terms page: exists at `/terms` — ✅
- Contact page: exists at `/contact` — ✅
- No pages that are thin/duplicate/under-construction — ⬜ audit all tool pages have real, unique content (not just a bare tool with no description).

**B6. Technical SEO baseline (helps both approval & ad revenue via traffic)**
- `robots.ts` — ✅ exists, allows crawling, points to sitemap.
- `sitemap.ts` — ✅ exists.
- Structured data (Organization/WebSite/CollectionPage JSON-LD) — ✅ already in `layout.tsx`.
- Per-page metadata (title/description) — ✅ pattern exists via `template: "%s | SajiloTools"`.

**B7. Ad placement plan** (once approved)
- Above-the-fold: none (avoid accidental-click policy violations near tool "Convert/Download" buttons).
- Between tool description and tool UI on each `/tools/[slug]` page: one `<AdUnit>` in-article slot.
- Sidebar (desktop only, ≥1024px) on high-traffic list pages (`/tools`, homepage).
- Footer: one banner unit.
- Explicitly avoid: placing ads directly beside/under file upload or "Download result" buttons — Google penalizes ads that could be mistaken for app UI/buttons.

**B8. Performance guardrails**
- Ads must load `async` — ✅ already set in the script tag.
- Reserve layout space for ad slots (fixed min-height container) to avoid Cumulative Layout Shift once ads render — ⬜ to implement per placement when real slots are added.
- Re-run Lighthouse/PageSpeed after ads go live; target no regression >10 points on mobile performance score.

**B9. Legal/consent (if targeting EU/UK traffic)**
- If analytics show meaningful EU traffic, a consent management platform (CMP) banner is required before ads load (Google's EU user consent policy). — ⬜ Not yet scoped; flag for follow-up PRD if EU traffic is significant.

### 5.2 Acceptance criteria
- AdSense dashboard shows "Approved" status.
- `public/ads.txt` served at `https://<domain>/ads.txt` with the real publisher ID, verified via AdSense's ads.txt checker.
- Lighthouse mobile performance score after ad integration ≥ pre-ad baseline − 10.
- Zero AdSense policy violation emails/warnings within first 30 days.

## 6. Rollout plan

1. ✅ Remove donation feature (this PR).
2. Deploy to production.
3. Fill in real `NEXT_PUBLIC_ADSENSE_CLIENT_ID`, update `ads.txt` with real pub ID, redeploy.
4. Submit AdSense review request.
5. On approval: create ad units in AdSense dashboard, wire slot IDs into `<AdUnit>` placements per §5.1 B7.
6. Monitor Search Console + AdSense reports weekly for the first month; watch for policy warnings or CWV regressions.

## 7. Open questions

- Do we want a cookie-consent banner now, proactively, or only once EU traffic is confirmed meaningful? (affects B9 timeline)
- Any tool pages currently thin on content that should get a paragraph of explanatory copy before requesting AdSense review (B5)?
