# Baeu Mobile Deep Audit

Date: 2026-06-30T01:20Z
Auditor: Codex using `brutal-visual-audit`
Target: `https://baeu-learning.vercel.app`
Deployment under audit: `388ac66` / `dpl_FvzFUVqEeJfqXyo3bkgcXdpnkdBS`

## Evidence Captured

- Browser wrapper deploy-smoke: `/`, `/#/about`, `/#/progress`, `/#/results`, `/#/chat` all returned `200`, `bad_count=0`.
- Mobile Playwright capture: 390x844 iPhone-ish and 360x740 narrow Android-ish.
- Screenshots: `audit-smokes/2026-06-30-mobile-deep-audit/*.png`.
- Raw metrics: `mobile-audit-raw.json`, `mobile-audit-stable.json`.
- Synthetic users created during capture were deleted successfully:
  - `mobile-audit-*`: delete-user returned `200 { success: true }`.
  - `mobile-stable-*`: delete-user returned `200 { success: true }`.
  - `mobile-click-*`: delete-user returned `200 { success: true }`.
- Console/page errors: `0`.
- Horizontal overflow: `0` findings at 360px and 390px.

## Brutal Verdict

Mobile is not broken. The responsive shell holds up: no horizontal overflow, the practice card is tappable, Results is now much clearer, Chat cards are readable, and About works as a public trust page. But the mobile product still has two sharp problems: the top navigation consumes too much first-viewport space and transient toast overlays can cover it, while Progress is a dead end for a fresh/low-data learner. The app is usable; it is not yet mobile-native.

## Findings

- [P1] Progress mobile has no closure action for the most common early state.
  - Evidence: `stable-08-progress-ready.png`.
  - After signup or after tapping "See progress" too early, the user sees six empty metrics and "No skill data yet", but no "Start practice", "Do 5 cards", or "Back to today's queue".
  - Why it matters: the screen acknowledges there is no data but does not move the learner to the next useful action. On mobile, this feels like the product ended.
  - Fix: add a low-data Progress panel mirroring Results: one explanation, one recommendation, one primary CTA.

- [P1] Mobile nav is functional but not mobile-native.
  - Evidence: `stable-03-home-ready.png`, `click-chat.png`, `click-results.png`.
  - The nav wraps into two rows and consumes roughly the top 130px before any work appears. It also exposes Practice, Chat, Progress, Results, About, theme, Account, Log out all at once.
  - Why it matters: this is a desktop nav compressed onto a phone, not a mobile task bar. It weakens the "do today's job" intent and makes every screen start with navigation furniture.
  - Fix: use a 4-item bottom or compact tab bar for core learner tasks (`Today`, `Practice`, `Progress`, `Chat`) and move About/Account/Log out/theme behind a small menu.

- [P2] Signup success toast can cover the mobile nav and create visual ambiguity.
  - Evidence: `03-iphone390-home-today.png`, `06-iphone390-question.png`, `07-iphone390-feedback.png`.
  - The toast sits over top navigation after signup. It is temporary and not a workflow blocker, but it visually collides with route state and can hide where the user is.
  - Fix: on mobile, move toast to bottom or constrain it below the nav with a smaller width.

- [P2] Results is much better, but mobile still repeats "no data" too many times.
  - Evidence: `click-results.png`, `stable-09-results-ready.png`.
  - The low-data summary works. Below it, Daily Activity and Review Forecast repeat zero states. This is acceptable, but on mobile it elongates a screen whose correct action is simply "Do 5 cards".
  - Fix: for low-data mobile, collapse Daily Activity and Review Forecast behind a "Details" disclosure until at least 3 attempts.

- [P2] Public mobile landing starts with login, not with why Baeu matters.
  - Evidence: `01-iphone390-landing.png`.
  - The returning-user form is clean, but first-time mobile visitors see login before value. The demo/value prop appears only after scrolling.
  - Fix: on mobile public landing, show a compact value/mini-practice teaser above auth, or make signup the primary tab when no session exists and no remembered login signal exists.

- [P2] About is credible but long and card-heavy on mobile.
  - Evidence: `click-about.png`, `stable-11-about-ready.png`.
  - The sponsor trust block is useful, but it sits mid-page after several paragraphs, and every section is a big card. A sponsor inspecting mobile gets the point, but slowly.
  - Fix: move "For cohorts and sponsors" immediately after the intro on mobile, and compress the lower sections into shorter bands or accordions.

- [P3] Several tap targets are below the 44px mobile comfort floor.
  - Evidence: `mobile-audit-raw.json`, `mobile-audit-stable.json`.
  - Recurring small targets: theme toggle `36x36`, coachmark close `28x28`, logo link height `32`, Results select height `37`, demo option buttons around `42`.
  - Fix: set mobile minimum hit area to `44px` for icon buttons, close buttons, selects, and demo options.

## Screen Intent Map

### Public Landing

Intent: convert a visitor or returning learner into practice.
Primary user: learner or sponsor checking the app on a phone.
Start: user lands on canonical URL.
Middle: decide whether to log in, sign up, or try mini practice.
End: account created, demo completed, or About inspected.
Evidence: published question count, mini practice, About route.
Main actions: sign up, log in, try sample.
Missing states: remembered-user state; mobile-first signup/value ordering.
Fix: make first-time mobile see value/sample before a full login wall.

### Today / Home

Intent: tell the learner what to do now.
Primary user: signed-in learner.
Start: login/signup lands here.
Middle: see due count, weak focus, module recommendation.
End: start recommended module or mixed practice.
Evidence: `stable-03-home-ready.png`.
Main actions: start Hangul, mixed practice.
Missing states: nav compression; toast-safe layout.
Fix: compact mobile nav and bottom-position toast.

### Practice / Feedback

Intent: answer one card and get corrected.
Primary user: learner.
Start: module CTA or mixed practice.
Middle: answer prompt, submit, read feedback.
End: continue or see progress.
Evidence: `06-iphone390-question.png`, `07-iphone390-feedback.png`.
Main actions: submit, continue, see progress.
Missing states: none blocking; tap target polish remains.
Fix: keep as is structurally; improve top nav/toast/tap target polish.

### Progress

Intent: show current learning state and next review work.
Primary user: learner after practice.
Start: nav or feedback "See progress".
Middle: inspect streak, accuracy, due skills, skill list.
End: drill due/weak work or return to Today.
Evidence: `stable-08-progress-ready.png`.
Main actions: currently missing in empty/low-data state.
Missing states: low-data CTA, empty-state recommendation.
Fix: add mobile low-data action panel.

### Results

Intent: explain recent learning signals without overwhelming low-data users.
Primary user: learner after a few sessions.
Start: nav or Progress detail link.
Middle: review attempts, accuracy, low-data guidance, daily activity, forecast.
End: do 5 cards or inspect deeper analytics once enough data exists.
Evidence: `click-results.png`.
Main actions: do 5 cards.
Missing states: low-data detail collapse on mobile.
Fix: collapse repeated zero-state analytics on mobile.

### Chat

Intent: choose a Korean conversation scenario and get generated feedback.
Primary user: learner ready for free-form practice.
Start: nav.
Middle: read caveat, pick persona.
End: start a chat, then end for feedback.
Evidence: `click-chat.png`.
Main actions: pick recommended persona.
Missing states: none blocking.
Fix: optional: pin recommended scenario first with smaller intro copy on mobile.

### About / Sponsor Trust

Intent: explain scope and trust boundaries.
Primary user: sponsor, parent, teacher, early learner.
Start: public nav or in-app About.
Middle: read scope, evidence, caveats.
End: try learner flow or view progress report.
Evidence: `click-about.png`.
Main actions: try learner flow, view progress report.
Missing states: direct contact/request cohort setup path.
Fix: move sponsor section higher on mobile and add a concrete contact/setup action when available.

## Recommended Next Slice

1. Implement mobile nav compaction:
   - Core tabs: Practice/Today, Chat, Progress, Results.
   - Move About, Account, theme, Log out to a menu.
   - Keep min touch target `44px`.
2. Add Progress low-data panel:
   - "No progress yet. Do 5 cards to create your first report."
   - CTA `Do 5 cards` -> `#/practice`.
   - Secondary `Back to Today`.
3. Move toast to bottom on mobile and make close/toggle targets `44px`.

This slice addresses the two highest-risk mobile issues without touching backend, provider auth, or paid LLM flows.
