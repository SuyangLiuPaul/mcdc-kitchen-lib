const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

type Description = { en: string; zh: string };
export type GeminiResult =
  | { result: Description; error?: never }
  | { error: string; result?: never }
  | null;

/**
 * Generate a short bilingual description for a shared item.
 * Returns null on timeout/network errors, { error } on API errors, { result } on success.
 */
export async function generateItemDescription(
  title: string
): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are a concise description writer for GraceShare, a community item-lending platform.

Given an item name, write a SHORT bilingual description (1–2 sentences per language).
- English first, then Chinese
- Warm, practical tone — no marketing language
- Focus on what the item is and why it's useful to borrow
- Return ONLY valid JSON with exactly two keys: { "en": "...", "zh": "..." }

Item name: ${title}`;

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 200, temperature: 0.4 },
      }),
      signal: AbortSignal.timeout(8000), // 8 s max — don't block the save
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "(unreadable)");
      console.error(`[gemini] HTTP ${res.status}:`, errText);
      return { error: `HTTP ${res.status}: ${errText.slice(0, 200)}` };
    }

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Strip markdown code fences if Gemini wraps the JSON
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed: Description = JSON.parse(cleaned);

    if (typeof parsed.en === "string" && typeof parsed.zh === "string") {
      return { result: parsed };
    }
    return null;
  } catch (err) {
    console.error("[gemini] exception:", err);
    return null; // timeout, parse error, network — silent fail
  }
}
