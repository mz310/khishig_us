"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { wave } from "@/lib/wave";

// prefix: the item is current for every path under its href (e.g. /orders/12). Kept serializable: server components pass these.
export type NavItem = { href: string; label: string; icon?: ReactNode; prefix?: boolean };

type Props = {
  items: NavItem[];
  className: string;       // "tb glass" (phone bar), "dnav glass dark" (desktop pill), "vnav" (admin sidebar)
  itemClass: string;       // "tab" | "navi" | "vitem"
  vertical?: boolean;
  ariaLabel: string;
  current?: string;        // override the current href (defaults to pathname match)
};

// A droplet (lead + lagging trail, merged by the goo filter) flows to the hovered / current item.
export function LiquidNav({ items, className, itemClass, vertical = false, ariaLabel, current }: Props) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const path = current ?? pathname;
  const curIndex = Math.max(0, items.findIndex((it) => path === it.href || (it.prefix && path.startsWith(it.href + "/"))));
  const [hover, setHover] = useState<number | null>(null);
  const active = hover ?? curIndex;

  const place = useCallback((i: number, instant: boolean) => {
    const nav = navRef.current;
    if (!nav) return;
    const el = nav.querySelectorAll<HTMLElement>("[data-nav]")[i];
    if (!el) return;
    for (const b of [leadRef.current, trailRef.current]) {
      if (!b) continue;
      if (instant) b.style.transition = "none";
      if (vertical) { b.style.top = el.offsetTop + "px"; b.style.height = el.offsetHeight + "px"; }
      else { b.style.left = el.offsetLeft + "px"; b.style.width = el.offsetWidth + "px"; }
      if (instant) { void b.offsetWidth; b.style.transition = ""; }
    }
  }, [vertical]);

  useEffect(() => { place(active, false); }, [active, place]);
  useEffect(() => {
    place(curIndex, true);
    const again = () => place(hover ?? curIndex, true);
    if (document.fonts) document.fonts.ready.then(again);
    window.addEventListener("resize", again);
    return () => window.removeEventListener("resize", again);
  }, [curIndex, hover, place]);

  const canHover = typeof window !== "undefined" && window.matchMedia?.("(hover: hover)").matches;

  return (
    <nav ref={navRef} className={className} data-liquid aria-label={ariaLabel} onMouseLeave={() => setHover(null)}>
      <div className="goo">
        <div ref={trailRef} className="blob trail" />
        <div ref={leadRef} className="blob lead">
          <svg className="run" viewBox="0 0 200 56" preserveAspectRatio="none" aria-hidden="true"><path className="w1" d={wave(30, 8, 50, 200, 56)} /></svg>
          <svg className="run-rev" viewBox="0 0 200 56" preserveAspectRatio="none" aria-hidden="true"><path className="w2" d={wave(38, 6, 50, 200, 56)} /></svg>
          <span className="shine" />
        </div>
      </div>
      {items.map((it, i) => (
        <Link
          key={it.href + it.label}
          href={it.href}
          data-nav
          className={`${itemClass}${i === active ? " on" : ""}`}
          onMouseEnter={canHover ? () => setHover(i) : undefined}
          onFocus={() => setHover(i)}
          onBlur={() => setHover(null)}
        >
          {it.icon}
          {it.label}
        </Link>
      ))}
    </nav>
  );
}
