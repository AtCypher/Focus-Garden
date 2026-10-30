# Roadmap ideas: making Grove more engaging

> **Status (late October 2026):** items 1–15 are shipped. 16–18 need a backend (see
> `docs/v2-social.md`), 19–22 need a native wrapper, 23 needs a charity partner.

Written October 2026 after looking at what Forest, Flora, Focus Plant, Focus Friend, Finch,
Habitica and Opal do well, what their users complain about, and what a web app can and cannot do.

## What competitors win with

| App              | The hook that keeps people coming back                                                                                                                                                     | What users complain about                                                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Forest**       | Coins buy _real_ trees (Trees for the Future); co-planting with friends; tag-based history ("your forest for the week"); seasonal and limited-time species; Plus gives 3× coins            | Subscription pushed on users who already paid; "almost every pretty plant is premium"; no control over pausing; browser extension does not sync with the phone; cannot block games/apps |
| **Flora**        | To-do list and habit tracker bolted onto the timer, so there are more reasons to open it; friend challenges ("plant together")                                                             | A dying tree "does not stop you opening Instagram"; few people pay for the real-tree option                                                                                             |
| **Focus Plant**  | Raindrops earned by focusing, spent to _restore_ a barren landscape; achievements; reads mindfulness minutes from other apps                                                               | Ads and reward videos; slow progression; confusing UI; timer bugs that fail sessions                                                                                                    |
| **Focus Friend** | Emotional attachment: a bean knits while you focus, looks sad (never angry) if you stop; socks and scarves decorate its room; "people did not want to disappoint the bean"                 | Paid extra characters; weak desktop story                                                                                                                                               |
| **Finch**        | Home-screen widget with the day's progress; random "friend visits" as surprise rewards; daily checklist and affirmations; several reasons to open the app each day; the pet grows with you | Positioned as habit-building, not clinical help                                                                                                                                         |
| **Habitica**     | Habits as an RPG with parties and quests; social accountability                                                                                                                            | Complexity                                                                                                                                                                              |
| **Opal**         | Hard app blocking via Screen Time API                                                                                                                                                      | Price; not a game                                                                                                                                                                       |

### Patterns behind the retention

1. **Attachment beats guilt.** Focus Friend's bean and Finch's bird work because people care about
   the character, not because they fear losing a streak. Sad-but-kind beats angry.
2. **Progress visible outside the app.** Finch's widget and Forest's shareable forest keep the
   app in sight between sessions.
3. **Small surprises.** Random visits, seasonal species, limited events: variable rewards that
   cost nothing and give a reason to open the app today rather than someday.
4. **More than one reason to open it.** Flora and Finch add a to-do list, habits, a daily check-in.
   A pure timer only gets opened when the user already decided to focus.
5. **Social accountability, low friction.** Co-planting is loved; Flora's clunky room setup is not.
6. **Real-world meaning.** Forest's real trees are its single most-quoted feature.
7. **Do not sell what you already gave.** The loudest complaints are about paywalls, ads and
   premium-only species. Grove's "free in full" stance is a differentiator worth protecting.

## Updates Grove could ship

Effort: S = a day or less, M = a few days, L = a week or more. "PWA" marks what works on the web
today; "native" needs an app-store wrapper.

### Tier 1: quick wins that add daily reasons to open the app (all PWA)

1. **Daily garden visit (S).** First open of the day: Pip greets you by name, waters the garden,
   and hands you a small dew gift (+5, +10 on streak days). One tap, five seconds, a reason to open
   Grove even when you are not about to focus. (Finch daily check-in.)
2. **Garden visitors (M).** As a biome restores, wildlife starts to appear at random: a robin in
   the Orchard, a fox at the Forest edge, a heron at the pond. Each first sighting goes into a
   "Visitors" page of the Seed Book. Surprise rewards that cost nothing. (Finch friend visits,
   Animal Crossing.)
3. **Pip's finds (S).** After a completed session Pip occasionally brings back a small object (a
   feather, a snail shell, a smooth stone) to display on a shelf. Same mechanism as Focus Friend's
   socks: a collection that grows only through focus.
4. **Seasonal species and events (M).** Two or three species per season that can only be grown in
   that season (frost lily in winter, firework poppy in summer), plus a short autumn "harvest week"
   with a special decoration. Limited-time, never paid. (Forest's events, minus the shop.)
5. **Streak calendar (S).** A GitHub-style heatmap of the last 12 weeks on the Stats page, with
   "perfect week" badges. People love looking at a filled calendar more than a number.
6. **Weekly recap card (M).** Every Monday: hours, best day, top tag, plants grown, one line from
   Pip, rendered as a shareable image like the garden share. (Spotify Wrapped effect, weekly.)
7. **Intent before planting (S).** An optional "What are you working on?" line when planting,
   shown on the timer screen and saved as the session note. Turns a timer into a commitment and
   makes the timeline useful later.
8. **Quick-plant presets and Shortcuts (S).** Save favourite combinations ("Deep work 50 min, oak,
   Work tag") as one-tap buttons, and support `?plant=preset` in the URL so an Apple Shortcut or
   home-screen bookmark starts a session instantly.
9. **App badge for a streak at risk (S).** The installed app's icon shows a badge in the evening
   if today's goal is not met yet (`navigator.setAppBadge`, iOS 16.4+). The closest a PWA gets to
   a widget.

### Tier 2: deeper loops (PWA unless noted)

10. **Simple tasks per session (M).** A lightweight to-do list; tick tasks off during a session;
    completed tasks show in the timeline and count towards an achievement. (Flora's strongest
    non-timer feature.) Keep it tiny: no projects, no due dates.
11. **Weekly goals per tag (S).** "Study: 5 h this week" with a progress ring. Streaks reward
    consistency; goals reward volume.
12. **Themed 7-day challenges (M).** "Early bird week", "No-pause week", "Deep focus week", each
    with a unique species or decoration at the end. Opt-in, one at a time.
13. **Companion growth (M).** Pip levels up with lifetime hours: new idle animations, a bigger
    watering can, a tiny greenhouse at level 7. The attachment compounds.
14. **Sound mixer (S).** Layer two ambient sounds (rain + café) and set relative volume; add a
    "wind" and "night" layer. Cheap because sounds are synthesised.
15. **Garden weather (S).** Light rain on days you hit the goal, sun on streak days, mist after a
    wilt. Pure presentation, strong feedback.
16. **Focus together rooms (L, needs a small backend).** Already designed in `docs/v2-social.md`:
    6-character codes, one shared plant, wilts if anyone leaves. The single most-requested social
    feature across all these apps.
17. **Friends list and weekly league (L, backend).** Compare hours with a few friends; visit their
    garden read-only. Low-pressure, opt-in.
18. **Nudge at your usual time (M, needs web push + backend).** "You usually plant around 9:00.
    The garden is ready." Web push on iOS works for installed PWAs, but the server has to send it.

### Tier 3: things only a native wrapper can do (L each)

19. **Live Activity / Dynamic Island timer** and **home-screen widgets** (Capacitor + a small
    native extension). This is the most visible gap versus native competitors.
20. **Real app blocking** through the Screen Time API on iOS, the way Opal and Forest's native app
    do it. Also fixes Flora's "a dying tree does not stop Instagram" problem.
21. **Scheduled local notifications** for reminders without a server.
22. **Optional cloud sync** behind an account, so the garden follows you to a new phone without
    exporting. Keep the export path for people who want no account.

### Real-world meaning (optional, costs money)

23. **Plant a real tree.** Partner with a tree-planting charity; every 50 hours of focus unlocks a
    certificate, and an optional one-off donation plants a tree in the user's name. Forest's
    best-loved feature, and it needs no subscription.

### Things to keep _not_ doing

- No ads, no reward videos, no loot boxes, no premium-only species. Every competitor's angriest
  reviews are about exactly these.
- No shaming copy. Pip stays kind.
- No "pause for a fee" or streak-repair purchases. Streak freezes stay earned.

## Suggested order

1. Daily garden visit (1), intent line (7), streak calendar (5): three days of work, immediately
   felt.
2. Garden visitors (2) and Pip's finds (3): the collection loop.
3. Seasonal species (4) and the weekly recap (6): reasons to come back next week and next month.
4. Quick-plant presets and Shortcuts (8), app badge (9), weekly tag goals (11), sound mixer (14).
5. Focus together (16) once there is a backend worth running.

## Sources

- Forest: [Wikipedia](<https://en.wikipedia.org/wiki/Forest_(application)>), [App Store listing](https://apps.apple.com/ke/app/id866450515?l=en-gb), [user feedback analysis](https://kimola.com/reports/exclusive-forest-app-user-feedback-analysis-report-google-play-en-us-151945), [extension reviews](https://addons.mozilla.org/en-US/firefox/addon/forest-stay-focused-be-present/reviews/1501368/)
- Flora: [Business of Business review](https://www.businessofbusiness.com/articles/flora-focus-productivity-app-review/), [Flora alternatives](https://habitdoom.com/blog/flora-alternative-iphone)
- Focus Plant: [AppsHunter summary](https://appshunter.io/ios/app/1459096306), [Product Hunt reviews](https://www.producthunt.com/products/focus-plant/reviews)
- Focus Friend: [Fast Company](https://www.fastcompany.com/91388304/focus-friend-app-store-hank-green-bria-sullivan), [Tubefilter](https://www.tubefilter.com/2025/08/20/hank-green-tops-app-store-charts-focus-friend/amp/), [Screens Design](https://screensdesign.com/showcase/focus-friend-by-hank-green)
- Finch: [Deconstructor of Fun](https://www.deconstructoroffun.com/blog/x0hd2ssr80y5n7gv0w967pg7hwd7tl), [WhistleOut review](https://www.whistleout.com/CellPhones/Apps/finch-self-care-app-review)
- Comparisons: [Best apps for focus 2026](https://www.pulse.bot/consumer-tech/news/best-apps-for-focus-2026-focus-friend-forest-focus-traveller-e5afbe8b-7b01-4be4-8808-8809335136f9/), [Softpicker](https://softpicker.com/best-focus-apps/)
