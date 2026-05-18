export const ease = {
  apple: [0.32, 0.72, 0, 1] as const,
  expo: [0.16, 1, 0.3, 1] as const,
  quart: [0.22, 1, 0.36, 1] as const,
  back: [0.34, 1.56, 0.64, 1] as const,
} as const;

export const stagger = {
  chars: 0.018,
  words: 0.05,
  lines: 0.08,
  cards: 0.1,
} as const;

export const duration = {
  micro: 0.2,
  short: 0.4,
  medium: 0.8,
  long: 1.2,
  hero: 1.6,
} as const;
