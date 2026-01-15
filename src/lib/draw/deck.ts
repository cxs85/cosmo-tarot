// src/lib/draw/deck.ts
import type { CardRef } from "./types";

// Lenormand 36-card deck (ids are stable, names are display labels)
export function getLenormandDeck(): CardRef[] {
  return [
    { id: "L01", name: "Rider" },
    { id: "L02", name: "Clover" },
    { id: "L03", name: "Ship" },
    { id: "L04", name: "House" },
    { id: "L05", name: "Tree" },
    { id: "L06", name: "Clouds" },
    { id: "L07", name: "Snake" },
    { id: "L08", name: "Coffin" },
    { id: "L09", name: "Bouquet" },
    { id: "L10", name: "Scythe" },
    { id: "L11", name: "Whip" },
    { id: "L12", name: "Birds" },
    { id: "L13", name: "Child" },
    { id: "L14", name: "Fox" },
    { id: "L15", name: "Bear" },
    { id: "L16", name: "Stars" },
    { id: "L17", name: "Stork" },
    { id: "L18", name: "Dog" },
    { id: "L19", name: "Tower" },
    { id: "L20", name: "Garden" },
    { id: "L21", name: "Mountain" },
    { id: "L22", name: "Crossroads" },
    { id: "L23", name: "Mice" },
    { id: "L24", name: "Heart" },
    { id: "L25", name: "Ring" },
    { id: "L26", name: "Book" },
    { id: "L27", name: "Letter" },
    { id: "L28", name: "Man" },
    { id: "L29", name: "Woman" },
    { id: "L30", name: "Lily" },
    { id: "L31", name: "Sun" },
    { id: "L32", name: "Moon" },
    { id: "L33", name: "Key" },
    { id: "L34", name: "Fish" },
    { id: "L35", name: "Anchor" },
    { id: "L36", name: "Cross" },
  ];
}

// Fisher–Yates shuffle (non-seeded for v0 slice)
export function shuffleDeck<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
