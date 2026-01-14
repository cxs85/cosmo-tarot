// Lenormand deck - 36 cards
import { Card } from "../types";

export const LENORMAND_DECK: Card[] = [
  { id: "rider", displayName: "Rider", symbol: "🚴" },
  { id: "clover", displayName: "Clover", symbol: "🍀" },
  { id: "ship", displayName: "Ship", symbol: "🚢" },
  { id: "house", displayName: "House", symbol: "🏠" },
  { id: "tree", displayName: "Tree", symbol: "🌳" },
  { id: "clouds", displayName: "Clouds", symbol: "☁️" },
  { id: "snake", displayName: "Snake", symbol: "🐍" },
  { id: "coffin", displayName: "Coffin", symbol: "⚰️" },
  { id: "bouquet", displayName: "Bouquet", symbol: "💐" },
  { id: "scythe", displayName: "Scythe", symbol: "⚡" },
  { id: "whip", displayName: "Whip", symbol: "🔨" },
  { id: "birds", displayName: "Birds", symbol: "🐦" },
  { id: "child", displayName: "Child", symbol: "👶" },
  { id: "fox", displayName: "Fox", symbol: "🦊" },
  { id: "bear", displayName: "Bear", symbol: "🐻" },
  { id: "stars", displayName: "Stars", symbol: "⭐" },
  { id: "stork", displayName: "Stork", symbol: "🪿" },
  { id: "dog", displayName: "Dog", symbol: "🐕" },
  { id: "tower", displayName: "Tower", symbol: "🗼" },
  { id: "garden", displayName: "Garden", symbol: "🌳" },
  { id: "mountain", displayName: "Mountain", symbol: "⛰️" },
  { id: "crossroads", displayName: "Crossroads", symbol: "🛤️" },
  { id: "mice", displayName: "Mice", symbol: "🐭" },
  { id: "heart", displayName: "Heart", symbol: "❤️" },
  { id: "ring", displayName: "Ring", symbol: "💍" },
  { id: "book", displayName: "Book", symbol: "📖" },
  { id: "letter", displayName: "Letter", symbol: "✉️" },
  { id: "man", displayName: "Man", symbol: "👨" },
  { id: "woman", displayName: "Woman", symbol: "👩" },
  { id: "lily", displayName: "Lily", symbol: "🌸" },
  { id: "sun", displayName: "Sun", symbol: "☀️" },
  { id: "moon", displayName: "Moon", symbol: "🌙" },
  { id: "key", displayName: "Key", symbol: "🗝️" },
  { id: "fish", displayName: "Fish", symbol: "🐟" },
  { id: "anchor", displayName: "Anchor", symbol: "⚓" },
  { id: "cross", displayName: "Cross", symbol: "✝️" },
];

export function getCardById(id: string): Card | undefined {
  return LENORMAND_DECK.find((card) => card.id === id);
}

export function getAllCardIds(): string[] {
  return LENORMAND_DECK.map((card) => card.id);
}
