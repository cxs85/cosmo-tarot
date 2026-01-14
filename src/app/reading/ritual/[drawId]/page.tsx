"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getCardById, LENORMAND_DECK } from "@/lib/decks/lenormand";

interface DrawData {
  drawId: string;
  input: {
    name: string;
    question: string;
    spread: 3 | 5;
  };
  selectedCardIds: string[];
  revealedCardIds: string[];
  meaningGenerated: boolean;
  cosmicContext: {
    descriptor: string;
    metaphor: string;
  };
}

export default function RitualPage() {
  const router = useRouter();
  const params = useParams();
  const drawId = params.drawId as string;

  const [drawData, setDrawData] = useState<DrawData | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch draw state
  useEffect(() => {
    if (!drawId) return;
    fetchDrawState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawId]);

  const fetchDrawState = async () => {
    try {
      const response = await fetch(`/api/draws/${drawId}`);
      if (!response.ok) throw new Error("Failed to fetch draw");
      const data = await response.json();
      setDrawData(data);
    } catch {
      setError("Failed to load reading. Please start over.");
    }
  };

  const handleShuffle = async () => {
    setIsShuffling(true);
    setError(null);
    try {
      const response = await fetch(`/api/draws/${drawId}/shuffle`, {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to shuffle");
      }
      await fetchDrawState();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to shuffle deck";
      setError(errorMessage);
      console.error("Shuffle error:", err);
    } finally {
      setIsShuffling(false);
    }
  };

  const handleSelectCard = async (cardId: string) => {
    if (!isPicking) return;
    if (drawData!.selectedCardIds.includes(cardId)) {
      // Allow deselection
    }

    setError(null);
    try {
      const response = await fetch(`/api/draws/${drawId}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to select card");
      }
      await fetchDrawState();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to select card";
      setError(errorMessage);
      console.error("Select card error:", err);
    }
  };

  const handleRevealCard = async (cardId: string) => {
    if (drawData!.revealedCardIds.includes(cardId)) return; // Already revealed

    setIsRevealing(true);
    try {
      const response = await fetch(`/api/draws/${drawId}/reveal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      });
      if (!response.ok) throw new Error("Failed to reveal card");
      await fetchDrawState();
    } catch {
      setError("Failed to reveal card");
    } finally {
      setIsRevealing(false);
    }
  };

  const handleRevealAll = async () => {
    if (!drawData) return;
    setIsRevealing(true);
    try {
      // Reveal cards one by one
      const cardsToReveal = drawData.selectedCardIds.filter(
        (id) => !drawData.revealedCardIds.includes(id)
      );
      for (const cardId of cardsToReveal) {
        await handleRevealCard(cardId);
        await fetchDrawState(); // Refresh state
        await new Promise((resolve) => setTimeout(resolve, 800)); // Delay for suspense
      }
    } finally {
      setIsRevealing(false);
    }
  };

  const handleRevealMeaning = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/draws/${drawId}/complete`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to generate meaning");
      router.push(`/reading/result/${drawId}`);
    } catch {
      setError("Failed to generate reading");
      setIsGenerating(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/reading/input")}>
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  if (!drawData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const canShuffle = drawData.selectedCardIds.length === 0;
  const canPick = drawData.revealedCardIds.length === 0;
  const canReveal =
    drawData.selectedCardIds.length === drawData.input.spread &&
    drawData.revealedCardIds.length < drawData.input.spread;
  const canRevealMeaning =
    drawData.revealedCardIds.length === drawData.input.spread &&
    !drawData.meaningGenerated;


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-3xl font-bold mb-2 text-center">The Ritual</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            {drawData.input.question}
          </p>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Button
              onClick={handleShuffle}
              disabled={!canShuffle || isShuffling}
              variant="secondary"
            >
              {isShuffling ? "Shuffling..." : "Shuffle Deck"}
            </Button>

            {canPick && (
              <Button
                onClick={() => setIsPicking(!isPicking)}
                variant={isPicking ? "primary" : "secondary"}
              >
                {isPicking ? "Done Picking" : "Pick Your Cards"}
              </Button>
            )}

            {canReveal && (
              <Button
                onClick={handleRevealAll}
                disabled={isRevealing}
                variant="secondary"
              >
                {isRevealing ? "Revealing..." : "Reveal Cards"}
              </Button>
            )}

            {canRevealMeaning && (
              <Button
                onClick={handleRevealMeaning}
                disabled={isGenerating}
                variant="primary"
              >
                {isGenerating ? "Generating Reading..." : "Reveal Meaning"}
              </Button>
            )}
          </div>

          {/* Card Display */}
          <div className="mt-12">
            {isPicking ? (
              <div>
                <p className="text-center mb-6 text-gray-700 dark:text-gray-300">
                  Select {drawData.input.spread} cards
                  {drawData.selectedCardIds.length > 0 &&
                    ` (${drawData.selectedCardIds.length}/${drawData.input.spread} selected)`}
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-3">
                  {LENORMAND_DECK.map((card) => {
                    const isSelected = drawData.selectedCardIds.includes(card.id);
                    return (
                      <button
                        key={card.id}
                        onClick={() => handleSelectCard(card.id)}
                        disabled={
                          !isSelected &&
                          drawData.selectedCardIds.length >= drawData.input.spread
                        }
                        className={`aspect-square rounded-lg border-2 p-2 transition-all ${
                          isSelected
                            ? "border-purple-500 bg-purple-100 dark:bg-purple-900/30 scale-105"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-purple-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        }`}
                      >
                        <div className="text-3xl mb-1">{card.symbol}</div>
                        <div className="text-xs font-medium">{card.displayName}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : drawData.selectedCardIds.length > 0 ? (
              <div>
                <p className="text-center mb-6 text-gray-700 dark:text-gray-300">
                  Your Selected Cards
                  {canReveal && (
                    <span className="block text-sm mt-2 text-purple-600 dark:text-purple-400">
                      Click cards to reveal individually, or use &quot;Reveal Cards&quot; button
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {drawData.selectedCardIds.map((cardId, index) => {
                    const card = getCardById(cardId);
                    if (!card) return null;
                    const isRevealed = drawData.revealedCardIds.includes(cardId);
                    const canClick = canReveal && !isRevealed && !isRevealing;
                    return (
                      <div
                        key={cardId}
                        className="relative"
                        onClick={() => (canClick ? handleRevealCard(cardId) : null)}
                      >
                        <div
                          className={`w-32 h-48 rounded-lg border-2 p-4 flex flex-col items-center justify-center transition-all ${
                            isRevealed
                              ? "bg-white dark:bg-gray-700 border-purple-500 shadow-lg"
                              : canClick
                              ? "bg-purple-600 border-purple-700 hover:bg-purple-700 cursor-pointer hover:scale-105"
                              : "bg-purple-600 border-purple-700 opacity-75"
                          }`}
                        >
                          {isRevealed ? (
                            <>
                              <div className="text-4xl mb-2">{card.symbol}</div>
                              <div className="text-sm font-semibold text-center">
                                {card.displayName}
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                Position {index + 1}
                              </div>
                            </>
                          ) : (
                            <div className="text-white text-2xl">?</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Shuffle the deck, then pick your cards
                </p>
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-16 h-24 bg-purple-600 rounded-lg border-2 border-purple-700"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
