import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

type ItemWithOwner = {
  id: string;
  title: string;
  titleZh: string | null;
  imageUrls: string[];
  status: string;
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
      className="group block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative w-full h-52 bg-gray-100">
        {item.imageUrls[0] ? (
          <Image
            src={item.imageUrls[0]}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300 text-5xl">
            📦
          </div>
        )}

        <span
          className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-semibold ${
            item.status === "AVAILABLE"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {item.status === "AVAILABLE" ? t("available") : t("borrowed")}
        </span>

        {item.imageUrls.length > 1 && (
          <span className="absolute top-3 left-3 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded font-medium">
            📷 {item.imageUrls.length}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base truncate">{title}</h3>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          {item.owner.image && (
            <Image
              src={item.owner.image}
              alt={item.owner.name ?? ""}
              width={22}
              height={22}
              className="rounded-full"
            />
          )}
          <p className="text-sm text-gray-500 truncate">{item.owner.name}</p>
        </div>
      </div>
    </Link>
  );
}
