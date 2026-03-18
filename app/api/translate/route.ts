import { NextRequest, NextResponse } from "next/server";
import { translateText } from "@/lib/translate";

export async function POST(req: NextRequest) {
  const { text, direction } = await req.json();
  const translation = await translateText(text, direction);
  return NextResponse.json({ translation });
}
