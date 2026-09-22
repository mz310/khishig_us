"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Fill } from "./WaterButton";

export function GoogleSignIn({ callbackURL }: { callbackURL: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <button
        className="wbtn"
        style={{ height: 56, fontSize: 16, width: "100%" }}
        disabled={busy}
        onClick={async () => {
          setBusy(true); setError(null);
          const r = await authClient.signIn.social({ provider: "google", callbackURL });
          if (r.error) { setError(r.error.message ?? "Нэвтэрч чадсангүй. Дахин оролдоно уу."); setBusy(false); }
        }}
      >
        <Fill />
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.5 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.5 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.2 5.5-4.7 7.2l7.5 5.8c4.4-4 7-10 7-17z" /><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.7 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4-13.5-9.7l-7.9 6.1C6.5 42.6 14.6 48 24 48z" /></svg>
        {busy ? "Google руу шилжиж байна…" : "Google-ээр нэвтрэх"}
      </button>
      {error && <div className="err" style={{ textAlign: "center" }}>{error}</div>}
    </div>
  );
}
