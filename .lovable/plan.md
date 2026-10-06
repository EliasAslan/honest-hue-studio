# Mobile-first workout schedule

## Goal
Turn the Workout page into a day-by-day guide that immediately answers: what day is it, what is planned today, what comes next, and what should Benjamin do now?

## Experience
- Replace the desktop-first opening area with a compact phone-first week schedule, defaulting to the current week and clearly marking **Today**.
- Show all seven days with date, session state, and purpose: Full Body A/B, recovery, completed, missed, or optional.
- Let Benjamin tap a day to see that day’s plan; add simple previous/next week controls and a return-to-today action.
- Put the selected day’s guidance directly below the schedule: workout name, duration choice, recovery note, and one prominent start/resume action.
- Derive completed states from real saved workout history and preserve the alternating A/B weekly rhythm. Do not invent activity or progress.

## Workout flow
- Keep the existing Short, Standard, and Long options, exercise guidance, set logging, rest timer, save-for-later, completion, and session history.
- Move session setup into the selected training day instead of presenting detached A/B controls at the top.
- On recovery days, guide Benjamin toward recovery and make opening an optional session a secondary choice rather than the default.
- During an active workout, shift focus to the current exercise and logging controls while keeping the day/session context visible.

## Mobile design
- Design from a narrow phone viewport first: thumb-friendly controls, one-column hierarchy, stable widths, no clipped set inputs, and no dense desktop table at phone sizes.
- Convert set logging on phones into clear per-set rows while retaining a compact table presentation on larger screens.
- Move the existing weekly-rhythm sidebar content into the main flow so essential guidance is not buried below a long exercise list.
- Preserve the chosen bold athletic visual language: condensed headlines, orange emphasis, restrained cards, and semantic design tokens.

## Technical details
- Add reusable date/schedule helpers in the browser-safe fitness logic so Home and Workout use the same A/B planning rules.
- Refactor only the Workout page and its relevant styles; keep saved-record formats and Cloud behavior unchanged.
- Verify the schedule and active workout at phone and desktop widths, including today highlighting, week navigation, completed sessions, rest days, and responsive set entry.
