"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelMyOrder } from "@/app/actions/orders";

export function CancelOrderButton({ id }: { id: number }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (!confirm) return <button type="button" className="ghost-danger" onClick={() => setConfirm(true)}>Цуцлах</button>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button
        type="button"
        className="ghost-danger"
        disabled={pending}
        onClick={() => start(async () => {
          const r = await cancelMyOrder(id);
          if (r.error) setError(r.error); else router.refresh();
        })}
      >
        {pending ? "Цуцалж байна…" : "Тийм, цуцал"}
      </button>
      <button type="button" className="linkbtn" onClick={() => setConfirm(false)}>Болих</button>
      {error && <div className="err">{error}</div>}
    </div>
  );
}
