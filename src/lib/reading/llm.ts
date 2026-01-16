// src/lib/reading/llm.ts
import OpenAI from "openai";
import type { DrawSession } from "@/lib/draw/types";
import type { ReadingResult } from "@/lib/reading/types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateReadingLLM(
  session: DrawSession
): Promise<ReadingResult> {
  const cards = session.selected.map((s) => s.card).join(" -> ");

  const prompt = `
You are Cosmo Tarot.

Task:
Generate a tarot-style reading for reflection and entertainment only.
This is NOT a prediction.

Constraints (MANDATORY):
- Output VALID JSON ONLY.
- Must conform EXACTLY to the schema.
- pages must be an array of EXACTLY 4 strings.
- shareText must be ASCII-only.
- No markdown.
- No emojis.

Context:
Question: "${session.question}"
Cards: ${cards}
Cosmic context: ${session.cosmic?.descriptor ?? "none"}

Schema:
{
  "meta": { "drawId": string, "createdAt": number },
  "cards": string[],
  "cosmic": object | null,
  "pages": [string, string, string, string],
  "shareText": string,
  "caps": { "minWords": number, "maxWords": number }
}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.7,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0].message.content;
  if (!raw) throw new Error("empty LLM response");

  const parsed = JSON.parse(raw) as ReadingResult;

  // HARD GUARDS (fail fast)
  if (!Array.isArray(parsed.pages) || parsed.pages.length !== 4) {
    throw new Error("LLM output invalid: pages must be length 4");
  }
  if (/[^\x00-\x7F]/.test(parsed.shareText)) {
    throw new Error("LLM output invalid: shareText must be ASCII");
  }

  return parsed;
}
