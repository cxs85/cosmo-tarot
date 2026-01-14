"use client";

import { Fragment, ReactNode, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ReadingResult } from "@/lib/types";
import { getCardById } from "@/lib/decks/lenormand";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderHighlightedText(text: string, highlight: string): ReactNode {
  if (!highlight) return text;

  const re = new RegExp(`\\b(${escapeRegExp(highlight)})\\b`, "gi");
  const parts = text.split(re);
  const highlightLower = highlight.toLowerCase();

  return parts.map((part, idx) => {
    const isMatch = part.toLowerCase() === highlightLower;
    if (!isMatch) return <Fragment key={idx}>{part}</Fragment>;
    return (
      <mark
        key={idx}
        className="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded"
      >
        {part}
      </mark>
    );
  });
}

function renderReadingContent(content: string, highlight?: string): ReactNode {
  // Preserve paragraphs while avoiding HTML injection.
  const paragraphs = content
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);

  return paragraphs.map((p, idx) => (
    <p key={idx}>
      {highlight ? renderHighlightedText(p, highlight) : p}
    </p>
  ));
}

export default function ReadingPage() {
  const router = useRouter();
  const params = useParams();
  const drawId = params.drawId as string;

  const [reading, setReading] = useState<ReadingResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [highlightedCard, setHighlightedCard] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!drawId) return;
    fetchReading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawId]);

  const fetchReading = async () => {
    try {
      const response = await fetch(`/api/draws/${drawId}/reading`);
      if (!response.ok) {
        // If reading not ready, redirect to ritual
        router.push(`/reading/ritual/${drawId}`);
        return;
      }
      const data = await response.json();
      setReading(data.reading);
    } catch (err) {
      console.error("Error fetching reading:", err);
    }
  };

  const handleCopyShare = async () => {
    if (!reading) return;
    const shareText = `${reading.share.title}\n\n${reading.input.question}\n\nCards: ${reading.draw.cards.map((c) => c.displayName).join(", ")}\n\n${reading.share.text}\n\n${reading.meta.disclaimer}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleAnotherReading = () => {
    if (confirm("Are you sure you want to start a new reading? This will end your current session.")) {
      router.push("/reading/input");
    }
  };

  if (!reading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading reading...</p>
        </div>
      </div>
    );
  }

  const pages = [
    { title: "Frame & Theme", content: reading.pages.frameAndTheme },
    { title: "Sequence Unfolding", content: reading.pages.sequenceUnfolding },
    {
      title: "Implications & Tension",
      content: reading.pages.implicationsAndTension,
    },
    {
      title: "Interpretation & Direction",
      content: reading.pages.interpretationAndDirection,
    },
  ];

  const currentPageContent = pages[currentPage - 1];
  const highlightedCardName = highlightedCard
    ? reading.draw.cards.find((c) => c.id === highlightedCard)?.displayName
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2 text-center">
            Your Reading ✨
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
            {reading.input.question}
          </p>

          {/* Cards */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {reading.draw.cards.map((cardData) => {
              const card = getCardById(cardData.id);
              if (!card) return null;
              return (
                <button
                  key={cardData.id}
                  onClick={() =>
                    setHighlightedCard(
                      highlightedCard === cardData.id ? null : cardData.id
                    )
                  }
                  className={`w-24 h-36 rounded-lg border-2 p-3 flex flex-col items-center justify-center transition-all ${
                    highlightedCard === cardData.id
                      ? "border-purple-500 bg-purple-100 dark:bg-purple-900/30 scale-105 shadow-lg"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-purple-300 hover:scale-105"
                  }`}
                >
                  <div className="text-3xl mb-1">{card.symbol}</div>
                  <div className="text-xs font-semibold text-center">
                    {card.displayName}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {cardData.position}
                  </div>
                </button>
              );
            })}
          </div>

          {highlightedCard && (
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Click the card again to remove highlighting
            </p>
          )}
        </div>

        {/* Reading Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 mb-6">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            {currentPageContent.title}
          </h2>
          <div className="max-w-none text-gray-700 dark:text-gray-300 leading-relaxed text-base md:text-lg space-y-4">
            {renderReadingContent(currentPageContent.content, highlightedCardName)}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            variant="secondary"
          >
            Previous
          </Button>
          <span className="text-gray-600 dark:text-gray-400">
            Page {currentPage} of {pages.length}
          </span>
          <Button
            onClick={() => setCurrentPage(Math.min(pages.length, currentPage + 1))}
            disabled={currentPage === pages.length}
            variant="secondary"
          >
            Next
          </Button>
        </div>

        {/* Share Section (shown on page 4) */}
        {currentPage === 4 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Share Your Reading
            </h3>

            {/* Share Card (screenshot-ready) */}
            <div
              id="share-card"
              className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-6 mb-6 border-2 border-purple-200 dark:border-purple-800"
            >
              <h4 className="text-2xl font-bold mb-4 text-center">
                {reading.share.title}
              </h4>
              <p className="text-lg font-medium mb-4 text-center">
                {reading.input.question}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {reading.draw.cards.map((cardData) => {
                  const card = getCardById(cardData.id);
                  return card ? (
                    <span
                      key={cardData.id}
                      className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm font-medium"
                    >
                      {card.symbol} {card.displayName}
                    </span>
                  ) : null;
                })}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-center">
                {reading.share.text}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {reading.meta.disclaimer}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={handleCopyShare} variant="primary">
                {copied ? "Copied!" : "Copy Share Text"}
              </Button>
              <Button
                onClick={handleAnotherReading}
                variant="secondary"
              >
                Another Reading
              </Button>
            </div>
          </div>
        )}

        {/* Disclaimer (always visible) */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          {reading.meta.disclaimer}
        </div>
      </div>
    </div>
  );
}
