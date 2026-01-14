"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function ReadingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Reading error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">
          Reading Error
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error.message || "Something went wrong with your reading"}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="primary">
            Try again
          </Button>
          <Button
            onClick={() => router.push("/reading/input")}
            variant="secondary"
          >
            Start New Reading
          </Button>
        </div>
      </div>
    </div>
  );
}
