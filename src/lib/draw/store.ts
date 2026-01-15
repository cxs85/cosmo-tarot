// src/lib/draw/store.ts
// This file manages in-memory storage for tarot card reading sessions; 
// Note: Data is lost when the server restarts - this is not permanent storage (no database)

// Import the DrawSession type so TypeScript knows what shape our session data has
import type { DrawSession } from "./types";

// Constant: How long a session lasts before it expires (Time To Live in milliseconds)
export const DRAW_TTL_MS = 60 * 60 * 1000; // 60 minutes

// Constant: Maximum number of sessions we'll store at once (prevents memory issues)
// If we have more than 5000 sessions, we'll delete the oldest ones
const MAX_DRAWS = 5000;

// Create a Map to store all the draw sessions
// Map is like a dictionary: you look up sessions by their ID (the key)
// <string, DrawSession> means: keys are strings (the drawId), values are DrawSession objects
// This is our "filing cabinet" - it's empty when the server starts
const draws = new Map<string, DrawSession>();

// Helper function to check if a session has expired
// Parameters: s = the session to check, now = current time (defaults to Date.now() if not provided)
// Returns: true if expired, false if still valid
function isExpired(s: DrawSession, now = Date.now()): boolean {
  // Compare: if the session's expiration time is less than or equal to now, it's expired
  return s.expiresAt <= now;
}

// This function cleans up old sessions - it's like emptying the trash
// Returns a number: how many sessions were deleted
export function cleanupExpired(): number {
  // Get the current time in milliseconds
  const now = Date.now();
  // Counter to track how many sessions we delete
  let deleted = 0;

  // 1) Drop expired - Loop through all sessions and delete the ones that are expired
  // draws.entries() gives us all key-value pairs: [id, session], [id, session], etc.
  // "for...of" loops through each entry
  // [id, s] is "destructuring" - it splits each entry into the id (key) and session (value)
  for (const [id, s] of draws.entries()) {
    // Check if this session is expired using our helper function
    if (isExpired(s, now)) {
      // Delete this session from the Map using its ID
      draws.delete(id);
      // Increment our counter (same as deleted = deleted + 1)
      deleted++;
    }
  }

  // 2) Basic trim protection (rare in dev, but prevents runaway)
  // If we have too many sessions, delete the oldest ones to stay under the limit
  // draws.size tells us how many sessions are currently stored
  if (draws.size > MAX_DRAWS) {
    // Sort by createdAt (oldest first) and delete until within limit
    // Array.from() converts the Map entries into an array we can sort
    // .sort() arranges them - the function compares two entries (a and b)
    // a[1] means the second element (the session object), b[1] is the same for the other entry
    // a[1].createdAt - b[1].createdAt sorts by creation time (oldest first)
    const entries = Array.from(draws.entries()).sort(
      (a, b) => a[1].createdAt - b[1].createdAt
    );
    // Calculate how many we need to delete to get back under the limit
    const toDelete = draws.size - MAX_DRAWS;
    // Loop through and delete that many oldest sessions
    // "let i = 0" starts at 0, "i < toDelete" continues while i is less than toDelete, "i++" increments i each time
    for (let i = 0; i < toDelete; i++) {
      // Get just the id from the entry (destructuring - we only need the first element)
      const [id] = entries[i];
      // Try to delete it - delete() returns true if successful, false if not found
      // If successful, increment our counter
      if (draws.delete(id)) deleted++;
    }
  }

  // Return the total number of sessions we deleted
  return deleted;
}

// Function to save a new session or update an existing one
// Parameters: session = the DrawSession object to save
// Returns: void (nothing) - it just saves the session
export function putDraw(session: DrawSession): void {
  // First, clean up any expired sessions before adding a new one
  cleanupExpired();
  
  // Save the session to our Map
  // session.drawId is the key (like a file label), session is the value (the actual data)
  // If a session with this ID already exists, it will be replaced (updated)
  draws.set(session.drawId, session);
}

// Function to retrieve a session by its ID
// Parameters: drawId = the unique ID of the session to find
// Returns: the DrawSession if found and valid, or null if not found or expired
export function getDraw(drawId: string): DrawSession | null {
  // First, clean up any expired sessions
  cleanupExpired();
  
  // Try to get the session from the Map using its ID
  // draws.get() returns the session if found, or undefined if not found
  const s = draws.get(drawId);
  
  // If the session doesn't exist (s is falsy), return null immediately
  // "!" means "not" - so "!s" means "if s doesn't exist"
  if (!s) return null;
  
  // Double-check if it's expired (in case it expired between cleanup and now)
  if (isExpired(s)) {
    // If expired, delete it and return null
    draws.delete(drawId);
    return null;
  }
  
  // If we get here, the session exists and is valid - return it
  return s;
}

/**
 * Update a draw session by id. Returns updated session or null if missing/expired.
 * Note: This function does NOT enforce invariants by itself; we enforce them in handlers.
 */
// Function to update an existing session
// Parameters:
//   - drawId: the ID of the session to update
//   - updater: a function that takes the current session and returns a modified version
// Returns: the updated session if successful, or null if session doesn't exist or is expired
export function updateDraw(
  drawId: string, // The ID of the session to update
  updater: (s: DrawSession) => DrawSession // A function that modifies a session
): DrawSession | null {
  // First, clean up any expired sessions
  cleanupExpired();
  
  // Get the current session - returns null if not found or expired
  const current = getDraw(drawId);
  
  // If we don't have a current session, we can't update it - return null
  if (!current) return null;

  // Call the updater function, passing in the current session
  // The updater function will return a modified version of the session
  // This is like saying "take the current session, make changes, and give me the new version"
  const next = updater(current);

  // Ensure we don't accidentally "revive" an expired draw
  // Check if the updated session would be expired (maybe the updater changed the expiresAt incorrectly)
  if (isExpired(next)) {
    // If it's expired, delete it and return null
    draws.delete(drawId);
    return null;
  }

  // Save the updated session back to the Map
  draws.set(drawId, next);
  
  // Return the updated session so the caller knows what the new state is
  return next;
}
