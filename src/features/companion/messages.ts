/**
 * Companion message bank. Plain and warm. Never shaming.
 * {name} is replaced with the companion's name, {plant} with the species name (lowercase),
 * {minutes} with a number of minutes, {days} with a streak length.
 */
export type MessageKind =
  | 'start'
  | 'mid'
  | 'nearEnd'
  | 'completion'
  | 'wilt'
  | 'cancel'
  | 'away'
  | 'back'
  | 'gentleLeave'
  | 'streak'
  | 'levelUp'
  | 'break';

export const MESSAGES: Record<MessageKind, string[]> = {
  start: [
    'Seed is in. I will keep it watered.',
    'Okay. Just this one thing for a while.',
    'I like this spot. Let us see what grows.',
    'Deep breath. The {plant} is counting on us, gently.',
    'Settling in. I will hum if it helps.',
  ],
  mid: [
    'Halfway. Roots are taking.',
    'Still here. Still growing.',
    'You are doing the thing. That is all it takes.',
    'The {plant} is looking strong today.',
    'No hurry. Minutes add up on their own.',
  ],
  nearEnd: [
    'Nearly there. Can you see the buds?',
    'Last stretch. I can smell the leaves.',
    'Almost grown. Stay with it a little longer.',
  ],
  completion: [
    'Look at that. Fully grown.',
    'One more for the garden. Nice work.',
    'That was a good one. The {plant} agrees.',
    'Done! {minutes} minutes, all yours.',
    'I knew this spot was good.',
  ],
  wilt: [
    'It wilted. That happens to every gardener.',
    'We will try again. Want a shorter one?',
    'Not every seed takes. The next one might.',
    'It is okay. Even wilted plants tell a story.',
  ],
  cancel: ['No harm done. Whenever you are ready.', 'Seed is back in the packet. Another time.'],
  away: ['Are you there? The {plant} is waiting.', 'Come back soon, I cannot water alone.'],
  back: ['There you are. Carry on.', 'Welcome back. Nothing wilted.'],
  gentleLeave: [
    'Take what you need. I will keep watering.',
    'Gentle mode: the {plant} is safe while you are away.',
  ],
  streak: [
    '{days} days in a row. The garden notices.',
    'A {days}-day streak. Steady as rain.',
    '{days} days! I saved you a streak freeze for a rainy day.',
  ],
  levelUp: ['The garden grew. Have a look around.', 'More room now. More things to plant.'],
  break: ['Break time. Stretch those leaves.', 'Water, window, a few steps. Back soon.'],
};

export interface MessageContext {
  name?: string;
  plant?: string;
  minutes?: number;
  days?: number;
}

/** Deterministic pick so re-renders show the same line; pass a different seed for a new one. */
export function pickMessage(kind: MessageKind, seed: number, ctx: MessageContext = {}): string {
  const bank = MESSAGES[kind];
  const idx = Math.abs(Math.floor(seed)) % bank.length;
  return fill(bank[idx], ctx);
}

export function fill(template: string, ctx: MessageContext): string {
  return template
    .replace('{name}', ctx.name ?? 'your companion')
    .replace('{plant}', ctx.plant ?? 'plant')
    .replace('{minutes}', String(ctx.minutes ?? 0))
    .replace('{days}', String(ctx.days ?? 0));
}

export function messageCount(): number {
  return Object.values(MESSAGES).reduce((n, b) => n + b.length, 0);
}
