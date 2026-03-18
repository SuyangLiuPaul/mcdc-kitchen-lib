import { useTranslations } from "next-intl";
import { prisma } from "@/lib/prisma";
import ItemCard from "@/components/items/ItemCard";
import ItemFilters from "@/components/items/ItemFilters";

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const { locale } = await params;
  const { search, category } = await searchParams;

  const items = await prisma.item.findMany({
    where: {
      status: "AVAILABLE",
      ...(category && category !== "all" ? { category } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { titleZh: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { owner: { select: { name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <HomeHeader />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ItemFilters total={items.length} />
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {items.map((item: Parameters<typeof ItemCard>[0]["item"]) => (
              <ItemCard key={item.id} item={item} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HomeHeader() {
  const t = useTranslations("home");
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border-b border-indigo-100 py-14 px-6 text-center">
      <h1 className="text-5xl font-bold text-indigo-900 tracking-tight">
        {t("title")}
      </h1>
      <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
        {t("subtitle")}
      </p>
    </div>
  );
}

function EmptyState() {
  const t = useTranslations("home");
  return (
    <div className="text-center py-24">
      <div className="text-6xl mb-4">📦</div>
      <p className="text-gray-400 text-lg">{t("noItems")}</p>
    </div>
  );
}
