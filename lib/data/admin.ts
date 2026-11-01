import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  totalInfluencers: number;
  activeInfluencers: number;
  totalCodes: number;
  availableCodes: number;
  usedCodes: number;
  disabledCodes: number;
  totalOrders: number;
  paidOrders: number;
  totalEvents: number;
  publishedEvents: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [
    influencers,
    activeInfluencers,
    codes,
    available,
    used,
    disabled,
    orders,
    paidOrders,
    events,
    publishedEvents,
  ] = await Promise.all([
    supabase.from("influencers").select("id", { count: "exact", head: true }),
    supabase
      .from("influencers")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("referral_codes").select("id", { count: "exact", head: true }),
    supabase
      .from("referral_codes")
      .select("id", { count: "exact", head: true })
      .eq("status", "available"),
    supabase
      .from("referral_codes")
      .select("id", { count: "exact", head: true })
      .eq("status", "used"),
    supabase
      .from("referral_codes")
      .select("id", { count: "exact", head: true })
      .eq("status", "disabled"),
    supabase.from("ticket_orders").select("id", { count: "exact", head: true }),
    supabase
      .from("ticket_orders")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "paid"),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
  ]);

  return {
    totalInfluencers: influencers.count ?? 0,
    activeInfluencers: activeInfluencers.count ?? 0,
    totalCodes: codes.count ?? 0,
    availableCodes: available.count ?? 0,
    usedCodes: used.count ?? 0,
    disabledCodes: disabled.count ?? 0,
    totalOrders: orders.count ?? 0,
    paidOrders: paidOrders.count ?? 0,
    totalEvents: events.count ?? 0,
    publishedEvents: publishedEvents.count ?? 0,
  };
}

export async function getInfluencers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("influencers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getReferralCodesWithInfluencer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("referral_codes")
    .select("*, influencers(display_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getTicketOrdersWithDetail() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ticket_orders")
    .select("*, events(title), referral_codes(code, influencers(display_name))")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getEvents() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });
  if (error) throw error;
  return data;
}
