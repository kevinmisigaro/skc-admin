import type { Metadata } from "next";
import { RedemptionsPanel } from "@/components/admin/RedemptionsPanel";
import { getTicketOrdersWithDetail } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Ticket Orders · Admin" };

export default async function AdminRedemptionsPage() {
  const orders = await getTicketOrdersWithDetail();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <RedemptionsPanel orders={orders as any} />;
}
