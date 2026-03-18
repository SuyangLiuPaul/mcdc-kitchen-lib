import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ContactOwnerButton from "@/components/items/ContactOwnerButton";
import ImageGallery from "@/components/items/ImageGallery";
import { CATEGORY_ICONS, type Category } from "@/lib/categories";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) return {};
  const title = locale === "zh" && item.titleZh ? item.titleZh : item.title;
  return {
    title: `${title} — Wok & Roll`,
    description: item.description ?? undefined,
    openGraph: item.imageUrls[0]
      ? { images: [{ url: item.imageUrls[0] }] }
      : undefined,
  };
}

export default async function ItemDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const t = await getTranslations("item");
  const tCat = await getTranslations("categories");

  const item = await prisma.item.findUnique({
    where: { id },
    include: { owner: { select: { name: true, email: true, image: true } } },
  });

  if (!item) notFound();

  const title = locale === "zh" && item.titleZh ? item.titleZh : item.title;
  const description =
    locale === "zh" && item.descriptionZh ? item.descriptionZh : item.description;

  const categoryLabel = item.category
    ? tCat(item.category as Category)
    : null;
  const categoryIcon = item.category ? CATEGORY_ICONS[item.category] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href={`/${locale}`}
        className="inline-block mb-6 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
      >
        {t("backToList")}
      </Link>

      {/* Interactive photo gallery (client component) */}
      <ImageGallery images={item.imageUrls} title={title} />

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">{title}</h1>
          <span
            className={`shrink-0 px-3 py-1 rounded-full text-sm font-semibold ${
              item.status === "AVAILABLE"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {item.status === "AVAILABLE" ? t("available") : t("borrowed")}
          </span>
        </div>

        {categoryLabel && (
          <p className="text-sm text-gray-500 flex items-center gap-1.5">
            {t("category")}:
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium text-xs">
              {categoryIcon} {categoryLabel}
            </span>
          </p>
        )}

        {description && (
          <p className="text-gray-700 leading-relaxed">{description}</p>
        )}

        <div className="border-t pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {item.owner.image && (
              <Image
                src={item.owner.image}
                alt={item.owner.name ?? ""}
                width={44}
                height={44}
                className="rounded-full ring-2 ring-indigo-100"
              />
            )}
            <div>
              <p className="text-xs text-gray-400">{t("owner")}</p>
              <p className="font-semibold text-gray-800">{item.owner.name}</p>
            </div>
          </div>
          <ContactOwnerButton email={item.owner.email ?? ""} />
        </div>
      </div>
    </div>
  );
}
