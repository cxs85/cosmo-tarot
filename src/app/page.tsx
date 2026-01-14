"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Cosmo Tarot ✨
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8">
            Interactive tarot for reflection & inspiration
          </p>
          <Link href="/reading/input">
            <Button variant="primary" className="text-lg px-8 py-4">
              Start a Reading
            </Button>
          </Link>
        </header>

        {/* Benefits */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Find Clarity Through Reflection
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-3">Clarity</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Gain insights into your questions and decisions through
                thoughtful card sequences.
              </p>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-3">Relationships</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Explore dynamics and connections in your personal and
                professional relationships.
              </p>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-3">Work Choices</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Reflect on career paths and professional decisions with
                meaningful guidance.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            How It Works
          </h2>
          <div className="space-y-4">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-6 shadow-md">
              <div className="flex items-start gap-4">
                <span className="text-2xl font-bold text-purple-600">1</span>
                <div>
                  <h3 className="font-semibold mb-2">Frame Your Question</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Share your name and the question you&apos;d like to explore.
                    Choose a 3-card or 5-card spread.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-6 shadow-md">
              <div className="flex items-start gap-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
                <div>
                  <h3 className="font-semibold mb-2">Shuffle & Select</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Shuffle the deck and select your cards. The ritual creates
                    space for reflection.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-6 shadow-md">
              <div className="flex items-start gap-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
                <div>
                  <h3 className="font-semibold mb-2">Reveal & Reflect</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Reveal your cards one by one, then receive a personalized
                    reading that interprets the sequence as a whole.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            What People Say
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-6 shadow-md">
              <p className="text-gray-700 dark:text-gray-300 italic mb-4">
                &quot;The sequence-based reading helped me see connections I hadn&apos;t
                noticed before. Beautiful and thoughtful.&quot;
              </p>
              <p className="text-sm text-gray-500">— Sarah M.</p>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-6 shadow-md">
              <p className="text-gray-700 dark:text-gray-300 italic mb-4">
                &quot;I love how the ritual creates a moment of pause. The reading
                felt personal and relevant.&quot;
              </p>
              <p className="text-sm text-gray-500">— Alex K.</p>
            </div>
          </div>
        </section>

        {/* Journal Section */}
        <section className="text-center">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-8 shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Personalized & Journal</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Each reading is personalized to your question and includes cosmic
              context that adds depth to your reflection. Save your readings to
              track insights over time.
            </p>
            <Link href="/reading/input">
              <Button variant="secondary">Try It Now</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
