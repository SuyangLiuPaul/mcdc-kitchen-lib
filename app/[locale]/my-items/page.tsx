import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MyItemsList from "@/components/items/MyItemsList";

export default async function MyItemsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}`);
  }

  const t = await getTranslations("myItems");

  const items = await prisma.item.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-500 mt-1">{t("subtitle")}</p>
        </div>
      </div>
      <MyItemsList items={items} locale={locale} />
    </div>
  );
}
