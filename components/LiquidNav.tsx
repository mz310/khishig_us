"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { wave } from "@/lib/wave";

// prefix: the item is current for every path under its href (e.g. /orders/12). Kept serializable: server components pass these.
export type NavItem = { href: string; label: string; icon?: ReactNode; prefix?: boolean };

type Props = {
  items: NavItem[];
  className: string;       // "tb glass" (phone bar), "dnav bare" (landing), "vnav" (admin sidebar)
  itemClass: string;       // "tab" | "navi" | "vitem"
  vertical?: boolean;
  ariaLabel: string;
  current?: string;        // override the current href (defaults to pathname match)
};

// Longest travel of the trailing droplet; the goo filter stays on until it has landed.
const SETTLE_MS = 900;
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// A droplet (lead + lagging trail, merged by the goo filter while it moves) flows to the hovered / current item.
export function LiquidNav({ items, className, itemClass, vertical = false, ariaLabel, current }: Props) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const path = current ?? pathname;
  const curIndex = Math.max(0, items.findIndex((it) => path === it.href || (it.prefix && path.startsWith(it.href + "/"))));
  const [hover, setHover] = useState<number | null>(null);
  const [canHover, setCanHover] = useState(false);
  const active = hover ?? curIndex;
  const activeRef = useRef(active);
  activeRef.current = active;

  const place = useCallback((i: number, instant: boolean) => {
    const nav = navRef.current;
    const el = nav?.querySelectorAll<HTMLElement>("[data-nav]")[i];
    if (!nav || !el) return;
    if (!instant) {
      nav.classList.add("moving");
      if (settle.current) clearTimeout(settle.current);
      settle.current = setTimeout(() => nav.classList.remove("moving"), SETTLE_MS);
    }
    for (const b of [leadRef.current, trailRef.current]) {
      if (!b) continue;
      if (instant) b.style.transition = "none";
      if (vertical) { b.style.top = el.offsetTop + "px"; b.style.height = el.offsetHeight + "px"; }
      else { b.style.left = el.offsetLeft + "px"; b.style.width = el.offsetWidth + "px"; }
      if (instant) { void b.offsetWidth; b.style.transition = ""; }
    }
  }, [vertical]);

  // First paint: drop the droplet under the current item before the browser shows the bar.
  const placed = useRef(false);
  useIsoLayoutEffect(() => {
    place(active, !placed.current);
    placed.current = true;
  }, [active, place]);

  // Re-measure (without animating) when the bar or its fonts change size.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const again = () => place(activeRef.current, true);
    const ro = new ResizeObserver(again);
    ro.observe(nav);
    document.fonts?.ready.then(again);
    setCanHover(window.matchMedia("(hover: hover)").matches);
    return () => { ro.disconnect(); if (settle.current) clearTimeout(settle.current); };
  }, [place]);

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
          aria-current={i === curIndex ? "page" : undefined}
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
