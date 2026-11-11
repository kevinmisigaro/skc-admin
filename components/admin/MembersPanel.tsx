"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { MemberRow } from "@/lib/data/admin";
import type { MemberRole } from "@/types/database";

const ROLE_LABELS: Record<MemberRole, string> = {
  fan: "Fan",
  parent_guardian: "Parent / Guardian",
  creator: "Creator",
  competitor: "Competitor",
  vendor: "Vendor",
  instructor: "Instructor",
  influencer: "Influencer",
};

export function MembersPanel({ members }: { members: MemberRow[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<MemberRole | "all">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      const matchesRole = roleFilter === "all" || m.role === roleFilter;
      const matchesSearch =
        !q ||
        m.display_name.toLowerCase().includes(q) ||
        (m.email?.toLowerCase().includes(q) ?? false);
      return matchesRole && matchesSearch;
    });
  }, [members, search, roleFilter]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-comic-black">Members</h1>
          <p className="mt-1 text-comic-black/60">
            Everyone who completed profile setup on the public site.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-comic-black/40"
            size={16}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="w-full rounded-xl border-2 border-comic-black py-2 pr-3 pl-9 text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as MemberRole | "all")}
          className="rounded-xl border-2 border-comic-black px-3 py-2 text-sm"
        >
          <option value="all">All roles</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="comic-panel mt-5 overflow-x-auto rounded-2xl bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-comic-black bg-comic-black/5">
              <th className="px-4 py-3 font-bold">Name</th>
              <th className="px-4 py-3 font-bold">Email</th>
              <th className="px-4 py-3 font-bold">Role</th>
              <th className="px-4 py-3 font-bold">Marketing</th>
              <th className="px-4 py-3 font-bold">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-comic-black/50">
                  {members.length === 0 ? "No registered members yet." : "No members match your search."}
                </td>
              </tr>
            )}
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-comic-black/10 last:border-0">
                <td className="px-4 py-3 font-semibold">{m.display_name}</td>
                <td className="px-4 py-3 text-comic-black/70">{m.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge tone="neutral">{ROLE_LABELS[m.role as MemberRole] ?? m.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={m.marketing_opt_in ? "available" : "neutral"}>
                    {m.marketing_opt_in ? "opted in" : "opted out"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-comic-black/60">
                  {new Date(m.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
