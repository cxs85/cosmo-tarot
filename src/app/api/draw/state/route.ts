// src/app/api/draw/state/route.ts
import { getDraw } from "@/lib/draw/store";

// Helper function to return a standardized error response
// This follows the DRY principle (Don't Repeat Yourself) - we define the error format once
// HTTP status 400 means "Bad Request" - the client sent invalid data
function badRequest(message: string) {
  return Response.json({ ok: false, error: message }, { status: 400 });
}

// This is a Next.js API Route Handler - the function name (GET) tells Next.js which HTTP method to handle
// "async" means this function can use "await" for asynchronous operations (like database calls)
// Even though we're not using await here, it's good practice for API routes since they often need async operations
export async function GET(req: Request) {
  // Parse the request URL to access query parameters
  // req.url is the full URL like "https://example.com/api/draw/state?drawId=abc123"
  // new URL() creates a URL object that lets us easily extract parts like search parameters
  const url = new URL(req.url);
  
  // Extract the "drawId" query parameter from the URL
  // url.searchParams.get("drawId") returns the value if it exists, or null if it doesn't
  // The ?? operator is "nullish coalescing" - if the left side is null or undefined, use the right side ("")
  // .trim() removes any leading/trailing whitespace (handles cases like " drawId= abc123 ")
  const drawId = (url.searchParams.get("drawId") ?? "").trim();

  // Early return pattern: if drawId is empty/falsy, immediately return an error
  // This prevents the code below from running with invalid data
  if (!drawId) return badRequest("drawId is required");

  // Look up the session in our in-memory store
  // getDraw() returns the session if found and valid, or null if not found/expired
  const session = getDraw(drawId);
  
  // If session doesn't exist, return a success response indicating it doesn't exist
  // Note: This is still "ok: true" because the request itself was valid - we're just reporting the session doesn't exist
  if (!session) {
    return Response.json({ ok: true, exists: false });
  }

  // If we get here, the session exists - return it along with the success flag
  // Response.json() automatically sets Content-Type: application/json header
  // The second parameter { status: 200 } is optional (200 is the default for success)
  return Response.json({ ok: true, exists: true, session });
}
