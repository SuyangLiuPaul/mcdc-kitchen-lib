import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { translateText } from "@/lib/translate";
import { generateItemDescription } from "@/lib/gemini";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  let { title, titleZh, imageUrls, category, status } = body;

  // Auto-translate title if only one language provided
  if (title && !titleZh) {
    titleZh = await translateText(title, "en->zh");
  } else if (!title && titleZh) {
    title = await translateText(titleZh, "zh->en");
  }

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Generate bilingual description via Gemini (silent fail — never blocks save)
  const generated = await generateItemDescription(title);

  const item = await prisma.item.create({
    data: {
      title,
      titleZh: titleZh || null,
      description: generated?.en || null,
      descriptionZh: generated?.zh || null,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      category: category || null,
      status: status || "AVAILABLE",
      ownerId: session.user.id,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
