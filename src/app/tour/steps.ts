/** Guided tour: each step navigates to a route and points at a `data-tour` element. */
export interface TourStep {
  route: string;
  /** Value of the data-tour attribute to spotlight; omit for a plain card. */
  target?: string;
  title: string;
  body: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    route: '/',
    title: 'Welcome to Grove',
    body: 'Every focus session grows a plant. Over weeks your garden grows with you. This short tour shows where everything is; you can replay it any time from Settings.',
  },
  {
    route: '/',
    target: 'species',
    title: 'Pick a plant',
    body: 'Choose which species to grow. New ones are bought with dew (earned by focusing) or unlocked by milestones, seasons and challenges.',
  },
  {
    route: '/',
    target: 'duration',
    title: 'Pick a length',
    body: 'Ten minutes to three hours. Sessions of an hour or more grow bigger plants; two hours grow a glowing "ancient" one.',
  },
  {
    route: '/',
    target: 'strictness',
    title: 'Decide how strict to be',
    body: 'Gentle allows pauses and never wilts. Standard and Deep focus wilt the plant if you leave the app for more than a few seconds. Tick "leaving is allowed" if you need other apps or lock your phone.',
  },
  {
    route: '/',
    target: 'plant',
    title: 'Plant it',
    body: 'Tap Plant and stay with it. The first ten seconds can be cancelled for free. Pip, your gardener, keeps you company.',
  },
  {
    route: '/garden',
    target: 'garden',
    title: 'Your garden',
    body: 'Finished plants land in their biome. Beds show everything at a glance; the Map view is the same garden as a tiny landscape. Tap a plant for details, use Arrange to tidy up, and keep an eye out for animal visitors.',
  },
  {
    route: '/seeds',
    target: 'nav-seeds',
    title: 'The Seed Book',
    body: 'Buy species, decorations and outfits with dew, see what you have found, and start a 7-day challenge.',
  },
  {
    route: '/stats',
    target: 'nav-stats',
    title: 'Stats and streaks',
    body: 'Your daily goal, streak calendar, charts, achievements and a weekly recap. Hitting the goal every day keeps a streak; every 7 days you earn a streak freeze.',
  },
  {
    route: '/settings',
    target: 'nav-settings',
    title: 'Make it yours',
    body: 'Name your companion, set the daily goal, pick sounds and themes, and export a backup. Your data never leaves this device unless you export it.',
  },
];
