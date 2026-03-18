import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

type ItemWithOwner = {
  id: string;
  title: string;
  titleZh: string | null;
  imageUrl: string | null;
  status: string;
  category: string | null;
  owner: { name: string | null; image: string | null };
};

export default function ItemCard({
  item,
  locale,
}: {
  item: ItemWithOwner;
  locale: string;
}) {
  const t = useTranslations("item");
  const title = locale === "zh" && item.titleZh ? item.titleZh : item.title;

  return (
    <Link
      href={`/${locale}/items/${item.id}`}
      className="group block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative w-full h-48 bg-gray-100">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300 text-4xl">
            📦
          </div>
        )}
        <span
          className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium ${
            item.status === "AVAILABLE"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {item.status === "AVAILABLE" ? t("available") : t("borrowed")}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {t("owner")}: {item.owner.name}
        </p>
        {item.category && (
          <p className="text-xs text-gray-400 mt-1">{item.category}</p>
        )}
      </div>
    </Link>
  );
}
