import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  const { title, titleZh, description, descriptionZh, imageUrls, category, status } = body;

  const updated = await prisma.item.update({
    where: { id },
    data: {
      title: title ?? item.title,
      titleZh: titleZh ?? item.titleZh,
      description: description ?? item.description,
      descriptionZh: descriptionZh ?? item.descriptionZh,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : item.imageUrls,
      category: category ?? item.category,
      status: status ?? item.status,
    },
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
