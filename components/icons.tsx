// Small stroke icons used across the app (no icon library: keeps the bundle tiny).
type P = { size?: number; className?: string };
const base = (size: number) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });

export const IconHome = ({ size = 21 }: P) => <svg {...base(size)}><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9.5h13V10" /><path d="M10 19.5v-5h4v5" /></svg>;
export const IconDrop = ({ size = 21 }: P) => <svg {...base(size)}><path d="M12 3.5c3.4 4 5.8 7.2 5.8 10.2a5.8 5.8 0 0 1-11.6 0c0-3 2.4-6.2 5.8-10.2z" /><path d="M12 11v5M9.5 13.5h5" /></svg>;
export const IconList = ({ size = 21 }: P) => <svg {...base(size)}><rect x="4.5" y="4" width="15" height="16.5" rx="3" /><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" /></svg>;
export const IconUser = ({ size = 21 }: P) => <svg {...base(size)}><circle cx="12" cy="8.5" r="3.8" /><path d="M4.8 20c1.2-3.6 4-5.3 7.2-5.3s6 1.7 7.2 5.3" /></svg>;
export const IconUsers = ({ size = 21 }: P) => <svg {...base(size)}><circle cx="9" cy="8.5" r="3.3" /><path d="M3 19.5c.9-3 3.2-4.6 6-4.6s5.1 1.6 6 4.6" /><path d="M15.5 5.6a3.2 3.2 0 0 1 0 6M17.5 14.9c1.8.5 3 1.9 3.5 4.6" /></svg>;
export const IconCalendar = ({ size = 21 }: P) => <svg {...base(size)}><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M4 9.5h16M8.5 3.5v3M15.5 3.5v3" /></svg>;
export const IconReceipt = ({ size = 21 }: P) => <svg {...base(size)}><path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2z" /><path d="M9 8.5h6M9 12h6" /></svg>;
export const IconChart = ({ size = 21 }: P) => <svg {...base(size)}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>;
export const IconGear = ({ size = 21 }: P) => <svg {...base(size)}><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" /></svg>;
export const IconPhone = ({ size = 18 }: P) => <svg {...base(size)} strokeWidth={2}><path d="M6.6 3.5h2.8l1.5 4.3-2 1.4a11 11 0 0 0 5.9 5.9l1.4-2 4.3 1.5v2.8a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z" /></svg>;
export const IconMail = ({ size = 18 }: P) => <svg {...base(size)}><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="M4 7l8 6 8-6" /></svg>;
export const IconClock = ({ size = 16 }: P) => <svg {...base(size)} strokeWidth={2}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>;
export const IconBack = ({ size = 20 }: P) => <svg {...base(size)} strokeWidth={2}><path d="M15 5l-7 7 7 7" /></svg>;
export const IconSwap = ({ size = 20 }: P) => <svg {...base(size)}><path d="M4 9h13l-3.5-3.5M20 15H7l3.5 3.5" /></svg>;
export const IconCash = ({ size = 20 }: P) => <svg {...base(size)}><rect x="3" y="6.5" width="18" height="11" rx="2.5" /><circle cx="12" cy="12" r="2.6" /></svg>;
export const IconBank = ({ size = 20 }: P) => <svg {...base(size)}><path d="M3.5 9.5 12 4.5l8.5 5" /><path d="M5.5 10v7M10 10v7M14 10v7M18.5 10v7M3.5 19.5h17" /></svg>;
export const IconLater = ({ size = 20 }: P) => <svg {...base(size)}><path d="M4 12a8 8 0 1 0 2.4-5.7" /><path d="M4 4.5v4h4" /><path d="M12 8v4.5l3 1.5" /></svg>;
export const IconCheck = ({ size = 14 }: P) => <svg {...base(size)} strokeWidth={3}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
export const IconPlus = ({ size = 18 }: P) => <svg {...base(size)} strokeWidth={2.4}><path d="M6 12h12M12 6v12" /></svg>;
export const IconMinus = ({ size = 18 }: P) => <svg {...base(size)} strokeWidth={2.4}><path d="M6 12h12" /></svg>;
export const IconChevron = ({ size = 16 }: P) => <svg {...base(size)} strokeWidth={2}><path d="M6 9l6 6 6-6" /></svg>;
export const IconSearch = ({ size = 18 }: P) => <svg {...base(size)} strokeWidth={2}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></svg>;
export const IconRefresh = ({ size = 20 }: P) => <svg {...base(size)} strokeWidth={2}><path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7" /><path d="M20 4v4.7h-4.7" /><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.3" /><path d="M4 20v-4.7h4.7" /></svg>;
export const IconLeft = ({ size = 18 }: P) => <svg {...base(size)} strokeWidth={2.2}><path d="M15 5l-7 7 7 7" /></svg>;
export const IconRight = ({ size = 18 }: P) => <svg {...base(size)} strokeWidth={2.2}><path d="M9 5l7 7-7 7" /></svg>;
