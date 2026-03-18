"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/layout/ToastProvider";

type Item = {
  id: string;
  title: string;
  titleZh: string | null;
  description: string | null;
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

type LogEntry = {
  time: string;
  message: string;
  kind: "info" | "success" | "error";
};

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

  // Description generation state
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [showLog, setShowLog] = useState(false);

  const missingCount = items.filter((i) => !i.description).length;

  function addLog(message: string, kind: LogEntry["kind"] = "info") {
    const time = new Date().toLocaleTimeString();
    setLog((prev) => [{ time, message, kind }, ...prev].slice(0, 100));
    setShowLog(true);
  }

  // ── Generate description for a single item ─────────────────────────────────
  async function handleGenerateSingle(item: Item) {
    setGeneratingId(item.id);
    const title = locale === "zh" && item.titleZh ? item.titleZh : item.title;
    addLog(`Generating description for "${title}"…`, "info");
    try {
      const res = await fetch("/api/admin/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      const data = await res.json();
      if (res.ok && data.generated > 0) {
        addLog(`✓ Done — "${title}"`, "success");
        toast(t("descriptionGenerated"), "success");
        router.refresh();
      } else {
        addLog(`✗ Quota or error — "${title}". Try again later.`, "error");
        toast(t("descriptionFailed"), "error");
      }
    } catch {
      addLog(`✗ Network error for "${title}"`, "error");
      toast(tCommon("error"), "error");
    } finally {
      setGeneratingId(null);
    }
  }

  // ── Generate all missing ───────────────────────────────────────────────────
  async function handleGenerateAll() {
    setGeneratingAll(true);
    addLog(`Starting bulk generation for ${missingCount} item(s)…`, "info");
    try {
      const res = await fetch("/api/admin/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const data = await res.json();
      if (res.ok) {
        (data.logs as string[])?.forEach((l: string) =>
          addLog(l, l.startsWith("✓") ? "success" : "error")
        );
        addLog(
          `Bulk done — ${data.generated}/${data.total} generated.`,
          data.generated === data.total ? "success" : "info"
        );
        toast(`${data.generated}/${data.total} ${t("descriptionsBulkDone")}`, "success");
        router.refresh();
      } else {
        addLog("✗ Bulk generation failed.", "error");
        toast(tCommon("error"), "error");
      }
    } catch {
      addLog("✗ Network error during bulk generation.", "error");
      toast(tCommon("error"), "error");
    } finally {
      setGeneratingAll(false);
    }
  }

  // ── Item / User CRUD ───────────────────────────────────────────────────────
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

  async function handleToggleRole(id: string) {
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

  const confirmDestructive =
    confirm?.type === "deleteItem" || confirm?.type === "deleteUser";

  return (
    <div className="space-y-10">

      {/* ── Description Generation Panel ──────────────────────────────────── */}
      <section className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-semibold text-indigo-900 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-500" />
              {t("aiDescriptions")}
            </h2>
            <p className="text-sm text-indigo-600 mt-0.5">
              {missingCount === 0
                ? t("allDescriptionsDone")
                : t("missingDescriptions", { count: missingCount })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {missingCount > 0 && (
              <button
                onClick={handleGenerateAll}
                disabled={generatingAll || generatingId !== null}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
              >
                {generatingAll
                  ? <><Loader2 size={14} className="animate-spin" /> {t("generatingAll")}</>
                  : <><Sparkles size={14} /> {t("generateAllMissing")} ({missingCount})</>}
              </button>
            )}
            <button
              onClick={() => setShowLog((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-700 font-medium px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              {showLog ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {t("log")} {log.length > 0 && `(${log.length})`}
            </button>
          </div>
        </div>

        {/* Log panel */}
        {showLog && (
          <div className="mt-4 bg-gray-900 rounded-xl p-4 max-h-56 overflow-y-auto font-mono text-xs">
            {log.length === 0 ? (
              <p className="text-gray-500 italic">No activity yet.</p>
            ) : (
              log.map((entry, i) => (
                <div
                  key={i}
                  className={`flex gap-2 py-0.5 ${
                    entry.kind === "success"
                      ? "text-emerald-400"
                      : entry.kind === "error"
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  <span className="text-gray-600 shrink-0">{entry.time}</span>
                  <span>{entry.message}</span>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* ── Items ─────────────────────────────────────────────────────────── */}
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
                <th className="px-4 py-3 text-left">{t("colDescription")}</th>
                <th className="px-4 py-3 text-left">{t("colStatus")}</th>
                <th className="px-4 py-3 text-left">{t("colOwner")}</th>
                <th className="px-4 py-3 text-left">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const title = locale === "zh" && item.titleZh ? item.titleZh : item.title;
                const isGenerating = generatingId === item.id;
                const hasDesc = !!item.description;
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium max-w-[160px] truncate">{title}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {hasDesc ? (
                          <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle size={15} className="text-gray-300 shrink-0" />
                        )}
                        <button
                          onClick={() => handleGenerateSingle(item)}
                          disabled={isGenerating || generatingAll}
                          className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium hover:underline disabled:opacity-40 transition-colors active:scale-95"
                        >
                          {isGenerating
                            ? <><Loader2 size={11} className="animate-spin" /> {t("generating")}</>
                            : <><Sparkles size={11} /> {hasDesc ? t("regenerate") : t("generate")}</>}
                        </button>
                      </div>
                    </td>
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
                    <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate">
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

      {/* ── Users ─────────────────────────────────────────────────────────── */}
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
                          isAdmin ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
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
                              setConfirm({ type: "deleteUser", id: user.id, name: user.name })
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
          onConfirm={() => {
            if (confirm.type === "deleteItem") handleDeleteItem(confirm.id);
            else if (confirm.type === "deleteUser") handleDeleteUser(confirm.id);
            else if (confirm.type === "toggleRole") handleToggleRole(confirm.id);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
