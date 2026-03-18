import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ContactOwnerButton from "@/components/items/ContactOwnerButton";
import ImageGallery from "@/components/items/ImageGallery";
type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) return {};
  const title = locale === "zh" && item.titleZh ? item.titleZh : item.title;
  return {
    title: `${title} — GraceShare`,
    description: item.description ?? undefined,
    openGraph: item.imageUrls[0]
      ? { images: [{ url: item.imageUrls[0] }] }
      : undefined,
  };
}

export default async function ItemDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const t = await getTranslations("item");

  const item = await prisma.item.findUnique({
    where: { id },
    include: { owner: { select: { name: true, email: true, image: true } } },
  });

  if (!item) notFound();

  const title = locale === "zh" && item.titleZh ? item.titleZh : item.title;
  const description =
    locale === "zh" && item.descriptionZh ? item.descriptionZh : item.description;

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
