"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/layout/ToastProvider";
import { CATEGORY_ICONS, type Category } from "@/lib/categories";

type Item = {
  id: string;
  title: string;
  titleZh: string | null;
  category: string | null;
  status: string;
  owner: { name: string | null; email: string | null };
};

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
};

export default function AdminItemsTable({
  items,
  users,
  locale,
}: {
  items: Item[];
  users: User[];
  locale: string;
}) {
  const t = useTranslations("admin");
  const tCat = useTranslations("categories");
  const tCommon = useTranslations("common");
  const { toast } = useToast();
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function confirmDelete(id: string) {
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast(t("deleteSuccess"), "success");
      router.refresh();
    } else {
      toast(tCommon("error"), "error");
    }
    setDeleteId(null);
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t("allItems")}</h2>
          <span className="text-sm text-gray-400 font-medium">{items.length} {t("totalItems")}</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">{t("colTitle")}</th>
                <th className="px-4 py-3 text-left">{t("colCategory")}</th>
                <th className="px-4 py-3 text-left">{t("colStatus")}</th>
                <th className="px-4 py-3 text-left">{t("colOwner")}</th>
                <th className="px-4 py-3 text-left">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const title = locale === "zh" && item.titleZh ? item.titleZh : item.title;
                const categoryLabel = item.category
                  ? `${CATEGORY_ICONS[item.category]} ${tCat(item.category as Category)}`
                  : "—";
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium max-w-[180px] truncate">{title}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{categoryLabel}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.status === "AVAILABLE"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">
                      {item.owner.name}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium hover:underline"
                      >
                        {t("deleteItem")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t("allUsers")}</h2>
          <span className="text-sm text-gray-400 font-medium">{users.length} {t("totalUsers")}</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">{t("colName")}</th>
                <th className="px-4 py-3 text-left">{t("colEmail")}</th>
                <th className="px-4 py-3 text-left">{t("colRole")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {deleteId && (
        <ConfirmDialog
          message={t("deleteConfirm")}
          confirmLabel={t("deleteItem")}
          cancelLabel={tCommon("cancel")}
          onConfirm={() => confirmDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
