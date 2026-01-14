// Reading generator - single LLM call per completed reading
import { DrawState, ReadingResult } from "../types";
import { getCardById } from "../decks/lenormand";
import { formatCosmicDescriptor, formatCosmicMetaphor } from "../cosmic/context";

const DISCLAIMER =
  "For reflection & inspiration only. This reading is not a substitute for professional advice.";

export async function generateReading(draw: DrawState): Promise<ReadingResult> {
  // Get selected cards in order
  const selectedCards = draw.selectedCardIds.map((id, index) => ({
    card: getCardById(id)!,
    position: index + 1,
  }));

  // Build prompt for Lenormand sequence interpretation
  const cardSequence = selectedCards
    .map((c) => `${c.position}. ${c.card.displayName}`)
    .join("\n");

  const cosmicDescriptor = formatCosmicDescriptor(draw.cosmicContext);
  const cosmicMetaphor = formatCosmicMetaphor(draw.cosmicContext);

  const prompt = `You are a Lenormand reader. Interpret the following card sequence as a combined, relational sequence (not individual card meanings).

Question: "${draw.input.question}"
Name: ${draw.input.name}
Cosmic context: ${cosmicDescriptor} (metaphor: ${cosmicMetaphor})

Card sequence:
${cardSequence}

Generate a reading with exactly 4 pages:

1. Frame & Theme (70-90 words): Overall synthesis of the whole sequence + cosmic tone. Reference cards positionally (opening/pivot/final).

2. Sequence Unfolding (110-140 words): Lenormand chain logic (A→B→C…; relational meaning only). Explain how cards connect and influence each other.

3. Implications & Tension (90-110 words): What's forming/reinforcing/conflicting. Use interpretive language like "suggests", "indicates", "points to" - never predictive statements.

4. Interpretation & Direction (60-80 words): Declarative conclusion; not reflective prompts; non-predictive. Reference the cosmic metaphor subtly.

Rules:
- Cards are interpreted as a combined ordered sequence, not independently
- No dictionary meaning per card displayed
- Reference cards positionally and relationally ("shaped by", "resolved by")
- No medical/legal/financial directives
- No guarantees/predictions ("will happen", "must", "fate says")
- Use interpretive language: "the sequence suggests/indicates/points to"

Return JSON with this structure:
{
  "frameAndTheme": "...",
  "sequenceUnfolding": "...",
  "implicationsAndTension": "...",
  "interpretationAndDirection": "...",
  "shareText": "2-3 sentence synthesis from page 4"
}`;

  // Call OpenAI API (or fallback to template-based for v0)
  // For now, use a template-based fallback
  const reading = await generateReadingWithLLM(prompt, selectedCards, draw);

  // Build ReadingResult
  const result: ReadingResult = {
    meta: {
      locale: "en",
      createdAt: Date.now(),
      disclaimer: DISCLAIMER,
    },
    input: {
      ...draw.input,
      cosmicDescriptor,
      cosmicMetaphor,
    },
    draw: {
      cards: selectedCards.map((c) => ({
        id: c.card.id,
        displayName: c.card.displayName,
        position: c.position,
      })),
    },
    pages: {
      frameAndTheme: reading.frameAndTheme,
      sequenceUnfolding: reading.sequenceUnfolding,
      implicationsAndTension: reading.implicationsAndTension,
      interpretationAndDirection: reading.interpretationAndDirection,
    },
    share: {
      title: "Cosmo Tarot ✨",
      text: reading.shareText,
    },
    imagePrompt: `Abstract symbolic representation of ${selectedCards.map((c) => c.card.displayName).join(", ")} in sequence, ${cosmicMetaphor} theme, mystical, ethereal`,
  };

  return result;
}

async function generateReadingWithLLM(
  prompt: string,
  cards: Array<{ card: { displayName: string }; position: number }>,
  draw: DrawState
): Promise<{
  frameAndTheme: string;
  sequenceUnfolding: string;
  implicationsAndTension: string;
  interpretationAndDirection: string;
  shareText: string;
}> {
  // Check for OpenAI API key
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Fallback to template-based reading
    return generateTemplateReading(cards, draw);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a Lenormand reader. Always return valid JSON. Never include markdown formatting in JSON.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return {
      frameAndTheme: content.frameAndTheme || "",
      sequenceUnfolding: content.sequenceUnfolding || "",
      implicationsAndTension: content.implicationsAndTension || "",
      interpretationAndDirection: content.interpretationAndDirection || "",
      shareText: content.shareText || "",
    };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    // Fallback to template
    return generateTemplateReading(cards, draw);
  }
}

function generateTemplateReading(
  cards: Array<{ card: { displayName: string }; position: number }>,
  draw: DrawState
): {
  frameAndTheme: string;
  sequenceUnfolding: string;
  implicationsAndTension: string;
  interpretationAndDirection: string;
  shareText: string;
} {
  // Template-based fallback reading
  const cardNames = cards.map((c) => c.card.displayName).join(", ");
  const cosmicMetaphor = formatCosmicMetaphor(draw.cosmicContext);

  // Build sequence unfolding text based on card count
  let sequenceUnfolding = `The first card, ${cards[0].card.displayName}, establishes the foundation of this reading. As it connects with ${cards[1].card.displayName}, a dynamic emerges that suggests movement and change.`;
  
  if (cards.length === 5) {
    const middleCards = cards.slice(2, -1); // Cards at positions 3 and 4 (indices 2 and 3)
    sequenceUnfolding += ` The middle cards, ${middleCards.map((c) => c.card.displayName).join(" and ")}, act as pivots, revealing how these energies interact and add layers of complexity.`;
  } else if (cards.length === 3) {
    sequenceUnfolding += ` The middle position acts as a pivot, revealing how these energies interact.`;
  }
  
  sequenceUnfolding += ` The final card, ${cards[cards.length - 1].card.displayName}, indicates the direction toward which this sequence points. The relational meaning emerges not from individual cards, but from how they flow together.`;

  return {
    frameAndTheme: `The sequence of ${cardNames} suggests a journey shaped by ${cosmicMetaphor}. The opening card sets a tone of inquiry, while the final position points toward resolution. Together, these cards form a narrative arc that reflects on ${draw.input.question.toLowerCase()}.`,
    sequenceUnfolding,
    implicationsAndTension: `This sequence suggests that there are forces at play that may be forming or reinforcing certain patterns. The interaction between the cards indicates both potential harmony and areas where tension might arise. The reading points to underlying dynamics that shape the situation, rather than fixed outcomes. Consider how these energies might be influencing your current path.`,
    interpretationAndDirection: `The sequence indicates a path forward that acknowledges both the opening energy and the resolution suggested by the final card. This reading points to reflection and awareness rather than prediction. The ${cosmicMetaphor} theme suggests a natural flow that you can align with through conscious choice.`,
    shareText: `The sequence of ${cardNames} suggests a journey shaped by ${cosmicMetaphor}. This reading points to reflection and awareness, indicating a path forward that acknowledges both opening energies and potential resolution.`,
  };
}
