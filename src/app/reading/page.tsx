// src/app/reading/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type ReadingResult = {
  meta: { drawId: string; createdAt: number; locale?: string };
  cards: { id: string; name: string }[];
  cosmic: { dayOfYear: number; descriptor: string; metaphor: string };
  pages: [string, string, string, string];
  shareText: string;
};

type ApiResponse =
  | { ok: true; reading: ReadingResult }
  | { ok: false; error: string; details?: unknown };

function getDrawIdFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const drawId = url.searchParams.get("drawId");
  return drawId ? drawId.trim() : null;
}

export default function ReadingPage() {
  const [drawId, setDrawId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState<ReadingResult | null>(null);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const id = getDrawIdFromLocation();
    setDrawId(id);
  }, []);

  useEffect(() => {
    if (drawId === null) {
        setLoading(false);
        setError("Missing drawId in URL. Example: /reading?drawId=YOUR_ID");
        return;
      }

    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      setCopied(false);

      try {
        if (!drawId) return;
        const res = await fetch(`/api/draw/reading?drawId=${encodeURIComponent(drawId)}`);
        const json = (await res.json()) as ApiResponse;

        if (cancelled) return;

        if (!res.ok || json.ok === false) {
          setError(json.ok === false ? json.error : `HTTP ${res.status}`);
          setReading(null);
          return;
        }

        setReading(json.reading);
        setPageIndex(0);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
          setReading(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [drawId]);

  const canPrev = pageIndex > 0;
  const canNext = pageIndex < 3;

  const cardLine = useMemo(() => {
    if (!reading) return "";
    return reading.cards.map((c) => c.name).join(" -> ");
  }, [reading]);

  async function onCopy() {
    if (!reading) return;
    try {
      await navigator.clipboard.writeText(reading.shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
      alert("Copy failed (clipboard permission).");
    }
  }

  if (loading) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1>Reading</h1>
        <p>Loading…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1>Reading</h1>
        <p style={{ color: "crimson" }}>{error}</p>
      </main>
    );
  }

  if (!reading) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1>Reading</h1>
        <p>No reading found.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Cosmo Tarot — Reading</h1>

      <div style={{ marginBottom: 12, opacity: 0.8 }}>
        <div><strong>Cards:</strong> {cardLine}</div>
        <div>
          <strong>Cosmic:</strong> {reading.cosmic.descriptor} ({reading.cosmic.metaphor})
        </div>
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 16,
          minHeight: 140,
          whiteSpace: "pre-wrap",
          lineHeight: 1.4,
        }}
      >
        <div style={{ opacity: 0.7, marginBottom: 8 }}>
          Page {pageIndex + 1} / 4
        </div>
        <div>{reading.pages[pageIndex as 0 | 1 | 2 | 3]}</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
        <button onClick={() => setPageIndex((p) => Math.max(0, p - 1))} disabled={!canPrev}>
          Back
        </button>
        <button onClick={() => setPageIndex((p) => Math.min(3, p + 1))} disabled={!canNext}>
          Next
        </button>

        <div style={{ flex: 1 }} />

        {pageIndex === 3 && (
          <button onClick={onCopy}>
            {copied ? "Copied" : "Copy share text"}
          </button>
        )}
      </div>

      <div style={{ marginTop: 16, fontSize: 12, opacity: 0.75 }}>
        For entertainment and reflection only.
      </div>
    </main>
  );
}
