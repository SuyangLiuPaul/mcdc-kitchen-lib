import { schedule } from "@netlify/functions";

// Runs every 2 hours — generates Gemini descriptions for items that don't have one yet.
export const handler = schedule("0 */2 * * *", async () => {
  const secret = process.env.CRON_SECRET;
  const baseUrl = process.env.NEXTAUTH_URL || process.env.URL;

  if (!secret || !baseUrl) {
    console.error("[cron] Missing CRON_SECRET or site URL env var.");
    return { statusCode: 500 };
  }

  try {
    const res = await fetch(
      `${baseUrl}/api/cron/generate-descriptions?secret=${secret}`
    );
    const data = await res.json();
    console.log(
      `[cron] generate-descriptions: generated ${data.generated}/${data.total}`,
      data.logs
    );
  } catch (err) {
    console.error("[cron] generate-descriptions failed:", err);
  }

  return { statusCode: 200 };
});
