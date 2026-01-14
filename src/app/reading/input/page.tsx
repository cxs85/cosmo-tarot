"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SpreadType, ZodiacSign } from "@/lib/types";

const QUESTION_EXAMPLES = [
  "What should I focus on this week?",
  "How can I improve my relationships?",
  "What's blocking my progress?",
  "What do I need to know about this decision?",
  "How can I find more balance?",
  "What's the next step in my career?",
  "What am I not seeing clearly?",
  "How can I move forward with confidence?",
];

const ZODIAC_SIGNS: ZodiacSign[] = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

export default function InputPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [spread, setSpread] = useState<SpreadType>(3);
  const [birthdate, setBirthdate] = useState("");
  const [zodiac, setZodiac] = useState<ZodiacSign | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !question.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/draws/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          question: question.trim(),
          spread,
          birthdate: birthdate || undefined,
          zodiac: zodiac || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start reading");
      }

      const data = await response.json();
      router.push(`/reading/ritual/${data.drawId}`);
    } catch (error) {
      console.error("Error starting reading:", error);
      alert("Failed to start reading. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleZodiacChange = (value: ZodiacSign | "") => {
    setZodiac(value);
    if (value) {
      setBirthdate(""); // Clear birthdate when zodiac is manually selected
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            Frame Your Reading
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Set your intention and choose your spread
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
              >
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>

            {/* Question */}
            <div>
              <label
                htmlFor="question"
                className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
              >
                Your Question <span className="text-red-500">*</span>
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="What would you like guidance on?"
              />
              <div className="mt-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Or choose an example:
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUESTION_EXAMPLES.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setQuestion(example)}
                      className="text-sm px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Spread Selection */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                Spread Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSpread(3)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    spread === 3
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-purple-300"
                  }`}
                >
                  <div className="text-xl font-semibold mb-1">3-Card</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Past, Present, Future
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSpread(5)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    spread === 5
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-purple-300"
                  }`}
                >
                  <div className="text-xl font-semibold mb-1">5-Card</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Deeper Insight
                  </div>
                </button>
              </div>
            </div>

            {/* Birthdate / Zodiac */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="birthdate"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Birthdate (Optional)
                </label>
                <input
                  id="birthdate"
                  type="date"
                  value={birthdate}
                  onChange={(e) => {
                    setBirthdate(e.target.value);
                    if (e.target.value) setZodiac(""); // Clear zodiac when birthdate is set
                  }}
                  disabled={!!zodiac}
                  className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    zodiac ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="zodiac"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Zodiac Sign (Optional)
                </label>
                <select
                  id="zodiac"
                  value={zodiac}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleZodiacChange(value === "" ? "" : (value as ZodiacSign));
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select zodiac sign</option>
                  {ZODIAC_SIGNS.map((sign) => (
                    <option key={sign} value={sign}>
                      {sign.charAt(0).toUpperCase() + sign.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={!name.trim() || !question.trim() || isSubmitting}
              >
                {isSubmitting ? "Starting..." : "Begin Reading"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
