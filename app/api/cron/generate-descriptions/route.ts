import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateItemDescription } from "@/lib/gemini";

// GET /api/cron/generate-descriptions?secret=CRON_SECRET
// Called by the Netlify scheduled function every 2 hours.
// Silently generates descriptions for any items that are missing one.
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.item.findMany({
    where: { description: null },
    select: { id: true, title: true },
  });

  if (items.length === 0) {
    return NextResponse.json({
      success: true,
      message: "All items already have descriptions.",
      generated: 0,
      total: 0,
      timestamp: new Date().toISOString(),
    });
  }

  let generated = 0;
  const logs: string[] = [];

  for (const item of items) {
    const desc = await generateItemDescription(item.title);
    if (desc) {
      await prisma.item.update({
        where: { id: item.id },
        data: { description: desc.en, descriptionZh: desc.zh },
      });
      generated++;
      logs.push(`✓ "${item.title}"`);
    } else {
      logs.push(`✗ "${item.title}" — quota or error, will retry next run`);
    }
    await new Promise((r) => setTimeout(r, 600));
  }

  return NextResponse.json({
    success: true,
    generated,
    total: items.length,
    logs,
    timestamp: new Date().toISOString(),
  });
}
