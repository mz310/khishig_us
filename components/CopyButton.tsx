"use client";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className={`copy${ok ? " ok" : ""}`}
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable */ }
        setOk(true);
        setTimeout(() => setOk(false), 1800);
      }}
    >
      {ok ? "Хуулсан" : "Хуулах"}
    </button>
  );
}
