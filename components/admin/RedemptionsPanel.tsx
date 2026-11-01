"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface OrderRow {
  id: string;
  buyer_name: string;
  buyer_email: string;
  confirmation_ref: string;
  total_cents: number;
  currency: string;
  payment_status: "pending" | "paid" | "failed" | "cancelled";
  email_status: "pending" | "sent" | "failed";
  created_at: string;
  events: { title: string } | null;
  referral_codes: { code: string; influencers: { display_name: string } | null } | null;
}

function formatMoney(cents: number, currency: string) {
  return `${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export function RedemptionsPanel({ orders }: { orders: OrderRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      [
        o.buyer_name,
        o.buyer_email,
        o.confirmation_ref,
        o.events?.title,
        o.referral_codes?.code,
        o.referral_codes?.influencers?.display_name,
      ]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
    );
  }, [orders, search]);

  return (
    <div>
      <h1 className="font-display text-4xl text-comic-black">Ticket Orders</h1>
      <p className="mt-1 text-comic-black/60">
        Every ticket purchase intent, with referral discount and payment status.
      </p>

      <div className="relative mt-6 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-comic-black/40" size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search buyer, code, influencer..."
          className="w-full rounded-xl border-2 border-comic-black py-2 pr-3 pl-9 text-sm"
        />
      </div>

      <div className="comic-panel mt-5 overflow-x-auto rounded-2xl bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-comic-black bg-comic-black/5">
              <th className="px-4 py-3 font-bold">Buyer</th>
              <th className="px-4 py-3 font-bold">Event</th>
              <th className="px-4 py-3 font-bold">Code</th>
              <th className="px-4 py-3 font-bold">Influencer</th>
              <th className="px-4 py-3 font-bold">Total</th>
              <th className="px-4 py-3 font-bold">Payment</th>
              <th className="px-4 py-3 font-bold">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-comic-black/50">
                  No ticket orders yet.
                </td>
              </tr>
            )}
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-comic-black/10 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-semibold">{o.buyer_name}</p>
                  <p className="text-xs text-comic-black/50">{o.buyer_email}</p>
                  <p className="font-mono text-xs text-comic-black/40">{o.confirmation_ref}</p>
                </td>
                <td className="px-4 py-3">{o.events?.title ?? "—"}</td>
                <td className="px-4 py-3 font-mono">{o.referral_codes?.code ?? "—"}</td>
                <td className="px-4 py-3">{o.referral_codes?.influencers?.display_name ?? "—"}</td>
                <td className="px-4 py-3 font-semibold">{formatMoney(o.total_cents, o.currency)}</td>
                <td className="px-4 py-3">
                  <Badge
                    tone={
                      o.payment_status === "paid"
                        ? "available"
                        : o.payment_status === "failed" || o.payment_status === "cancelled"
                          ? "disabled"
                          : "neutral"
                    }
                  >
                    {o.payment_status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-comic-black/60">
                  {new Date(o.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
