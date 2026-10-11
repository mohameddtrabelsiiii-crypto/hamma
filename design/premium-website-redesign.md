# TaskForge AI — Premium Website Redesign

**Status:** design brief on isolated branch, not deployed.

## Brand
TaskForge AI — Secure Business Automation & Cloud Solutions.
Tagline: Automate smarter. Operate securely. Scale faster.
Tone: calm, credible, modern, technically capable; avoid hype and unverified guarantees.

## Visual direction
- Enterprise-grade dark navy (#07111F), ink (#0C1929), off-white (#F4F7FA), restrained emerald (#38C9A0) and subtle slate borders.
- Editorial, spacious typography; accessible contrast; refined oversized headings and concise copy.
- Minimal architectural grid and workflow-line graphics; avoid stock hacker imagery, fake trust badges and fabricated testimonials.
- Responsive navigation, polished cards, subtle hover and reduced-motion support.

## Homepage structure
1. Nav: Services, How it works, Automation demo, Request assessment, Client portal.
2. Hero: **Secure automation for ambitious businesses.** Supporting copy: We help teams clean operational data, simplify repetitive work, and review cloud configurations—with clearly scoped delivery and human oversight.
3. Primary CTA: **Request an assessment** linking to existing `/automation` flow. Secondary CTA: **Explore working demo** linking to `/automation/demo`.
4. Three service pillars: Business Data Rescue; Workflow Automation; Authorized Cloud Configuration Review. Prices are *not* hardcoded into checkout or displayed as guaranteed quotes.
5. Proof of process (not invented client proof): Discover → Scope → Pilot → Validate → Handover.
6. Demo showcase: existing LeadOps browser-only CSV pilot at `/automation/leadops` with clear note that it is rules-based and local to browser.
7. Trust principles: least-privilege, explicit authorization, human approval, measured outputs, transparent limitations.
8. Project request and existing customer portal with full existing behavior retained.
9. Footer with accurate contact, privacy and legal links only if those destinations exist.

## Implementation boundaries
- Preserve all existing API endpoints, forms, field names, selectors, validation, account flows, and server-side security checks.
- Do not claim certifications, customers, revenue, penetration-testing qualifications, or guaranteed outcomes.
- Keep existing niche service URLs functional for SEO and legacy inquiries; reduce their prominence rather than deleting them.
- Do not activate Whop checkout before credentials, quote currency, webhook and real settlement validation.
- Avoid paid assets, external font/CDN dependencies and heavy animation.

## Release checklist
- Make changes in an isolated branch and review a visual preview.
- Run existing Node tests and build scripts.
- Test desktop/mobile, keyboard access, reduced motion, contact form, login, status and checkout-denial flows.
- Confirm new navigation targets resolve, canonical tags are correct, and no private information leaks.
- Only then deploy using authenticated Cloudflare workflow; a GitHub commit alone does not update live Pages.
