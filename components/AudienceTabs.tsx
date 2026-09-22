"use client";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// Segmented control with an elastic pill; the panels swap below it.
// Until the pill is measured (server HTML, before hydration) the current segment is filled by CSS instead.
export function Segmented<T extends string>({ options, value, onChange, className = "segbox white", style }: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const box = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useIsoLayoutEffect(() => {
    const place = () => {
      const on = box.current?.querySelector<HTMLElement>(".seg.on");
      if (!on || !pill.current) return;
      pill.current.style.left = on.offsetLeft + "px";
      pill.current.style.width = on.offsetWidth + "px";
    };
    place();
    setReady(true);
    const ro = new ResizeObserver(place);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, [value]);
  return (
    <div ref={box} className={`${className}${ready ? " ready" : ""}`} style={style} role="tablist">
      <div ref={pill} className="pill" aria-hidden="true" />
      {options.map((o) => (
        <button key={o.id} type="button" role="tab" aria-selected={o.id === value} className={`seg${o.id === value ? " on" : ""}`} onClick={() => onChange(o.id)}>{o.label}</button>
      ))}
    </div>
  );
}

export function AudienceTabs({ home, org, homeFacts, orgFacts }: { home: ReactNode; org: ReactNode; homeFacts: ReactNode; orgFacts: ReactNode }) {
  const [v, setV] = useState<"home" | "org">("home");
  return (
    <>
      <div className="aud-text">
        <Segmented options={[{ id: "home", label: "Гэр бүлд" }, { id: "org", label: "Байгууллагад" }]} value={v} onChange={setV} style={{ width: 300, maxWidth: "100%" }} />
        <div className="aud-copy" key={v}>{v === "home" ? home : org}</div>
      </div>
      <div className="aud-panel-slot" key={"p" + v}>{v === "home" ? homeFacts : orgFacts}</div>
    </>
  );
}
