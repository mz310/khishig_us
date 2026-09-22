"use client";
import { useEffect, useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  useEffect(() => { if (!ok) return; const t = setTimeout(() => setOk(false), 1800); return () => clearTimeout(t); }, [ok]);
  return (
    <button
      type="button"
      className={`copy${ok ? " ok" : ""}`}
      aria-live="polite"
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable */ }
        setOk(true);
      }}
    >
      {ok ? "Хуулсан" : "Хуулах"}
    </button>
  );
}
