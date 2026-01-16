// src/app/debug/page.tsx
"use client";

import { useMemo, useState } from "react";

type StartOk = {
  ok: true;
  drawId: string;
  phase: string;
  spread: number;
  expiresAt: number;
  cosmic: { dayOfYear: number; descriptor: string; metaphor: string };
};

type StartErr = { ok: false; error: string; details?: unknown };

type StartResponse = StartOk | StartErr;

type OkResp = { ok: true } & Record<string, unknown>;
type ErrResp = { ok: false; error: string; details?: unknown };

/* ---------- tiny type guards ---------- */

function isErrResp(x: unknown): x is ErrResp {
  return typeof x === "object" && x !== null && (x as { ok?: unknown }).ok === false;
}

function isStartOk(x: unknown): x is StartOk {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    o.ok === true &&
    typeof o.drawId === "string" &&
    typeof o.phase === "string" &&
    (o.spread === 3 || o.spread === 5) &&
    typeof o.expiresAt === "number"
  );
}

/* ---------- helpers ---------- */

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as T;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return json;
}

export default function DebugPage() {
  const [name, setName] = useState("Alan");
  const [question, setQuestion] = useState("Browser test");
  const [spread, setSpread] = useState<3 | 5>(3);

  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<StartResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const drawId = useMemo(
    () => (resp?.ok ? resp.drawId : null),
    [resp]
  );

  async function startDraw() {
    setLoading(true);
    setErr(null);
    setResp(null);
    setCopied(false);

    try {
      const res = await fetch("/api/draw/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, question, spread }),
      });

      const json: unknown = await res.json();

      if (!res.ok) {
        const msg =
          typeof json === "object" &&
          json !== null &&
          typeof (json as { error?: unknown }).error === "string"
            ? (json as { error: string }).error
            : `HTTP ${res.status}`;
        setErr(msg);
        setResp({ ok: false, error: msg });
        return;
      }

      if (!isStartOk(json)) {
        setErr("Unexpected response shape from /api/draw/start");
        setResp({ ok: false, error: "Unexpected response shape from /api/draw/start" });
        return;
      }

      setResp(json);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function copyDrawId() {
    if (!drawId) return;
    try {
      await navigator.clipboard.writeText(drawId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      alert("Copy failed (clipboard permission).");
    }
  }

  async function autoSelect() {
    if (!drawId) {
      setErr("No drawId yet. Click Start draw first.");
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      for (let i = 0; i < spread; i++) {
        const json = await postJson<OkResp | ErrResp>("/api/draw/select", {
          drawId,
          deckIndex: i,
        });
        if (isErrResp(json)) throw new Error(json.error);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Auto-select failed");
    } finally {
      setLoading(false);
    }
  }

  async function autoReveal() {
    if (!drawId) {
      setErr("No drawId yet. Click Start draw first.");
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      for (let i = 0; i < spread; i++) {
        const json = await postJson<OkResp | ErrResp>("/api/draw/reveal", {
          drawId,
          selectedIndex: i,
        });
        if (isErrResp(json)) throw new Error(json.error);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Auto-reveal failed");
    } finally {
      setLoading(false);
    }
  }

  async function completeDraw() {
    if (!drawId) {
      setErr("No drawId yet.");
      return;
    }
    const json = await postJson<OkResp | ErrResp>("/api/draw/complete", { drawId });
    if (isErrResp(json)) throw new Error(json.error);
  }

  async function autoFlow() {
    setErr(null);
    if (!drawId) {
      setErr("Click Start draw first.");
      return;
    }
    try {
      setLoading(true);
      await autoSelect();
      await autoReveal();
      await completeDraw(); // 🔒 REQUIRED STEP
      window.open(
        `/reading?drawId=${encodeURIComponent(drawId)}`,
        "_blank",
        "noreferrer"
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Auto-flow failed");
    } finally {
      setLoading(false);
    }
  }

  async function openReading() {
    if (!drawId) return;
    try {
      setLoading(true);
      await completeDraw(); // 🔒 REQUIRED STEP
      window.open(
        `/reading?drawId=${encodeURIComponent(drawId)}`,
        "_blank",
        "noreferrer"
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Open reading failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Debug — Draw Harness</h1>
      <div style={{ opacity: 0.75, marginBottom: 16 }}>
        Dev-only harness: start a draw, auto-select, auto-reveal, then open /reading.
      </div>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <label>
          <div style={{ marginBottom: 6 }}>Name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 8 }}
          />
        </label>

        <label>
          <div style={{ marginBottom: 6 }}>Question</div>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 8 }}
          />
        </label>

        <label>
          <div style={{ marginBottom: 6 }}>Spread</div>
          <select
            value={spread}
            onChange={(e) => setSpread(Number(e.target.value) as 3 | 5)}
            style={{ padding: 8, border: "1px solid #ddd", borderRadius: 8, width: 120 }}
          >
            <option value={3}>3</option>
            <option value={5}>5</option>
          </select>
        </label>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 16 }}>
        <button onClick={startDraw} disabled={loading}>
          {loading ? "Working…" : "Start draw"}
        </button>

        <button onClick={autoSelect} disabled={loading || !drawId}>
          Auto-select (0..N-1)
        </button>

        <button onClick={autoReveal} disabled={loading || !drawId}>
          Auto-reveal (0..N-1)
        </button>

        <button onClick={autoFlow} disabled={loading || !drawId}>
          Auto flow → complete → open /reading
        </button>

        {drawId && (
          <>
            <button onClick={copyDrawId}>{copied ? "Copied" : "Copy drawId"}</button>
            <button onClick={openReading} disabled={loading}>
              Complete → Open /reading
            </button>
            <a
              href={`/api/draw/state?drawId=${encodeURIComponent(drawId)}`}
              target="_blank"
              rel="noreferrer"
            >
              Open /state JSON
            </a>
          </>
        )}
      </div>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}

      {resp && (
        <pre
          style={{
            background: "#fafafa",
            border: "1px solid #eee",
            padding: 12,
            borderRadius: 12,
            overflowX: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
{JSON.stringify(resp, null, 2)}
        </pre>
      )}

      <div style={{ marginTop: 16, fontSize: 12, opacity: 0.7 }}>
        Notes: Debug harness enforces domain invariant: /reading requires /complete.
      </div>
    </main>
  );
}
