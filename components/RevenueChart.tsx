"use client";
import { useEffect, useRef, useState } from "react";
import { fmtMoney } from "@/lib/domain";
import type { ChartBucket } from "@/lib/report";

function compact(n: number) {
  if (n >= 1e6) return `${Math.round(n / 1e5) / 10} сая`;
  if (n >= 1e3) return `${Math.round(n / 1e3)} мян`;
  return String(n);
}
function niceMax(max: number, ticks: number) {
  const raw = max / ticks;
  const pow = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1))));
  const step = [1, 2, 2.5, 5, 10].map((x) => x * pow).find((x) => x >= raw) ?? 10 * pow;
  return { step, top: step * Math.ceil(max / step) };
}
function topRounded(x: number, y: number, w: number, h: number, rad: number) {
  const r = Math.max(0, Math.min(rad, w / 2, h));
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

// Stacked columns (Данс at the base, Бэлэн on top), one per bucket, with a per-column tooltip.
export function RevenueChart({ buckets, height = 220, label = "Орлогын график" }: { buckets: ChartBucket[]; height?: number; label?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(600);
  const [hover, setHover] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = root.current; if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.max(240, el.clientWidth)));
    ro.observe(el); setW(Math.max(240, el.clientWidth));
    const t = setTimeout(() => setInView(true), 30);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, []);

  const H = height, padL = 46, padR = 6, padT = 12, padB = 26;
  const plotW = W - padL - padR, plotH = H - padT - padB, base = padT + plotH;
  const max = Math.max(1, ...buckets.map((b) => b.total));
  const sc = niceMax(max, 4);
  const n = buckets.length, band = plotW / n, bw = Math.max(2, Math.min(24, band - 2));
  const ticks: number[] = [];
  for (let v = 0; v <= sc.top + 1e-9; v += sc.step) ticks.push(v);
  const cols = buckets.map((b, i) => {
    const x = padL + i * band + (band - bw) / 2;
    const ht = (b.transfer / sc.top) * plotH, hc = (b.cash / sc.top) * plotH;
    const gap = ht > 0 && hc > 0 ? 2 : 0;
    return { x, ht, hc, gap, cx: x + bw / 2, top: base - ht - gap - hc };
  });
  const tip = hover != null ? buckets[hover] : null;
  const tipLeft = hover != null ? Math.max(0, Math.min(W - 160, cols[hover].cx - 80)) : 0;
  const tipTop = hover != null ? Math.max(0, cols[hover].top - 96) : 0;

  return (
    <div ref={root} className="viz">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={label} className={hover != null ? "hovering" : undefined} onPointerLeave={() => setHover(null)}>
        {ticks.map((v) => { const y = base - (v / sc.top) * plotH; return (<g key={v}><line x1={padL} x2={W - padR} y1={y} y2={y} className={v === 0 ? "axis" : "grid"} /><text x={padL - 8} y={y + 4} className="tick" textAnchor="end">{v === 0 ? "0" : compact(v)}</text></g>); })}
        {buckets.map((b, i) => {
          const c = cols[i];
          return (
            <g key={i} className={`col${b.today ? " is-today" : ""}${inView ? " in" : ""}${hover === i ? " hl" : ""}`} style={{ transitionDelay: `${Math.min(i * 14, 400)}ms,0ms`, transformOrigin: `0 ${base}px` }}>
              {c.ht > 0 && (c.hc > 0 ? <rect x={c.x} y={base - c.ht} width={bw} height={c.ht} className="s-transfer" /> : <path d={topRounded(c.x, base - c.ht, bw, c.ht, 4)} className="s-transfer" />)}
              {c.hc > 0 && <path d={topRounded(c.x, base - c.ht - c.gap - c.hc, bw, c.hc, 4)} className="s-cash" />}
            </g>
          );
        })}
        {buckets.map((b, i) => b.show && <text key={"l" + i} x={padL + i * band + band / 2} y={H - 8} className={`xlab${b.today ? " now" : ""}`} textAnchor="middle">{b.label}</text>)}
        {buckets.map((b, i) => (
          <rect key={"h" + i} x={padL + i * band} y={padT} width={band} height={plotH + padB} className="hit" tabIndex={0}
            aria-label={`${b.title}: ${b.future ? "хараахан болоогүй" : "нийт " + fmtMoney(b.total)}`}
            onPointerEnter={() => setHover(i)} onPointerDown={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} />
        ))}
      </svg>
      {tip && (
        <div className="tt" style={{ transform: `translate(${tipLeft}px,${tipTop}px)` }}>
          <div className="tt-h">{tip.title}</div>
          {tip.future ? <div className="tt-t">Хараахан болоогүй</div> : (
            <>
              <div className="tt-r"><i className="k-transfer" /><b>{fmtMoney(tip.transfer)}</b><span>Данс</span></div>
              <div className="tt-r"><i className="k-cash" /><b>{fmtMoney(tip.cash)}</b><span>Бэлэн</span></div>
              <div className="tt-t">Нийт {fmtMoney(tip.total)}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
