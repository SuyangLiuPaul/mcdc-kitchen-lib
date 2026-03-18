const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

type Description = { en: string; zh: string };

/**
 * Generate a short bilingual description for a shared item.
 * Returns null silently on quota errors, network failures, or missing key —
 * so the caller can save the item without a description and try again later.
 */
export async function generateItemDescription(
  title: string
): Promise<Description | null> {
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

    if (!res.ok) return null; // quota, rate-limit, etc — silent fail

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Strip markdown code fences if Gemini wraps the JSON
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed: Description = JSON.parse(cleaned);

    if (typeof parsed.en === "string" && typeof parsed.zh === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null; // timeout, parse error, network — silent fail
  }
}
