"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ComicButtonAsButton } from "@/components/ui/ComicButton";
import type { Database, ReferralCodeStatus } from "@/types/database";

type Influencer = Database["public"]["Tables"]["influencers"]["Row"];
type CodeRow = Database["public"]["Tables"]["referral_codes"]["Row"] & {
  influencers: { display_name: string } | null;
};

export function CodesPanel({
  codes,
  influencers,
}: {
  codes: CodeRow[];
  influencers: Influencer[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReferralCodeStatus | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [influencerId, setInfluencerId] = useState(influencers[0]?.id ?? "");
  const [count, setCount] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(10);
  const [commissionPercent, setCommissionPercent] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return codes.filter((c) => {
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesSearch =
        !q ||
        c.code.toLowerCase().includes(q) ||
        c.influencers?.display_name.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [codes, search, statusFilter]);

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    const influencer = influencers.find((i) => i.id === influencerId);
    if (!influencer) {
      setError("Choose an influencer first.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          influencerId,
          influencerName: influencer.display_name,
          count,
          discountPercent,
          commissionPercent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not generate codes.");
        return;
      }
      setShowForm(false);
      setCount(1);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function toggleStatus(code: CodeRow) {
    if (code.status === "used") return;
    setTogglingId(code.id);
    const nextStatus = code.status === "available" ? "disabled" : "available";
    try {
      await fetch(`/api/codes/${code.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      router.refresh();
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl text-comic-black">Referral Codes</h1>
        <div className="flex gap-3">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download from a route handler, not page navigation */}
          <a
            href="/api/codes/export"
            className="comic-panel-sm flex items-center gap-2 rounded-full bg-comic-black px-4 py-2 text-sm font-bold text-white"
          >
            <Download size={16} /> Export CSV
          </a>
          <ComicButtonAsButton
            variant="blue"
            className="px-4 py-2 text-base"
            onClick={() => setShowForm((v) => !v)}
            disabled={influencers.length === 0}
          >
            <Plus size={18} /> Generate codes
          </ComicButtonAsButton>
        </div>
      </div>
      {influencers.length === 0 && (
        <p className="mt-2 text-sm text-comic-black/60">
          Add an influencer first before generating codes.
        </p>
      )}

      {showForm && (
        <form onSubmit={handleGenerate} className="comic-panel mt-5 rounded-2xl bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <div>
              <label className="mb-1 block text-sm font-bold text-comic-black">Influencer</label>
              <select
                value={influencerId}
                onChange={(e) => setInfluencerId(e.target.value)}
                className="w-full rounded-xl border-2 border-comic-black px-3 py-2"
              >
                {influencers.map((inf) => (
                  <option key={inf.id} value={inf.id}>
                    {inf.display_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-comic-black">
                How many codes
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full rounded-xl border-2 border-comic-black px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-comic-black">
                Buyer discount %
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full rounded-xl border-2 border-comic-black px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-comic-black">
                Influencer commission %
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(Number(e.target.value))}
                className="w-full rounded-xl border-2 border-comic-black px-3 py-2"
              />
            </div>
          </div>
          {error && <p className="mt-3 text-sm font-semibold text-comic-red">{error}</p>}
          <div className="mt-4">
            <ComicButtonAsButton type="submit" variant="green" disabled={generating}>
              {generating ? <Loader2 className="animate-spin" size={18} /> : "Generate"}
            </ComicButtonAsButton>
          </div>
        </form>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-comic-black/40" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code or influencer..."
            className="w-full rounded-xl border-2 border-comic-black py-2 pr-3 pl-9 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReferralCodeStatus | "all")}
          className="rounded-xl border-2 border-comic-black px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="available">Available</option>
          <option value="used">Used</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      <div className="comic-panel mt-5 overflow-x-auto rounded-2xl bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-comic-black bg-comic-black/5">
              <th className="px-4 py-3 font-bold">Code</th>
              <th className="px-4 py-3 font-bold">Influencer</th>
              <th className="px-4 py-3 font-bold">Discount</th>
              <th className="px-4 py-3 font-bold">Commission</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Created</th>
              <th className="px-4 py-3 font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-comic-black/50">
                  No codes match your search.
                </td>
              </tr>
            )}
            {filtered.map((code) => (
              <tr key={code.id} className="border-b border-comic-black/10 last:border-0">
                <td className="px-4 py-3 font-mono font-semibold tracking-wide">{code.code}</td>
                <td className="px-4 py-3">{code.influencers?.display_name ?? "—"}</td>
                <td className="px-4 py-3 text-comic-black/70">{code.discount_percent}%</td>
                <td className="px-4 py-3 text-comic-black/70">{code.commission_percent}%</td>
                <td className="px-4 py-3">
                  <Badge tone={code.status}>{code.status}</Badge>
                </td>
                <td className="px-4 py-3 text-comic-black/60">
                  {new Date(code.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  {code.status !== "used" && (
                    <button
                      onClick={() => toggleStatus(code)}
                      disabled={togglingId === code.id}
                      className="text-xs font-bold text-sky-blue hover:underline disabled:opacity-50"
                    >
                      {togglingId === code.id
                        ? "..."
                        : code.status === "available"
                          ? "Disable"
                          : "Re-enable"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
