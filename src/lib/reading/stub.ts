// src/lib/reading/stub.ts
import type { DrawSession } from "@/lib/draw/types";
import type { ReadingResult } from "./types";
import { V0_READING_CAPS } from "./types";

export function makeStubReading(session: DrawSession): ReadingResult {
  const cards = session.selected.map((s) => s.card); // ordered
  const cardLine = cards.map((c) => c.name).join(" -> ");

  // Stub text: stable, deterministic, and clearly marked as placeholder
  const pages: [string, string, string, string] = [
    `Theme: This sequence centers on ${cardLine}. Cosmic tone: ${session.cosmic.descriptor} (${session.cosmic.metaphor}).`,
    `Sequence: ${cards
      .map((c, i) => `(${i + 1}) ${c.name}`)
      .join(", ")}. The meaning emerges from the chain, not any single card.`,
    `Implications: Notice the tension and reinforcement created by the ordering of ${cardLine}. This page will later carry the "what is forming / what is conflicting" synthesis.`,
    `Interpretation: Taken together, ${cardLine} indicates a coherent situation with a clear direction, framed as reflection/entertainment (not prediction).`,
  ];

  const shareText =
  `Cosmo Tarot\n\n` +
  `Question:\n"${session.question}"\n\n` +
  `Cards:\n${cardLine}\n\n` +
  `Interpretation:\n${pages[3]}\n\n` +
  `For entertainment and reflection only.`;


  return {
    meta: { drawId: session.drawId, createdAt: Date.now() },
    cards,
    cosmic: session.cosmic,
    pages,
    shareText,
    caps: V0_READING_CAPS,
  };
}
