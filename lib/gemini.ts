const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

type Description = { en: string; zh: string };
export type GeminiResult =
  | { result: Description; error?: never }
  | { error: string; result?: never }
  | null;

export async function generateItemDescription(
  title: string
): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { error: "GEMINI_API_KEY not set in environment" };

  // Very direct prompt — no preamble, output ONLY the JSON object
  const prompt = `Output ONLY a raw JSON object, no explanation, no markdown, no code fences.
Format: {"en":"one sentence","zh":"一句话"}
Item: ${title}`;

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1000, temperature: 0.4 },
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "(unreadable)");
      console.error(`[gemini] HTTP ${res.status}:`, errText);
      return { error: `HTTP ${res.status}: ${errText}` };
    }

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    const finishReason = candidate?.finishReason ?? "unknown";
    const raw: string = candidate?.content?.parts?.[0]?.text ?? "";

    console.log("[gemini] finishReason:", finishReason);
    console.log("[gemini] raw:", raw);

    // Build detailed context for error messages
    const ctx = `finishReason=${finishReason} | raw="${raw}"`;

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { error: `No JSON found. ${ctx}` };

    let parsed: Description;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return { error: `JSON parse failed: ${e}. ${ctx}` };
    }

    if (typeof parsed.en === "string" && typeof parsed.zh === "string") {
      return { result: parsed };
    }
    return { error: `Missing en/zh keys. ${ctx}` };

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[gemini] exception:", msg);
    return { error: `Exception: ${msg}` };
  }
}
