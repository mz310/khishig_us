"use client";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button type="button" className="btn-plain" style={{ width: "100%" }} onClick={async () => { await authClient.signOut(); router.push("/"); router.refresh(); }}>
      Гарах
    </button>
  );
}
