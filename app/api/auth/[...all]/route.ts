import { getAuth } from "@/lib/auth";

export async function GET(req: Request) {
  return (await getAuth()).handler(req);
}

export async function POST(req: Request) {
  return (await getAuth()).handler(req);
}
