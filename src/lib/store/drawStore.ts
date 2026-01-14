// In-memory draw store (v0 - no persistence)
// In production, this would be replaced with a database
import { DrawState, ReadingResult } from "../types";

const draws = new Map<string, DrawState>();
const readings = new Map<string, ReadingResult>();

// TTL: 24 hours
const DRAW_TTL = 24 * 60 * 60 * 1000;

export function createDraw(state: DrawState): void {
  draws.set(state.drawId, state);
}

export function getDraw(drawId: string): DrawState | undefined {
  const draw = draws.get(drawId);
  if (!draw) return undefined;

  // Check TTL
  const age = Date.now() - draw.createdAt;
  if (age > DRAW_TTL) {
    draws.delete(drawId);
    readings.delete(drawId);
    return undefined;
  }

  return draw;
}

export function updateDraw(drawId: string, updates: Partial<DrawState>): boolean {
  const draw = draws.get(drawId);
  if (!draw) return false;

  draws.set(drawId, { ...draw, ...updates });
  return true;
}

export function saveReading(drawId: string, reading: ReadingResult): void {
  readings.set(drawId, reading);
}

export function getReading(drawId: string): ReadingResult | undefined {
  return readings.get(drawId);
}

export function deleteDraw(drawId: string): void {
  draws.delete(drawId);
  readings.delete(drawId);
}
