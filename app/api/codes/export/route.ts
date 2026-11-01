import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/auth";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = await createClient();
  // Codes are reusable discount codes now (0003_ticket_purchases.sql), so a
  // code can have many ticket_orders — one CSV row per order, with a
  // blank-order row for codes that haven't been used yet.
  const { data, error } = await supabase
    .from("referral_codes")
    .select(
      "code, status, discount_percent, commission_percent, created_at, influencers(display_name), ticket_orders(buyer_name, buyer_email, total_cents, currency, payment_status, created_at)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const rows = [
    [
      "code",
      "status",
      "discount_percent",
      "commission_percent",
      "influencer",
      "created_at",
      "order_created_at",
      "buyer_name",
      "buyer_email",
      "total",
      "currency",
      "payment_status",
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(data as any[]).flatMap((row) => {
      const base = [
        row.code,
        row.status,
        row.discount_percent,
        row.commission_percent,
        row.influencers?.display_name ?? "",
        row.created_at,
      ];
      const orders = row.ticket_orders ?? [];
      if (orders.length === 0) {
        return [[...base, "", "", "", "", ""]];
      }
      return orders.map((order: Record<string, unknown>) => [
        ...base,
        order.created_at,
        order.buyer_name,
        order.buyer_email,
        order.total_cents != null ? (Number(order.total_cents) / 100).toFixed(2) : "",
        order.currency ?? "",
        order.payment_status ?? "",
      ]);
    }),
  ];

  const csv = rows
    .map((r) => r.map((cell: unknown) => csvEscape(String(cell ?? ""))).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="skc-referral-codes-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
