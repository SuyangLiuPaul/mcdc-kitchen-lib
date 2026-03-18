import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { translateText } from "@/lib/translate";

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

  // Resolve final values, falling back to existing item fields
  const finalTitle = title || item.title;
  const finalDescription = description || item.description || null;
  let finalTitleZh = titleZh || item.titleZh || null;
  let finalDescriptionZh = descriptionZh || item.descriptionZh || null;

  // Auto-translate only if the other language has no value yet
  if (finalTitle && !finalTitleZh) {
    finalTitleZh = await translateText(finalTitle, "en->zh");
  }
  if (finalDescriptionZh === null && finalDescription) {
    finalDescriptionZh = await translateText(finalDescription, "en->zh");
  }

  const updated = await prisma.item.update({
    where: { id },
    data: {
      title: finalTitle,
      titleZh: finalTitleZh,
      description: finalDescription,
      descriptionZh: finalDescriptionZh,
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
