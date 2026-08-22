# Closer — Land the Job, Not Just Apply (job & client acquisition autopilot)

**Live:** https://makavelimachiavelli.github.io/closer/

**Allen's #1 priority product (PRIORITY-CLOSER.md) — built to 11/10 spec.**

## What it does (the actual problem: GETTING RESPONSES)
Paste CV → paste job post → Closer produces, per application:
1. **ATS-tailored CV materials** — professional summary aimed at the post, skills reordered matched-first, keyword-loaded bullet skeletons (honest: missing skills flagged as "weave in / currently learning", never invented)
2. **Cover letter** — specific, short, evidence-based, with an honest gap paragraph
3. **Client DM** (Upwork/FB/Reddit) — observation → proof → 3-step scoped offer → CTA
4. **Day 0 / 3 / 7 follow-up sequence** — the discipline most applicants skip; tracker enforces it
5. **Interview prep** — JD-derived questions with STAR skeletons filled from the CV + PH-safe salary answer
Plus a **match score** (keyword match dial), matched/missing skill chips, and an **application tracker** (stages, due dates, copy-due-follow-ups, CSV).

## Buyer persona
Allen (and hundreds of thousands like him): BS IT, ~2.5 yrs experience, PH job market, applying to jobs on JobStreet/Indeed/OnlineJobs.ph/LinkedIn and gigs on Upwork/Reddit/FB groups. Pain = zero replies from generic applications. Free tier: full loop, 3 material sets, 5 tracker rows. PRO ₱199 one-time: unlimited + CSV.

## Demand evidence
The resume-tools market is saturated with generic builders (the exact insight in PRIORITY-CLOSER.md) — Closer differentiates on outreach + follow-up discipline, not document prettiness. Paid comparators: resume tailoring services ₱500–2k per CV, Kickresume/Rezi subscriptions, career coaches. This one is one-time ₱199 and private.

## Design (STACK.md compliance)
Tailwind CDN + daisyUI 4, Space Grotesk + Inter, lucide-ready, GSAP entrance (guarded), deep indigo #312e81 + amber #f59e0b, SVG wordmark, daisyUI tabs/collapse/table, hover-lift cards, radial score dial. All logic vanilla JS so jsdom tests run the real app (Alpine intentionally omitted: event-driven UI doesn't need it; keeps tests deterministic).

## Verification
**41/41 jsdom assertions** — parser (name/email/phone/skills/roles/years/bullets), matcher (score math, seniority), all 5 generators (specific content + honesty constraints), full UI flow (CV → match → materials → DM live-regen), tracker (add/stage/advance/counts/due dates), gating (3 free runs → paywall, PRO unlimited), CSV export, persistence. The suite caught 2 real bugs pre-deploy: substring skill matching ("Java" inside "JavaScript") on the JD side + a broken ternary in info capture.

## URL fetch
`Fetch` uses the public r.jina.ai reader proxy, fails gracefully, paste-always-works (JobStreet/LinkedIn block bots — documented in-UI).

## Deploy
```bash
../toolkit/deploy-pages.sh . closer
```

## Owner TODO (Allen, ~4 min)
Swap `gcash-qr.svg`, set `PRO_CODES` in `app.js` (`CLOSER-PRO-199`, `CLOSER-DEMO` placeholders), optional LemonSqueezy card link. **Then use it: 20 tailored applications this week.** Cross-linked from hub.
