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

    const generated = await generateItemDescription(item.title);
    if (generated) {
      await prisma.item.update({
        where: { id: item.id },
        data: { description: generated.en, descriptionZh: generated.zh },
      });
      return NextResponse.json({ success: true, generated: 1, total: 1 });
    }
    return NextResponse.json({ success: false, generated: 0, total: 1 });
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
      const desc = await generateItemDescription(item.title);
      if (desc) {
        await prisma.item.update({
          where: { id: item.id },
          data: { description: desc.en, descriptionZh: desc.zh },
        });
        generated++;
        logs.push(`✓ "${item.title}"`);
      } else {
        logs.push(`✗ "${item.title}" — quota or error`);
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
