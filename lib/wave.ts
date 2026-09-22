// Wave path: baseline y, amplitude a, period p, drawn to width w, closed at height h.
export function wave(y: number, a: number, p: number, w: number, h: number): string {
  let d = `M0 ${y} Q${p / 4} ${y - a} ${p / 2} ${y}`;
  for (let x = p; x <= w; x += p / 2) d += ` T${x} ${y}`;
  return `${d} V${h} H0 Z`;
}
