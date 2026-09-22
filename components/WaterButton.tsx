import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { wave } from "@/lib/wave";

// The rising-water hover fill shared by every primary button.
export function Fill() {
  return (
    <span className="fill" aria-hidden="true">
      <svg className="run" viewBox="0 0 200 12" preserveAspectRatio="none"><path d={wave(6, 6, 50, 200, 12)} /></svg>
    </span>
  );
}

type Common = { className?: string; style?: React.CSSProperties; children: ReactNode };

export function WaterLink({ href, className = "", children, ...rest }: Common & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link href={href} className={`wbtn ${className}`} {...rest}>
      <Fill />
      {children}
    </Link>
  );
}

export function WaterButton({ className = "", children, ...rest }: Common & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button className={`wbtn ${className}`} {...rest}>
      <Fill />
      {children}
    </button>
  );
}
