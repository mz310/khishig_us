// Deterministic avatar colours and initials for customers (no photos are stored).
const PALETTE = [["#E3EFF6", "#12314A"], ["#FBF1E0", "#6E4A0F"], ["#E2F1EA", "#1E5F45"], ["#ECEAF5", "#3E3A78"], ["#FAECE6", "#86341A"]];

export const avatarStyle = (id: number) => ({ background: PALETTE[id % PALETTE.length][0], color: PALETTE[id % PALETTE.length][1] });

export const initials = (name: string) => name.trim().split(/\s+/).map((s) => s.charAt(0)).join("").slice(0, 2).toUpperCase();
