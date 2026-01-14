// Tarot engine - deck shuffling and draw management
import { getAllCardIds } from "../decks/lenormand";
import { DrawState } from "../types";

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createShuffledDeck(): string[] {
  return shuffleArray(getAllCardIds());
}

export function canShuffle(state: DrawState): boolean {
  // Can only shuffle before picking begins
  return state.selectedCardIds.length === 0;
}

export function canPickCards(state: DrawState): boolean {
  // Can pick if we haven't started revealing yet
  return state.revealedCardIds.length === 0;
}

export function canRevealCards(state: DrawState): boolean {
  // Can reveal if we have selected exactly N cards
  const expectedCount = state.input.spread;
  return (
    state.selectedCardIds.length === expectedCount &&
    state.revealedCardIds.length < expectedCount
  );
}

export function canRevealMeaning(state: DrawState): boolean {
  // Can reveal meaning only after all cards are revealed
  const expectedCount = state.input.spread;
  return (
    state.revealedCardIds.length === expectedCount &&
    !state.meaningGenerated
  );
}

export function getDrawPhase(state: DrawState): "shuffling" | "picking" | "revealing" | "meaning" | "complete" {
  if (state.meaningGenerated) return "complete";
  if (state.revealedCardIds.length === state.input.spread) return "meaning";
  if (state.revealedCardIds.length > 0) return "revealing";
  if (state.selectedCardIds.length === state.input.spread) return "revealing";
  if (state.selectedCardIds.length > 0) return "picking";
  return "shuffling";
}
