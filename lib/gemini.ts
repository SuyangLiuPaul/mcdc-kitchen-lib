const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

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
  if (!apiKey) return { error: "GEMINI_API_KEY not set in environment" };

  const prompt = `Write a 1-sentence description for a shared community item in both English and Chinese.
Return ONLY this JSON, nothing else:
{"en":"one sentence in English","zh":"一句中文描述"}

Item: ${title}`;

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.4 },
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "(unreadable)");
      console.error(`[gemini] HTTP ${res.status}:`, errText);
      return { error: `HTTP ${res.status}: ${errText}` };
    }

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    console.log("[gemini] raw response:", raw);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { error: `No JSON in response: ${raw}` };

    const parsed: Description = JSON.parse(jsonMatch[0]);

    if (typeof parsed.en === "string" && typeof parsed.zh === "string") {
      return { result: parsed };
    }
    return { error: `Unexpected JSON shape: ${jsonMatch[0]}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[gemini] exception:", msg);
    return { error: msg };
  }
}
