import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text, direction } = await req.json(); // direction: "en->zh" | "zh->en"
  if (!text?.trim()) return NextResponse.json({ translation: "" });

  const langpair = direction === "zh->en" ? "zh-CN|en" : "en|zh-CN";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const translation = data?.responseData?.translatedText ?? "";
    return NextResponse.json({ translation });
  } catch {
    return NextResponse.json({ translation: "" }, { status: 500 });
  }
}
