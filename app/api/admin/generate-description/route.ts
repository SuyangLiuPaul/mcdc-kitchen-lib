import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateItemDescription } from "@/lib/gemini";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

// POST /api/admin/generate-description
// Body: { itemId: string }          → regenerate for one specific item
//       { all: true }               → generate for all items missing descriptions
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  // ── Single item ────────────────────────────────────────────────────────────
  if (body.itemId) {
    const item = await prisma.item.findUnique({
      where: { id: body.itemId },
      select: { id: true, title: true },
    });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const gemini = await generateItemDescription(item.title);
    if (gemini?.result) {
      await prisma.item.update({
        where: { id: item.id },
        data: { description: gemini.result.en, descriptionZh: gemini.result.zh },
      });
      return NextResponse.json({ success: true, generated: 1, total: 1 });
    }
    const reason = gemini?.error ?? "timeout or network error";
    return NextResponse.json({ success: false, generated: 0, total: 1, error: reason });
  }

  // ── Bulk: all items missing a description ─────────────────────────────────
  if (body.all) {
    const items = await prisma.item.findMany({
      where: { description: null },
      select: { id: true, title: true },
    });

    let generated = 0;
    const logs: string[] = [];

    for (const item of items) {
      const gemini = await generateItemDescription(item.title);
      if (gemini?.result) {
        await prisma.item.update({
          where: { id: item.id },
          data: { description: gemini.result.en, descriptionZh: gemini.result.zh },
        });
        generated++;
        logs.push(`✓ "${item.title}"`);
      } else {
        const reason = gemini?.error ?? "timeout or network error";
        logs.push(`✗ "${item.title}" — ${reason}`);
      }
      // Small pause to respect Gemini rate limits
      await new Promise((r) => setTimeout(r, 600));
    }

    return NextResponse.json({
      success: true,
      generated,
      total: items.length,
      logs,
    });
  }

  return NextResponse.json({ error: "Invalid body" }, { status: 400 });
}
