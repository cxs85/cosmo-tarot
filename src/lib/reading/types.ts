// src/lib/reading/types.ts

import type { CardRef, CosmicContext } from "@/lib/draw/types";

export type ReadingPageIndex = 0 | 1 | 2 | 3;

export type ReadingMeta = {
  drawId: string;
  createdAt: number; // epoch ms, when reading was generated
  locale?: string;   // optional future use
};

export type ReadingCaps = {
  // Soft caps (enforced later in generation). These are here to lock intent.
  pageWordsTarget: {
    // v0 defaults: one-screen-ish
    p1: [number, number]; // 70–90
    p2: [number, number]; // 110–140
    p3: [number, number]; // 90–110
    p4: [number, number]; // 60–80
  };
};

export type ReadingResult = {
  meta: ReadingMeta;

  // The selected cards (order matters; this is the Lenormand chain order)
  cards: CardRef[]; // length = spread (3 or 5)

  // Cosmic context used to tint Page 1 + Page 4 (template-based)
  cosmic: CosmicContext;

  // 4 pages, freer-flow but bounded. No additional model calls for pagination.
  pages: [string, string, string, string];

  // Share artifact (short, copy/paste friendly, safe out of context)
  shareText: string;

  // Optional future extension for image generation (not used yet)
  image?: {
    prompt: string;   // what we asked for
    url?: string;     // if stored somewhere later
  };

  // v0 caps (kept alongside output to make QA explicit)
  caps: ReadingCaps;
};

// v0 canonical caps (used later by generator + QA)
export const V0_READING_CAPS: ReadingCaps = {
  pageWordsTarget: {
    p1: [70, 90],
    p2: [110, 140],
    p3: [90, 110],
    p4: [60, 80],
  },
};
