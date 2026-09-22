"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IconRight } from "./icons";
import { WaterLink } from "./WaterButton";

type Item = { href: string; label: string };

// Phone-width site menu: a round glass button that drops a panel of section links under the header.
export function MobileMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <>
      <button type="button" className="mburger glass dark nav-toggle" aria-label={open ? "Цэс хаах" : "Цэс"} aria-expanded={open} aria-controls="mmenu" onClick={() => setOpen((o) => !o)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open && <div className="mmenu-veil" onClick={() => setOpen(false)} />}
      <nav id="mmenu" className={`mmenu glass dark${open ? " open" : ""}`} aria-label="Цэс" hidden={!open}>
        {items.map((it) => <Link key={it.href} href={it.href} className="mmenu-item" onClick={() => setOpen(false)}>{it.label}<IconRight size={18} /></Link>)}
        <WaterLink href="/app" className="blue" onClick={() => setOpen(false)}>Захиалах<IconRight size={18} /></WaterLink>
      </nav>
    </>
  );
}
