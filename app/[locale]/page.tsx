import { useTranslations } from "next-intl";
import { prisma } from "@/lib/prisma";
import ItemCard from "@/components/items/ItemCard";
import ItemFilters from "@/components/items/ItemFilters";

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string }>;
}) {
  const { locale } = await params;
  const { search } = await searchParams;

  const items = await prisma.item.findMany({
    where: {
      status: "AVAILABLE",
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

  const hasFilters = !!search;

  return (
    <div>
      <HomeHeader />
      <HowItWorks />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ItemFilters total={items.length} />
        {items.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
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
    <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border-b border-indigo-100 py-16 px-6 text-center">
      <h1 className="text-5xl font-bold text-indigo-900 tracking-tight">
        {t("title")}
      </h1>
      <p className="mt-3 text-xl font-medium text-indigo-500 tracking-wide">
        {t("tagline")}
      </p>
      <p className="mt-4 text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
        {t("about")}
      </p>
    </div>
  );
}

function HowItWorks() {
  const t = useTranslations("home");
  const steps = [
    { icon: "🔍", text: t("step1") },
    { icon: "💬", text: t("step2") },
    { icon: "🔄", text: t("step3") },
  ];
  return (
    <div className="bg-white border-b border-gray-100 py-8 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
          {t("howItWorks")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3 bg-indigo-50 rounded-xl px-4 py-4">
              <span className="text-2xl shrink-0">{step.icon}</span>
              <p className="text-sm text-indigo-800 leading-snug">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  const t = useTranslations("home");
  return (
    <div className="text-center py-24">
      <div className="text-6xl mb-4">{hasFilters ? "🔍" : "📦"}</div>
      <p className="text-gray-400 text-lg">
        {hasFilters ? t("noResults") : t("noItems")}
      </p>
    </div>
  );
}
