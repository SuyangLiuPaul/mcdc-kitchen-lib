"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Loader2, RefreshCw } from "lucide-react";

type LogEntry = {
  id: string;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
  action: string;
  target: string | null;
  detail: string | null;
};

const ACTION_GROUPS = [
  { value: "ALL", labelKey: "filterAll" },
  { value: "LOGIN", labelKey: "filterLogin" },
  { value: "ITEM_CREATE", labelKey: "filterItemCreate" },
  { value: "ITEM_EDIT", labelKey: "filterItemEdit" },
  { value: "ITEM_DELETE", labelKey: "filterItemDelete" },
  { value: "STATUS_CHANGE", labelKey: "filterStatusChange" },
  { value: "USER_ROLE_CHANGE", labelKey: "filterRoleChange" },
  { value: "USER_DELETE", labelKey: "filterUserDelete" },
  { value: "DESCRIPTION_GENERATE", labelKey: "filterDescGen" },
];

const ACTION_STYLES: Record<string, string> = {
  LOGIN: "bg-blue-100 text-blue-700",
  ITEM_CREATE: "bg-emerald-100 text-emerald-700",
  ITEM_EDIT: "bg-amber-100 text-amber-700",
  ITEM_DELETE: "bg-red-100 text-red-700",
  STATUS_CHANGE: "bg-purple-100 text-purple-700",
  USER_ROLE_CHANGE: "bg-orange-100 text-orange-700",
  USER_DELETE: "bg-red-100 text-red-700",
  DESCRIPTION_GENERATE: "bg-indigo-100 text-indigo-700",
};

export default function ActivityLogPanel() {
  const t = useTranslations("activityLog");

  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState(today);
  const [action, setAction] = useState("ALL");
  const [page, setPage] = useState(1);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async (currentPage: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (action !== "ALL") params.set("action", action);
    params.set("page", String(currentPage));

    try {
      const res = await fetch(`/api/admin/activity?${params}`);
      const data = await res.json();
      setLogs(data.logs ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [from, to, action]);

  useEffect(() => {
    setPage(1);
    fetchLogs(1);
  }, [fetchLogs]);

  function handlePageChange(newPage: number) {
    setPage(newPage);
    fetchLogs(newPage);
  }

  const totalPages = Math.ceil(total / 50);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <button
          onClick={() => fetchLogs(page)}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {t("refresh")}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500 whitespace-nowrap">{t("dateFrom")}</label>
          <input
            type="date"
            value={from}
            max={to || today}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500 whitespace-nowrap">{t("dateTo")}</label>
          <input
            type="date"
            value={to}
            min={from}
            max={today}
            onChange={(e) => setTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {ACTION_GROUPS.map((g) => (
            <option key={g.value} value={g.value}>
              {t(g.labelKey)}
            </option>
          ))}
        </select>
        {(from || action !== "ALL") && (
          <button
            onClick={() => { setFrom(""); setAction("ALL"); }}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            {t("clearFilters")}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">{t("colTime")}</th>
              <th className="px-4 py-3 text-left">{t("colUser")}</th>
              <th className="px-4 py-3 text-left">{t("colAction")}</th>
              <th className="px-4 py-3 text-left">{t("colTarget")}</th>
              <th className="px-4 py-3 text-left">{t("colDetail")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  <Loader2 size={18} className="animate-spin mx-auto" />
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm italic">
                  {t("noLogs")}
                </td>
              </tr>
            ) : (
              logs.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800 text-xs">{entry.userName ?? "—"}</div>
                    {entry.userEmail && (
                      <div className="text-gray-400 text-xs">{entry.userEmail}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        ACTION_STYLES[entry.action] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t(`actions.${entry.action}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-[180px] truncate">
                    {entry.target ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {entry.detail ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{total} {t("totalEntries")}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              ←
            </button>
            <span className="font-medium">{page} / {totalPages}</span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages || loading}
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
