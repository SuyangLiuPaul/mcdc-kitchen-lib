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
    {
      num: "01",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
      ),
      text: t("step1"),
    },
    {
      num: "02",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      text: t("step2"),
    },
    {
      num: "03",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" />
        </svg>
      ),
      text: t("step3"),
    },
  ];
  return (
    <div className="bg-white border-b border-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <p className="text-center text-xs font-bold text-indigo-400 uppercase tracking-widest mb-10">
          {t("howItWorks")}
        </p>
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Connecting line — desktop only */}
          <div className="hidden sm:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-indigo-100 z-0" />

          {steps.map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center text-center gap-4">
              {/* Icon circle */}
              <div className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm">
                {step.icon}
              </div>
              {/* Step number */}
              <span className="text-xs font-bold text-indigo-300 tracking-widest">{step.num}</span>
              {/* Text */}
              <p className="text-sm text-gray-600 leading-relaxed max-w-[180px]">{step.text}</p>
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
