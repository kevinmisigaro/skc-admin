"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ComicButtonAsButton } from "@/components/ui/ComicButton";
import type { Database } from "@/types/database";

type Influencer = Database["public"]["Tables"]["influencers"]["Row"];

export function InfluencersPanel({ influencers }: { influencers: Influencer[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [contact, setContact] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/influencers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, contact }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create influencer.");
        return;
      }
      setDisplayName("");
      setContact("");
      setShowForm(false);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(influencer: Influencer) {
    setTogglingId(influencer.id);
    const nextStatus = influencer.status === "active" ? "inactive" : "active";
    try {
      await fetch(`/api/influencers/${influencer.id}`, {
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
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-comic-black">Influencers</h1>
        <ComicButtonAsButton
          variant="blue"
          className="px-4 py-2 text-base"
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus size={18} /> Add influencer
        </ComicButtonAsButton>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="comic-panel mt-5 rounded-2xl bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-comic-black">
                Display name
              </label>
              <input
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border-2 border-comic-black px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-comic-black">
                Contact (optional)
              </label>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full rounded-xl border-2 border-comic-black px-3 py-2"
              />
            </div>
          </div>
          {error && <p className="mt-3 text-sm font-semibold text-comic-red">{error}</p>}
          <div className="mt-4">
            <ComicButtonAsButton type="submit" variant="green" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={18} /> : "Save influencer"}
            </ComicButtonAsButton>
          </div>
        </form>
      )}

      <div className="comic-panel mt-6 overflow-x-auto rounded-2xl bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-comic-black bg-comic-black/5">
              <th className="px-4 py-3 font-bold">Name</th>
              <th className="px-4 py-3 font-bold">Contact</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Added</th>
              <th className="px-4 py-3 font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {influencers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-comic-black/50">
                  No influencers yet. Add the first one above.
                </td>
              </tr>
            )}
            {influencers.map((inf) => (
              <tr key={inf.id} className="border-b border-comic-black/10 last:border-0">
                <td className="px-4 py-3 font-semibold">{inf.display_name}</td>
                <td className="px-4 py-3 text-comic-black/70">{inf.contact ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge tone={inf.status === "active" ? "available" : "disabled"}>
                    {inf.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-comic-black/60">
                  {new Date(inf.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleStatus(inf)}
                    disabled={togglingId === inf.id}
                    className="text-xs font-bold text-sky-blue hover:underline disabled:opacity-50"
                  >
                    {togglingId === inf.id
                      ? "..."
                      : inf.status === "active"
                        ? "Deactivate"
                        : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
