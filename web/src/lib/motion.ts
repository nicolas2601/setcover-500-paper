export const ease = {
  apple: [0.32, 0.72, 0, 1] as const,
  expo: [0.16, 1, 0.3, 1] as const,
  quart: [0.22, 1, 0.36, 1] as const,
  back: [0.34, 1.56, 0.64, 1] as const,
} as const;

export const stagger = {
  chars: 0.028,
  words: 0.08,
  lines: 0.14,
  cards: 0.18,
} as const;

export const duration = {
  micro: 0.25,
  short: 0.55,
  medium: 1.1,
  long: 1.8,
  hero: 2.4,
  ambient: 18,
} as const;
