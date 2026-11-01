import type { Metadata } from "next";
import { EventsPanel } from "@/components/admin/EventsPanel";
import { getEvents } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Events · Admin" };

export default async function AdminEventsPage() {
  const events = await getEvents();
  return <EventsPanel events={events} />;
}
