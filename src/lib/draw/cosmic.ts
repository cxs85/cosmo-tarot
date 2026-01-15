// src/lib/draw/cosmic.ts
import type { CosmicContext } from "./types";

const DESCRIPTORS = [
  "a moment of clarification",
  "a quiet turning point",
  "a window for decisive movement",
  "a pause before momentum returns",
  "a day for noticing patterns",
  "a season of re-alignment",
  "a threshold moment",
];

const METAPHORS = [
  "tide",
  "crossing",
  "alignment",
  "shedding",
  "spark",
  "compass",
  "mirror",
];

export function getDayOfYear(d = new Date()): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay); // 1..366
}

export function getCosmicContext(dayOfYear: number): CosmicContext {
  // Deterministic mapping from dayOfYear → descriptor/metaphor
  const descriptor = DESCRIPTORS[dayOfYear % DESCRIPTORS.length];
  const metaphor = METAPHORS[dayOfYear % METAPHORS.length];
  return { dayOfYear, descriptor, metaphor };
}
