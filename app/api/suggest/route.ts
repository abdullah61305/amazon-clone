import { NextResponse } from "next/server";
import { suggest } from "@/lib/catalog";

export function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.slice(0, 100) ?? "";
  return NextResponse.json(suggest(q), { headers: { "Cache-Control": "public, max-age=300" } });
}
