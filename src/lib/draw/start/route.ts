// src/app/api/draw/start/route.ts
// This file is an API route handler in Next.js - it handles HTTP POST requests to start a new tarot card reading session

// Import functions and types from other files in our project
import { putDraw, DRAW_TTL_MS } from "@/lib/draw/store"; // putDraw saves sessions, DRAW_TTL_MS is how long sessions last (60 minutes)
import type { DrawSession, SpreadSize } from "@/lib/draw/types"; // TypeScript types that define the shape of our data
import { getLenormandDeck, shuffleDeck } from "@/lib/draw/deck"; // Functions to get the card deck and shuffle it
import { getCosmicContext, getDayOfYear } from "@/lib/draw/cosmic"; // Functions to calculate cosmic/astrological context

// Define the shape of data we expect to receive in the request body
// This is a TypeScript type definition - it's like a blueprint for what the data should look like
type StartBody = {
  name: string; // User's name (required)
  question: string; // The question they want to ask the cards (required)
  spread: SpreadSize; // How many cards: either 3 or 5 (required)
  zodiac?: string; // Optional zodiac sign (the ? means it might not be provided)
  birthdate?: string; // Optional birthdate in format "YYYY-MM-DD" (the ? means it might not be provided)
};

// Helper function to create an error response when the request is invalid
// This is called a "400 Bad Request" error - it means the client sent bad data
function badRequest(message: string, details?: unknown) {
  // Response.json() creates a JSON HTTP response
  // First object is the data we send back, second object has HTTP status code (400 = bad request)
  return Response.json({ ok: false, error: message, details }, { status: 400 });
}

// Helper function to check if a value is a valid spread size (either 3 or 5)
// This is a "type guard" - TypeScript uses it to narrow down the type
function isSpreadSize(x: unknown): x is SpreadSize {
  // Returns true only if x is exactly 3 or exactly 5
  return x === 3 || x === 5;
}

// This is the main function that handles POST requests to this API endpoint
// "async" means it can wait for things like reading the request body
export async function POST(req: Request) {
  // Declare a variable to hold the parsed request body
  let body: StartBody;
  
  // Try to parse the JSON from the request body
  // We wrap it in try/catch because parsing might fail if the JSON is invalid
  try {
    // "await" means "wait for this to finish" - req.json() reads and parses the request body
    // "as StartBody" tells TypeScript to treat it as our StartBody type
    body = (await req.json()) as StartBody;
  } catch {
    // If parsing fails (invalid JSON), return an error response immediately
    return badRequest("Invalid JSON body");
  }

  // Extract and clean up the name from the request body
  // "??" is the "nullish coalescing operator" - if body.name is null/undefined, use "" instead
  // ".trim()" removes whitespace from the beginning and end of the string
  const name = (body.name ?? "").trim();
  const question = (body.question ?? "").trim(); // Same for question

  // Validate that required fields are provided
  // If name is empty (falsy), return an error and stop execution
  if (!name) return badRequest("name is required");
  if (!question) return badRequest("question is required"); // Same for question
  if (!isSpreadSize(body.spread)) return badRequest("spread must be 3 or 5"); // Check spread is 3 or 5

  // Get the current time in milliseconds since January 1, 1970 (Unix epoch)
  // This is used to track when the session was created and when it expires
  const now = Date.now();
  
  // Generate a unique ID for this draw session
  // crypto.randomUUID() creates a random unique identifier like "550e8400-e29b-41d4-a716-446655440000"
  const drawId = crypto.randomUUID();

  // Create and shuffle the deck of cards
  // getLenormandDeck() returns an array of all 36 Lenormand cards
  // shuffleDeck() randomly shuffles the array so cards are in random order
  // For Slice A we start already shuffled, but still allow reshuffle later (before picking).
  const deck = shuffleDeck(getLenormandDeck());

  // Create a new DrawSession object with all the information about this reading
  // This is the main data structure that stores everything about a tarot reading session
  const session: DrawSession = {
    drawId, // The unique ID we just generated
    name, // User's name (already trimmed)
    question, // User's question (already trimmed)
    spread: body.spread, // Number of cards (3 or 5)
    zodiac: body.zodiac?.trim() || undefined, // Optional zodiac, trimmed if provided, otherwise undefined
    birthdate: body.birthdate?.trim() || undefined, // Optional birthdate, trimmed if provided, otherwise undefined

    phase: "SHUFFLED", // Current phase of the reading - starts at "SHUFFLED" (cards are ready but not picked yet)
    deck, // The shuffled deck of cards
    selected: [], // Empty array - no cards selected yet (user will pick them later)

    // Calculate cosmic context based on today's date
    // getDayOfYear(new Date()) gets the day number (1-366) for today
    // getCosmicContext() uses that to pick a descriptor and metaphor for the reading
    cosmic: getCosmicContext(getDayOfYear(new Date())),

    createdAt: now, // When this session was created (current timestamp)
    expiresAt: now + DRAW_TTL_MS, // When this session expires (60 minutes from now)
  };

  // Save the session to our in-memory storage
  // putDraw() stores it in the Map we saw in store.ts
  putDraw(session);

  // Return a success response with some of the session data
  // The client (frontend) needs this info to continue with the reading
  // Return minimal state (enough for the next endpoint tests)
  return Response.json({
    ok: true, // Indicates the request was successful
    drawId: session.drawId, // The unique ID so the client can reference this session later
    phase: session.phase, // Current phase ("SHUFFLED")
    spread: session.spread, // Number of cards (3 or 5)
    expiresAt: session.expiresAt, // When the session expires (so client knows when it's too old)
    cosmic: session.cosmic, // The cosmic context (descriptor and metaphor)
  });
}
