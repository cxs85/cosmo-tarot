// Core types for Cosmo Tarot

export type SpreadType = 3 | 5;

export type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export interface Card {
  id: string;
  displayName: string;
  symbol: string; // Lenormand symbol
}

export interface DrawInput {
  name: string;
  question: string;
  spread: SpreadType;
  birthdate?: string; // ISO date string
  zodiac?: ZodiacSign;
}

export interface DrawState {
  drawId: string;
  input: DrawInput;
  deckOrder: string[]; // Card IDs in shuffled order
  selectedCardIds: string[]; // User-selected card IDs (max N)
  revealedCardIds: string[]; // Cards that have been revealed
  meaningGenerated: boolean;
  createdAt: number;
  cosmicContext: CosmicContext;
}

export interface CosmicContext {
  dayOfYear: number; // 1-366
  descriptor: string; // Daily descriptor template
  metaphor: string; // Symbolic metaphor class
  zodiac?: ZodiacSign;
}

export interface ReadingResult {
  meta: {
    locale: string;
    createdAt: number;
    disclaimer: string;
  };
  input: DrawInput & {
    cosmicDescriptor: string;
    cosmicMetaphor: string;
  };
  draw: {
    cards: Array<{
      id: string;
      displayName: string;
      position: number; // 1-based position in spread
    }>;
  };
  pages: {
    frameAndTheme: string; // 70-90 words
    sequenceUnfolding: string; // 110-140 words
    implicationsAndTension: string; // 90-110 words
    interpretationAndDirection: string; // 60-80 words
  };
  share: {
    title: string;
    text: string; // 2-3 sentence synthesis
  };
  imagePrompt?: string; // For optional image generation
}

export type DrawPhase =
  | "input" // Still on input page
  | "shuffling" // Can shuffle
  | "picking" // Can pick cards
  | "revealing" // Cards being revealed
  | "meaning" // Meaning revealed
  | "complete"; // Reading complete
