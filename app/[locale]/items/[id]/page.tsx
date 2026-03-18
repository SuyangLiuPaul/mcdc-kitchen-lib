import Image from "next/image";
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {item.imageUrl && (
        <div className="relative w-full h-80 rounded-xl overflow-hidden mb-6">
          <Image
            src={item.imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
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

        {item.category && (
          <p className="text-sm text-gray-500">
            {t("category")}: {item.category}
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
