// src/lib/draw/store.ts
import type { DrawSession } from "./types";

export const DRAW_TTL_MS = 60 * 60 * 1000; // 60 minutes
const MAX_DRAWS = 5000;

declare global {
  // eslint-disable-next-line no-var
  var __COSMO_DRAWS__: Map<string, DrawSession> | undefined;
}

const draws: Map<string, DrawSession> = global.__COSMO_DRAWS__ ?? new Map();
global.__COSMO_DRAWS__ = draws;

function isExpired(s: DrawSession, now = Date.now()): boolean {
  return s.expiresAt <= now;
}

/**
 * Remove expired draws (and optionally trim if we exceed MAX_DRAWS).
 * Returns number of sessions deleted.
 */
export function cleanupExpired(): number {
  const now = Date.now();
  let deleted = 0;

  // 1) Drop expired
  for (const [id, s] of draws.entries()) {
    if (isExpired(s, now)) {
      draws.delete(id);
      deleted++;
    }
  }

  // 2) Basic trim protection
  if (draws.size > MAX_DRAWS) {
    const entries = Array.from(draws.entries()).sort(
      (a, b) => a[1].createdAt - b[1].createdAt
    );
    const toDelete = draws.size - MAX_DRAWS;
    for (let i = 0; i < toDelete; i++) {
      const [id] = entries[i];
      if (draws.delete(id)) deleted++;
    }
  }

  return deleted;
}

export function putDraw(session: DrawSession): void {
  cleanupExpired();
  draws.set(session.drawId, session);
}

export function getDraw(drawId: string): DrawSession | null {
  cleanupExpired();
  const s = draws.get(drawId);
  if (!s) return null;
  if (isExpired(s)) {
    draws.delete(drawId);
    return null;
  }
  return s;
}

export function updateDraw(
  drawId: string,
  updater: (s: DrawSession) => DrawSession
): DrawSession | null {
  cleanupExpired();
  const current = getDraw(drawId);
  if (!current) return null;

  const next = updater(current);

  if (isExpired(next)) {
    draws.delete(drawId);
    return null;
  }

  draws.set(drawId, next);
  return next;
}
