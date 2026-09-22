import { wave } from "@/lib/wave";
import { JUG, LABEL } from "./SvgDefs";

type Props = { kind?: "hero" | "plain" | "fill"; phone?: string; className?: string };

const font = { fontFamily: "var(--font-onest), Onest, sans-serif" } as const;

function Label({ phone }: { phone: string }) {
  return (
    <>
      <g clipPath="url(#lc)">
        <path d={LABEL} fill="#FFFFFF" />
        <ellipse cx="130" cy="338" rx="130" ry="58" fill="url(#glow)" />
        <g transform="translate(40 0)">
          <path d={wave(286, 8, 60, 180, 340)} fill="#5FB3DE" opacity=".8" />
          <path d={wave(293, 6, 60, 180, 340)} fill="#2F7FC1" opacity=".85" />
        </g>
        <path d="M40 308Q130 312 220 308V328Q130 338 40 328Z" fill="#2B2A5C" />
        <path transform="translate(86 315) scale(.5)" d="M6.6 3.5h2.8l1.5 4.3-2 1.4a11 11 0 0 0 5.9 5.9l1.4-2 4.3 1.5v2.8a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
        <text x="136" y="326" textAnchor="middle" style={{ ...font, fontWeight: 700, fontSize: 11, fill: "#fff", letterSpacing: ".6px" }}>{phone}</text>
        <image href="/logo.svg" x="108" y="206" width="44" height="18.4" />
        <text x="130" y="252" textAnchor="middle" style={{ ...font, fontWeight: 800, fontSize: 24, fill: "#2B2A5C", letterSpacing: "2.5px" }}>ХИШИГ</text>
        <text x="130" y="265" textAnchor="middle" style={{ ...font, fontWeight: 700, fontSize: 7.5, fill: "#3E8E2A", letterSpacing: "1.7px" }}>БАЙГАЛИЙН ЦЭВЭР УС</text>
        <path d={LABEL} fill="url(#lblCurve)" />
      </g>
      <path d={LABEL} fill="none" stroke="rgba(10,30,60,.18)" strokeWidth="1" />
    </>
  );
}

// Polycarbonate 18.9 l jug: tinted body, water with a meniscus, wrapped label, edge darkening, specular streaks, ribbed cap.
// The water inside is still: animating it would repaint the blur filters on every frame.
export function Bottle({ kind = "hero", phone = "8802 7971", className }: Props) {
  const fill = kind === "fill";
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 260 420" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        {kind === "hero" && <ellipse cx="130" cy="406" rx="100" ry="11" fill="#06122A" opacity=".45" filter="url(#b8)" />}
        <path d="M158 62C202 60 214 98 190 126" fill="none" stroke="rgba(150,200,240,.6)" strokeWidth="13" strokeLinecap="round" />
        <path d="M160 60C200 58 210 94 188 120" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="3" strokeLinecap="round" />
        <g clipPath="url(#jc)">
          <rect width="260" height="420" fill="url(#jgBody)" />
          <g className={fill ? "fillup" : undefined}>
            <rect x="0" y="150" width="260" height="270" fill="url(#wg)" opacity=".95" />
            <path d={wave(152, 7, 65, 520, 420)} fill="#62B5EC" opacity=".9" />
            <path transform="translate(-32 0)" d={wave(158, 5, 65, 520, 420)} fill="#3D93DA" opacity=".85" />
            <ellipse cx="130" cy="153" rx="99" ry="9" fill="url(#wsurf)" opacity=".85" />
            <path d="M44 151Q130 141 216 151" fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="1.8" />
            <ellipse cx="108" cy="296" rx="42" ry="14" fill="#FFFFFF" opacity=".16" filter="url(#b8)" />
            <ellipse cx="172" cy="338" rx="30" ry="10" fill="#FFFFFF" opacity=".13" filter="url(#b8)" />
          </g>
          {!fill && (
            <>
              <circle className="bub" cx="74" cy="380" r="3.5" fill="rgba(255,255,255,.7)" />
              <circle className="bub b2" cx="150" cy="386" r="2.5" fill="rgba(255,255,255,.6)" />
              <circle className="bub b3" cx="196" cy="376" r="4" fill="rgba(255,255,255,.5)" />
              <circle className="bub b4" cx="112" cy="390" r="2" fill="rgba(255,255,255,.7)" />
            </>
          )}
          <path d="M30 352H230V350Q230 386 194 386H66Q30 386 30 350Z" fill="url(#capg)" opacity=".92" />
          <path d="M32 354H228" stroke="rgba(255,255,255,.45)" strokeWidth="1.5" />
          <rect width="260" height="420" fill="url(#jgDepth)" />
          <path d={JUG} fill="none" stroke="#08203D" strokeWidth="16" opacity=".38" filter="url(#b8)" />
          <path d="M30 137Q130 149 230 137" fill="none" stroke="rgba(0,20,50,.2)" strokeWidth="3" />
          <path d="M30 141Q130 153 230 141" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />
          <path d="M30 341Q130 353 230 341" fill="none" stroke="rgba(0,20,50,.2)" strokeWidth="3" />
          <path d="M30 345Q130 357 230 345" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="1.5" />
        </g>
        <Label phone={phone} />
        <ellipse cx="60" cy="230" rx="8" ry="118" fill="#FFFFFF" opacity=".5" filter="url(#b4)" />
        <path d="M60 108C52 170 52 282 62 332" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" opacity=".9" />
        <ellipse cx="204" cy="200" rx="5" ry="72" fill="#FFFFFF" opacity=".22" filter="url(#b4)" />
        <path d="M114 74C152 70 206 82 224 116" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity=".55" filter="url(#b4)" />
        <path d={JUG} fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="1.6" />
        <rect x="101" y="46" width="58" height="9" rx="4" fill="rgba(255,255,255,.6)" />
        <rect x="99" y="49" width="62" height="5" rx="2" fill="#2A6FAE" />
        <rect x="100" y="14" width="60" height="36" rx="8" fill="url(#capg)" />
        <path d="M108 20V46M118 20V46M128 20V46M138 20V46M148 20V46" stroke="rgba(0,10,40,.2)" strokeWidth="3" />
        <path d="M111 20V46M121 20V46M131 20V46M141 20V46M151 20V46" stroke="rgba(255,255,255,.3)" strokeWidth="1.5" />
        <rect x="97" y="10" width="66" height="12" rx="6" fill="#5AA5E6" />
        <rect x="102" y="11" width="56" height="4" rx="2" fill="rgba(255,255,255,.55)" />
      </svg>
    </div>
  );
}
