import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, titleZh, description, descriptionZh, imageUrls, category, status } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const item = await prisma.item.create({
    data: {
      title,
      titleZh: titleZh || null,
      description: description || null,
      descriptionZh: descriptionZh || null,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      category: category || null,
      status: status || "AVAILABLE",
      ownerId: session.user.id,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
