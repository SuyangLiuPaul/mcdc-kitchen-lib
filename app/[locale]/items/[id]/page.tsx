import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import ContactOwnerButton from "@/components/items/ContactOwnerButton";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
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
    locale === "zh" && item.descriptionZh
      ? item.descriptionZh
      : item.description;

  const categoryLabel = item.category
    ? tCat(item.category as "Kitchen" | "Cleaning" | "Tools" | "Other")
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href={`/${locale}`}
        className="inline-block mb-6 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
      >
        {t("backToList")}
      </Link>
      {item.imageUrls.length > 0 && (
        <div className="mb-6 space-y-2">
          {/* Main image */}
          <div className="relative w-full h-80 rounded-xl overflow-hidden">
            <Image
              src={item.imageUrls[0]}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
          {/* Thumbnail strip */}
          {item.imageUrls.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {item.imageUrls.slice(1).map((url, i) => (
                <div key={url} className="relative h-24 rounded-lg overflow-hidden">
                  <Image
                    src={url}
                    alt={`${title} photo ${i + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              item.status === "AVAILABLE"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {item.status === "AVAILABLE" ? t("available") : t("borrowed")}
          </span>
        </div>

        {categoryLabel && (
          <p className="text-sm text-gray-500">
            {t("category")}:{" "}
            <span className="inline-block bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium text-xs">
              {categoryLabel}
            </span>
          </p>
        )}

        {description && (
          <p className="text-gray-700 leading-relaxed">{description}</p>
        )}

        <div className="border-t pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {item.owner.image && (
              <Image
                src={item.owner.image}
                alt={item.owner.name ?? ""}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <p className="text-xs text-gray-400">{t("owner")}</p>
              <p className="font-medium text-gray-800">{item.owner.name}</p>
            </div>
          </div>
          <ContactOwnerButton email={item.owner.email ?? ""} />
        </div>
      </div>
    </div>
  );
}
