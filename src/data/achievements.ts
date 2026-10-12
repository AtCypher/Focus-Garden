/** Achievement catalogue. `metric` names a field of AchievementMetrics; `target` is the goal. */
export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  metric: keyof AchievementMetrics;
  target: number;
  /** Unit label for the progress text. */
  unit?: string;
}

export interface AchievementMetrics {
  completedSessions: number;
  totalMinutes: number;
  longestSessionMinutes: number;
  bestStreak: number;
  speciesOwned: number;
  plantsGrown: number;
  maturePlants: number;
  ancientPlants: number;
  earlySessions: number;
  lateSessions: number;
  deepSessions: number;
  pomodoroBlocks: number;
  stopwatchSessions: number;
  gardenLevel: number;
  decorationsPlaced: number;
  totalDew: number;
  tagsUsed: number;
  comebacks: number;
  biomesPlanted: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-seed',
    name: 'First seed',
    description: 'Complete your first session.',
    metric: 'completedSessions',
    target: 1,
  },
  {
    id: 'ten-sessions',
    name: 'Getting the hang of it',
    description: 'Complete 10 sessions.',
    metric: 'completedSessions',
    target: 10,
  },
  {
    id: 'hundred-sessions',
    name: 'Century',
    description: 'Complete 100 sessions.',
    metric: 'completedSessions',
    target: 100,
  },
  {
    id: 'five-hours',
    name: 'Afternoon',
    description: 'Focus for 5 hours in total.',
    metric: 'totalMinutes',
    target: 300,
    unit: 'min',
  },
  {
    id: 'fifty-hours',
    name: 'Fifty hours',
    description: 'Focus for 50 hours in total.',
    metric: 'totalMinutes',
    target: 3000,
    unit: 'min',
  },
  {
    id: 'two-hundred-hours',
    name: 'Two hundred hours',
    description: 'Focus for 200 hours in total.',
    metric: 'totalMinutes',
    target: 12_000,
    unit: 'min',
  },
  {
    id: 'long-haul',
    name: 'Long haul',
    description: 'Finish a single session of 2 hours.',
    metric: 'longestSessionMinutes',
    target: 120,
    unit: 'min',
  },
  {
    id: 'week-streak',
    name: 'One week',
    description: 'Hit your daily goal 7 days in a row.',
    metric: 'bestStreak',
    target: 7,
    unit: 'days',
  },
  {
    id: 'month-streak',
    name: 'One month',
    description: 'Hit your daily goal 30 days in a row.',
    metric: 'bestStreak',
    target: 30,
    unit: 'days',
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Own 12 species.',
    metric: 'speciesOwned',
    target: 12,
  },
  {
    id: 'botanist',
    name: 'Botanist',
    description: 'Own all 24 species.',
    metric: 'speciesOwned',
    target: 24,
  },
  {
    id: 'fifty-plants',
    name: 'Flourishing',
    description: 'Grow 50 plants.',
    metric: 'plantsGrown',
    target: 50,
  },
  {
    id: 'ancient',
    name: 'Ancient',
    description: 'Grow an ancient plant (a session of 2 hours or more).',
    metric: 'ancientPlants',
    target: 1,
  },
  {
    id: 'early-bird',
    name: 'Early bird',
    description: 'Complete 5 sessions that start before 8 am.',
    metric: 'earlySessions',
    target: 5,
  },
  {
    id: 'night-owl',
    name: 'Night owl',
    description: 'Complete 5 sessions that start after 10 pm.',
    metric: 'lateSessions',
    target: 5,
  },
  {
    id: 'deep-end',
    name: 'Deep end',
    description: 'Complete 10 Deep focus sessions.',
    metric: 'deepSessions',
    target: 10,
  },
  {
    id: 'tomato',
    name: 'Tomato',
    description: 'Complete 20 Pomodoro focus blocks.',
    metric: 'pomodoroBlocks',
    target: 20,
  },
  {
    id: 'comeback',
    name: 'Comeback',
    description: 'Complete a session on the same day a plant wilted, 3 times.',
    metric: 'comebacks',
    target: 3,
  },
  {
    id: 'landscaper',
    name: 'Landscaper',
    description: 'Place 5 decorations.',
    metric: 'decorationsPlaced',
    target: 5,
  },
  {
    id: 'wide-world',
    name: 'Wide world',
    description: 'Grow a plant in 5 different biomes.',
    metric: 'biomesPlanted',
    target: 5,
  },
];
