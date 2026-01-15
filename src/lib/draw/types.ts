// src/lib/draw/types.ts

export type SpreadSize = 3 | 5;


export type DrawPhase =
  | "INIT"          // created, not shuffled yet (optional)
  | "SHUFFLED"      // shuffled, not picking yet
  | "PICKING"       // user selecting cards
  | "REVEALING"     // user revealing selected cards
  | "REVEALED"     // meaning revealed all cards, meaning not yet generated
  | "COMPLETE";     // meaning generated and locked

export type CardRef = {
  id: string;          // stable identifier like "L01".."L36" (Lenormand) or tarot ids later
  name: string;        // display name
};

export type SelectedCard = {
  index: number;       // position within the selected spread: 0..N-1
  card: CardRef;
  revealed: boolean;
};

export type CosmicContext = {
  dayOfYear: number;     // 1..366
  descriptor: string;    // temporal overlay
  metaphor: string;      // symbolic echo
};

export type DrawSession = {
  drawId: string;

  // user inputs
  name: string;
  question: string;
  spread: SpreadSize;
  zodiac?: string;
  birthdate?: string;    // ISO date string "YYYY-MM-DD"

  // ritual state
  phase: DrawPhase;
  deck: CardRef[];       // full deck in shuffled order
  selected: SelectedCard[];

  // cosmic context (template-based)
  cosmic: CosmicContext;

  // idempotency / lifecycle
  createdAt: number;     // epoch ms
  expiresAt: number;     // epoch ms
  completedAt?: number;  // epoch ms
};
