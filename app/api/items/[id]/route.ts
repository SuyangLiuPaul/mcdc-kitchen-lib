import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { translateText } from "@/lib/translate";
import { generateItemDescription } from "@/lib/gemini";

async function getItemAndCheckAccess(id: string, userId: string) {
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) return { item: null, allowed: false };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  const allowed = item.ownerId === userId || user?.role === "ADMIN";
  return { item, allowed };
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { item, allowed } = await getItemAndCheckAccess(id, session.user.id);

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  let { title, titleZh, description, descriptionZh, imageUrls, category, status } = body;

  // Resolve final title, falling back to existing
  const finalTitle = title || item.title;
  let finalTitleZh = titleZh || item.titleZh || null;

  // Auto-translate title if other language still missing
  if (finalTitle && !finalTitleZh) {
    finalTitleZh = await translateText(finalTitle, "en->zh");
  }

  // Regenerate description with Gemini only if item has none yet
  let finalDescription = item.description;
  let finalDescriptionZh = item.descriptionZh;
  if (!item.description) {
    const gemini = await generateItemDescription(finalTitle);
    if (gemini?.result) {
      finalDescription = gemini.result.en;
      finalDescriptionZh = gemini.result.zh;
    }
  }

  const updated = await prisma.item.update({
    where: { id },
    data: {
      title: finalTitle,
      titleZh: finalTitleZh,
      description: finalDescription || null,
      descriptionZh: finalDescriptionZh || null,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : item.imageUrls,
      category: category ?? item.category,
      status: status ?? item.status,
    },
  });

  return NextResponse.json(updated);
}

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { item, allowed } = await getItemAndCheckAccess(id, session.user.id);

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const newStatus = item.status === "AVAILABLE" ? "BORROWED" : "AVAILABLE";
  const updated = await prisma.item.update({
    where: { id },
    data: { status: newStatus },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { item, allowed } = await getItemAndCheckAccess(id, session.user.id);

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.item.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
