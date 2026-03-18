"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/layout/ToastProvider";

type Item = {
  id: string;
  title: string;
  titleZh: string | null;
  status: string;
  owner: { name: string | null; email: string | null };
};

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
};

type Confirm =
  | { type: "deleteItem"; id: string }
  | { type: "deleteUser"; id: string; name: string | null }
  | { type: "toggleRole"; id: string; name: string | null; currentRole: string };

export default function AdminItemsTable({
  items,
  users,
  locale,
  currentUserId,
}: {
  items: Item[];
  users: User[];
  locale: string;
  currentUserId: string;
}) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const { toast } = useToast();
  const router = useRouter();
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleDeleteItem(id: string) {
    setLoadingId(id);
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    setLoadingId(null);
    setConfirm(null);
    if (res.ok) { toast(t("deleteSuccess"), "success"); router.refresh(); }
    else toast(tCommon("error"), "error");
  }

  async function handleDeleteUser(id: string) {
    setLoadingId(id);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setLoadingId(null);
    setConfirm(null);
    if (res.ok) { toast(t("userDeleteSuccess"), "success"); router.refresh(); }
    else toast(tCommon("error"), "error");
  }

  async function handleToggleRole(id: string, currentRole: string) {
    setLoadingId(id);
    const res = await fetch(`/api/admin/users/${id}`, { method: "PATCH" });
    setLoadingId(null);
    setConfirm(null);
    if (res.ok) { toast(t("roleUpdated"), "success"); router.refresh(); }
    else toast(tCommon("error"), "error");
  }

  function confirmMessage() {
    if (!confirm) return "";
    if (confirm.type === "deleteItem") return t("deleteConfirm");
    if (confirm.type === "deleteUser")
      return t("deleteUserConfirm", { name: confirm.name ?? confirm.id });
    if (confirm.type === "toggleRole")
      return confirm.currentRole === "ADMIN"
        ? t("demoteConfirm", { name: confirm.name ?? confirm.id })
        : t("promoteConfirm", { name: confirm.name ?? confirm.id });
    return "";
  }

  function handleConfirm() {
    if (!confirm) return;
    if (confirm.type === "deleteItem") handleDeleteItem(confirm.id);
    else if (confirm.type === "deleteUser") handleDeleteUser(confirm.id);
    else if (confirm.type === "toggleRole") handleToggleRole(confirm.id, confirm.currentRole);
  }

  const confirmDestructive =
    confirm?.type === "deleteItem" || confirm?.type === "deleteUser";

  return (
    <div className="space-y-10">
      {/* ── Items ─────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t("allItems")}</h2>
          <span className="text-sm text-gray-400 font-medium">
            {items.length} {t("totalItems")}
          </span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">{t("colTitle")}</th>
                <th className="px-4 py-3 text-left">{t("colStatus")}</th>
                <th className="px-4 py-3 text-left">{t("colOwner")}</th>
                <th className="px-4 py-3 text-left">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const title = locale === "zh" && item.titleZh ? item.titleZh : item.title;
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium max-w-[180px] truncate">{title}</td>
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
                        onClick={() => setConfirm({ type: "deleteItem", id: item.id })}
                        disabled={loadingId === item.id}
                        className="text-red-600 hover:text-red-800 text-xs font-medium hover:underline transition-colors active:scale-95 disabled:opacity-50"
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

      {/* ── Users ─────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t("allUsers")}</h2>
          <span className="text-sm text-gray-400 font-medium">
            {users.length} {t("totalUsers")}
          </span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">{t("colName")}</th>
                <th className="px-4 py-3 text-left">{t("colEmail")}</th>
                <th className="px-4 py-3 text-left">{t("colRole")}</th>
                <th className="px-4 py-3 text-left">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const isSelf = user.id === currentUserId;
                const isAdmin = user.role === "ADMIN";
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      <span className="flex items-center gap-2">
                        {user.name}
                        {isSelf && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-semibold">
                            {t("you")}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isAdmin
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isSelf ? (
                        <span className="text-xs text-gray-300 italic">{t("noActions")}</span>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              setConfirm({
                                type: "toggleRole",
                                id: user.id,
                                name: user.name,
                                currentRole: user.role,
                              })
                            }
                            disabled={loadingId === user.id}
                            className={`text-xs font-medium hover:underline transition-colors active:scale-95 disabled:opacity-50 ${
                              isAdmin
                                ? "text-amber-600 hover:text-amber-800"
                                : "text-indigo-600 hover:text-indigo-800"
                            }`}
                          >
                            {isAdmin ? t("demoteAdmin") : t("makeAdmin")}
                          </button>
                          <span className="text-gray-200">|</span>
                          <button
                            onClick={() =>
                              setConfirm({
                                type: "deleteUser",
                                id: user.id,
                                name: user.name,
                              })
                            }
                            disabled={loadingId === user.id}
                            className="text-red-600 hover:text-red-800 text-xs font-medium hover:underline transition-colors active:scale-95 disabled:opacity-50"
                          >
                            {t("deleteUser")}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {confirm && (
        <ConfirmDialog
          message={confirmMessage()}
          confirmLabel={tCommon("confirm")}
          cancelLabel={tCommon("cancel")}
          destructive={confirmDestructive}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
