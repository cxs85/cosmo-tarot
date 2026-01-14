// Cosmic context system - template-based daily descriptors and metaphors
import { ZodiacSign, CosmicContext } from "../types";

// Metaphor classes (12 types, rotated)
const METAPHOR_CLASSES = [
  "tide",
  "crossing",
  "alignment",
  "shedding",
  "gathering",
  "unfolding",
  "merging",
  "transforming",
  "reaching",
  "grounding",
  "flowing",
  "awakening",
] as const;

// Daily descriptors (366 templates - simplified to 12 base patterns with variations)
const DESCRIPTOR_PATTERNS = [
  "A day of gentle shifts and quiet clarity",
  "A moment of crossing thresholds and new perspectives",
  "A time of alignment between intention and action",
  "A period of shedding old patterns and making space",
  "A gathering of energies and focused direction",
  "An unfolding of possibilities and fresh insights",
  "A merging of paths and collaborative energies",
  "A transformation through reflection and release",
  "A reaching toward clarity and higher understanding",
  "A grounding in stability and practical wisdom",
  "A flowing with natural rhythms and intuitive guidance",
  "An awakening to new awareness and deeper connection",
] as const;

// Zodiac to day-of-year mapping (approximate)
function getZodiacFromDate(date: Date): ZodiacSign {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "aquarius";
  return "pisces"; // Feb 19 - Mar 20
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function getCosmicContext(
  date: Date = new Date(),
  zodiacOverride?: ZodiacSign
): CosmicContext {
  const dayOfYear = getDayOfYear(date);
  const zodiac = zodiacOverride || getZodiacFromDate(date);

  // Deterministic mapping: dayOfYear % 12 gives us pattern index
  const patternIndex = dayOfYear % DESCRIPTOR_PATTERNS.length;
  const metaphorIndex = dayOfYear % METAPHOR_CLASSES.length;

  const descriptor = DESCRIPTOR_PATTERNS[patternIndex];
  const metaphor = METAPHOR_CLASSES[metaphorIndex];

  return {
    dayOfYear,
    descriptor,
    metaphor,
    zodiac,
  };
}

export function formatCosmicDescriptor(context: CosmicContext): string {
  return context.descriptor;
}

export function formatCosmicMetaphor(context: CosmicContext): string {
  return `the ${context.metaphor}`;
}
