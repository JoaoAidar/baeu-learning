# Brutal Visual Audit — Baeu Learning — 2026-06-29

Screens captured from production with a disposable learner account. Cleanup
returned `200` and `success:true`.

Evidence folder: `audit-smokes/2026-06-29-brutal-visual-audit/`

## Brutal Verdict

Baeu is not visually broken. The learner loop has a calm, credible shape and the
practice feedback screen does its job. The weak part is harsher: the product has
screens that explain learning signals, but too few screens close work. Progress
is the closest thing to a cockpit, yet Results turns one attempt into a long
analytics wall, and About tells a sponsor what Baeu is without giving them a
concrete next step or proof packet. The app is now good enough to practice; it is
not yet sharp enough to convert practice into a retained habit or a cohort
decision.

## Findings

- [P1] `frontend/src/pages/Results.jsx` Results is an analytics warehouse before
  it is a learner decision screen. After one attempt, it renders attempts,
  daily activity, habit, response time, pace, forecast, forgetting, toughest
  exercises, mastery and errors. Only one section has a concrete action:
  `Review 1 due now`. The tired learner has to scan a wall to learn the same
  thing Progress already knew: practice the due/weak item. See
  `Results.jsx:40-154` and `Results.jsx:157-235`.
- [P1] `frontend/src/pages/About.jsx` Sponsor trust exists, but it has no
  ending. The page says "small, supervised learner cohort", "review their
  Progress screen", "Free during early access", and "contact Joao directly",
  but there is no CTA, sample report, timestamped proof, reviewer status, or
  support route. A sponsor cannot finish a decision here. See
  `About.jsx:20-79`.
- [P2] `frontend/src/pages/Home.jsx` The authenticated home starts with two
  practice buttons, a dismissible tip, then module cards. It is clean, but it
  does not declare today's job: due review, weak drill, or start a module. It
  defaults to "Endless practice" instead of "Do today's review". See
  `Home.jsx:43-113`.
- [P2] `frontend/src/pages/Progress.jsx` Progress is better than Results because
  it starts with "What to work on now", but the evidence labels are still
  learner-opaque: `0% recent - New - due`, raw tags like `verb_conjugation`,
  and red status styling after a single intentional wrong answer look more
  severe than the proof supports. See `Progress.jsx:51-99` and
  `Progress.jsx:124-180`.
- [P2] `frontend/src/pages/EndlessPractice.jsx` Practice start has two equal
  choices, `Start` and `Practice weak areas`, before the learner has enough
  context to choose. On a fresh account, "weak areas" is a fake choice until
  data exists. See `EndlessPractice.jsx:162-197`.
- [P2] `frontend/src/pages/Chat.jsx` Conversation practice is compelling, but
  the picker is just scenario cards. It does not show cost/LLM dependency,
  expected duration, or what feedback artifact the learner will get. It also
  uses repeated cards where a guided first scenario plus a compact list would
  be easier to act on. See `Chat.jsx:88-135`.
- [P3] Mobile nav wraps into two rows with Account and Log out visible beside
  primary learning tabs. It works, but it consumes the first screen and makes
  the practice cockpit feel like settings are as important as today's review.

## Screen Intent Map

### Public Landing

Intent:
Convince a self-directed learner that Baeu can produce useful practice before
they create an account.

Primary user:
New Korean learner.

Start:
User lands from link or personal recommendation.

Middle:
They read the promise and try the mini practice.

End:
They create an account or leave knowing the app is not for them.

Evidence:
Published module count, question count, public demo deck behavior, visible
claim that this is TOPIK 1 practice.

Main actions:
- Try mini practice.
- Sign up.
- Read About.

Missing states:
- Empty: no public fallback if modules count fails beyond generic copy.
- Loading: login card is stable; module count loads silently.
- Error: no public "backend is waking" state on this page.
- Needs review: no reviewer/native status for content.
- Done: mini practice completion should point to signup with the exact next job.

Fix:
After mini practice completion, show "Create account to save this card and get
your next review" instead of generic signup.

### Authenticated Home

Intent:
Tell the learner what to do now.

Primary user:
Returning learner or fresh learner after signup.

Start:
Account created or login succeeds.

Middle:
User chooses daily review, weak drill, or module practice.

End:
User starts the right session.

Evidence:
Due count, weak skill count, last practice date, recommended module.

Main actions:
- Do today's review.
- Drill weak area.
- Start recommended module.

Missing states:
- Empty: fresh account should say "Start Hangul & Reading" as the primary path.
- Loading: current modules loading leaves a large blank under the hero.
- Error: API failure only toast; no recovery block.
- Needs review: due/weak state is not visible here.
- Done: no "you're done for today" state.

Fix:
Replace the generic hero with a "Today's Korean" work queue: due cards, weak
skill, recommended module, and a done state.

### Practice

Intent:
Get one answer, explain the correction, and move the learner to the next useful
card.

Primary user:
Learner in a focused session.

Start:
User clicks Start, weak drill, due review, or module practice.

Middle:
User answers; app grades and explains.

End:
User continues, hits checkpoint, or exits with progress saved.

Evidence:
Correct answer, explanation, error tags, session score, next review link.

Main actions:
- Submit.
- Continue.
- Open related lesson when threshold reached.

Missing states:
- Empty: good enough.
- Loading: simple but acceptable.
- Error: toast only.
- Needs review: feedback tags exist, but next review timing is not visible here.
- Done: checkpoint exists, but normal feedback has no "stop with saved progress"
  option.

Fix:
On feedback, add a secondary "Save and view progress" action and a small note:
"This card is now due again now/tomorrow".

### Progress

Intent:
Show the current learning state and drive the next practice session.

Primary user:
Learner deciding what to practice next.

Start:
User finished a session or clicks Progress.

Middle:
User reviews focus skills, due items, mastery, and errors.

End:
User drills the recommended set or sees "done for today".

Evidence:
Attempt count, recent/lifetime accuracy, due state, skill rows, error tags.

Main actions:
- Drill these.
- Full results.
- Return to module/practice.

Missing states:
- Empty: exists but not captured in this run.
- Loading: simple text.
- Error: toast only.
- Needs review: strong, but raw labels make it feel diagnostic rather than
  instructive.
- Done: missing.

Fix:
Make Progress the main cockpit: "Due now", "Next review", "Weak skill", "Done
today" and hide raw tags behind readable labels.

### Results

Intent:
Help a learner or sponsor understand longer-term learning patterns.

Primary user:
Learner after multiple sessions; sponsor/teacher reviewing progress.

Start:
User has enough attempts to inspect trends.

Middle:
User compares habit, speed, accuracy, forgetting, tough items, mastery.

End:
User chooses an action: review due, assign homework, export/share report, or
return to practice.

Evidence:
Window, totals, daily attempts, response-time trend, forecast, toughest items,
mastery distribution.

Main actions:
- Review due now.
- Change window.
- Export/share report (missing).

Missing states:
- Empty: many sections render as "not enough data", but the page still feels
  full.
- Loading: simple text.
- Error: toast only.
- Needs review: too many sections compete.
- Done: missing report/export/assignment closure.

Fix:
Gate advanced sections until thresholds are met. For low-data users, show one
summary card, one recommendation, and one action. For sponsors, add export/share.

### About / Sponsor Trust

Intent:
Let a sponsor understand whether Baeu fits a small supervised cohort.

Primary user:
Teacher, parent, tutor, or sponsor.

Start:
Sponsor opens About from public nav.

Middle:
They evaluate scope, evidence, privacy, support, pricing, and limits.

End:
They request a pilot, ask for a sample report, or decide not now.

Evidence:
Live module/question count, latest smoke date, sample Progress screenshot/report,
draft/native-review status, privacy statement, contact path.

Main actions:
- View sample learner report.
- Request cohort setup.
- Start as learner.

Missing states:
- Empty: module count fallback is vague.
- Loading: silent.
- Error: silent.
- Needs review: content reviewer status is mentioned but not tied to specific
  lessons or date.
- Done: no CTA.

Fix:
Add a sponsor proof block: "Last proven", "What a sponsor can see", "What we do
not claim", "Request cohort setup".

### Conversation Practice

Intent:
Let a learner practice short Korean chat and receive structured feedback.

Primary user:
Learner ready for free production, not just recognition.

Start:
User chooses Chat.

Middle:
User chooses a persona, writes turns, ends chat.

End:
Feedback is generated and saved into diagnostics.

Evidence:
Persona, register, turn count, feedback categories, LLM/provider status, cost
cap if relevant.

Main actions:
- Start recommended scenario.
- Pick scenario.
- End and get feedback.

Missing states:
- Empty: loading scenario initially exists.
- Loading: okay after wait.
- Error: generic load error.
- Needs review: AI feedback should be visibly "generated feedback".
- Done: feedback screen should offer "practice mistakes" or "save to progress".

Fix:
Promote one recommended scenario and show "3-5 turns, then feedback" plus a
generated-feedback caveat.

## Recommended Next Slice

Build a single "Today" cockpit and let it replace the generic authenticated
home hero:

1. On `Home.jsx`, fetch progress overview/skills plus analytics forecast.
2. Show one work queue:
   - due now count with `Review due now`;
   - top weak skill with `Drill weak area`;
   - recommended first module for empty accounts;
   - done state when no due/weak work exists.
3. Move module cards below as secondary browse.
4. Add one e2e assertion for fresh user and one for user with a due item.

This is the smallest slice that makes the app feel like it knows what the
learner should finish today, instead of making the learner choose between
several polite dashboards.
