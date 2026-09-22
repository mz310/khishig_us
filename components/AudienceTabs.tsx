"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

// Segmented control with an elastic pill; the panels swap below it.
export function Segmented<T extends string>({ options, value, onChange, className = "segbox white", style }: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const box = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const place = () => {
      const on = box.current?.querySelector<HTMLElement>(".seg.on");
      if (!on || !pill.current) return;
      pill.current.style.left = on.offsetLeft + "px";
      pill.current.style.width = on.offsetWidth + "px";
    };
    place();
    if (document.fonts) document.fonts.ready.then(place);
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [value]);
  return (
    <div ref={box} className={className} style={style}>
      <div ref={pill} className="pill" />
      {options.map((o) => (
        <button key={o.id} type="button" className={`seg${o.id === value ? " on" : ""}`} onClick={() => onChange(o.id)}>{o.label}</button>
      ))}
    </div>
  );
}

export function AudienceTabs({ home, org, homeFacts, orgFacts }: { home: ReactNode; org: ReactNode; homeFacts: ReactNode; orgFacts: ReactNode }) {
  const [v, setV] = useState<"home" | "org">("home");
  return (
    <>
      <div className="aud-text">
        <Segmented options={[{ id: "home", label: "Гэр бүлд" }, { id: "org", label: "Байгууллагад" }]} value={v} onChange={setV} style={{ width: 300 }} />
        <div className="aud-copy" key={v}>{v === "home" ? home : org}</div>
      </div>
      <AudiencePanel>{v === "home" ? homeFacts : orgFacts}</AudiencePanel>
    </>
  );
}

function AudiencePanel({ children }: { children: ReactNode }) {
  return <div className="aud-panel-slot">{children}</div>;
}
