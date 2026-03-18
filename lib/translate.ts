export async function translateText(
  text: string,
  direction: "en->zh" | "zh->en"
): Promise<string> {
  if (!text.trim()) return "";
  const langpair = direction === "zh->en" ? "zh-CN|en" : "en|zh-CN";
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`
    );
    const data = await res.json();
    return data?.responseData?.translatedText ?? "";
  } catch {
    return "";
  }
}
