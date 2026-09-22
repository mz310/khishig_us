import Link from "next/link";

export function Lockup({ dark = false, href = "/", size = 21, tag = true, className = "" }: { dark?: boolean; href?: string; size?: number; tag?: boolean; className?: string }) {
  return (
    <Link href={href} className={`lockup${dark ? " on-dark" : ""} ${className}`}>
      <img src={dark ? "/logo-white.svg" : "/logo.svg"} alt="" />
      <span>
        <span className="wm" style={{ fontSize: size }}>ХИШИГ</span>
        {tag && <span className="tag">БАЙГАЛИЙН ЦЭВЭР УС</span>}
      </span>
    </Link>
  );
}
