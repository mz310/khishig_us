// Shared SVG filters, gradients and clip paths used by the liquid nav and the bottle illustration.
export const JUG = "M108 48H152V68C152 74 230 76 230 120V350Q230 386 194 386H66Q30 386 30 350V120C30 76 108 74 108 68Z";
export const LABEL = "M40 202Q130 192 220 202V328Q130 338 40 328Z";

export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true" focusable="false">
      <defs>
        <filter id="goo" x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
        <clipPath id="jc"><path d={JUG} /></clipPath>
        <clipPath id="lc"><path d={LABEL} /></clipPath>
        <linearGradient id="jgBody" x1="0" x2="1">
          <stop offset="0" stopColor="#4E90CC" stopOpacity=".95" /><stop offset=".18" stopColor="#A6D2F2" stopOpacity=".9" />
          <stop offset=".42" stopColor="#EAF6FF" stopOpacity=".85" /><stop offset=".56" stopColor="#F8FCFF" stopOpacity=".8" />
          <stop offset=".74" stopColor="#B4DAF5" stopOpacity=".9" /><stop offset="1" stopColor="#3A78B8" stopOpacity=".95" />
        </linearGradient>
        <linearGradient id="jgDepth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".3" /><stop offset=".45" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="1" stopColor="#08203D" stopOpacity=".4" />
        </linearGradient>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5BB2EE" /><stop offset=".55" stopColor="#2F86D0" /><stop offset="1" stopColor="#174F8F" />
        </linearGradient>
        <radialGradient id="wsurf" cx=".5" cy=".5" r=".55"><stop offset="0" stopColor="#D2ECFC" /><stop offset="1" stopColor="#7EC1ED" /></radialGradient>
        <linearGradient id="capg" x1="0" x2="1">
          <stop offset="0" stopColor="#1B5C9E" /><stop offset=".28" stopColor="#3A93DC" /><stop offset=".5" stopColor="#63B3EE" /><stop offset=".72" stopColor="#3A93DC" /><stop offset="1" stopColor="#17528F" />
        </linearGradient>
        <linearGradient id="lblCurve" x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".26" /><stop offset=".14" stopColor="#000" stopOpacity=".05" /><stop offset=".5" stopColor="#FFF" stopOpacity=".08" /><stop offset=".86" stopColor="#000" stopOpacity=".05" /><stop offset="1" stopColor="#000" stopOpacity=".26" />
        </linearGradient>
        <radialGradient id="glow" cx=".5" cy="1" r=".9"><stop offset="0" stopColor="#8FD37A" stopOpacity=".95" /><stop offset="1" stopColor="#8FD37A" stopOpacity="0" /></radialGradient>
        <filter id="b4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter>
        <filter id="b8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
      </defs>
    </svg>
  );
}
