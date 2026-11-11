import type { Metadata } from "next";
import Link from "next/link";
import { Users, Ticket, CheckCircle2, CalendarDays, IdCard } from "lucide-react";
import { getDashboardStats } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Admin Overview" };

export default async function AdminOverviewPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      label: "Events",
      value: stats.totalEvents,
      sub: `${stats.publishedEvents} published`,
      icon: CalendarDays,
      color: "bg-action-orange",
      href: "/events",
    },
    {
      label: "Members",
      value: stats.totalMembers,
      sub: "Registered on the site",
      icon: IdCard,
      color: "bg-comic-red",
      href: "/members",
    },
    {
      label: "Influencers",
      value: stats.totalInfluencers,
      sub: `${stats.activeInfluencers} active`,
      icon: Users,
      color: "bg-sky-blue",
      href: "/influencers",
    },
    {
      label: "Referral codes",
      value: stats.totalCodes,
      sub: `${stats.availableCodes} available`,
      icon: Ticket,
      color: "bg-golden-orange",
      href: "/codes",
    },
    {
      label: "Ticket orders",
      value: stats.totalOrders,
      sub: `${stats.paidOrders} paid`,
      icon: CheckCircle2,
      color: "bg-hero-green",
      href: "/redemptions",
    },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl text-comic-black">Overview</h1>
      <p className="mt-1 text-comic-black/60">
        Referral-code pilot status for SKC Reloaded / Tanzanite.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, sub, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="comic-panel rounded-2xl bg-white p-5 transition-transform hover:-translate-y-0.5"
          >
            <span className={`comic-panel-sm flex h-10 w-10 items-center justify-center rounded-full ${color} text-white`}>
              <Icon size={18} />
            </span>
            <p className="mt-4 font-display text-4xl text-comic-black">{value}</p>
            <p className="text-sm font-bold text-comic-black/70">{label}</p>
            <p className="mt-0.5 text-xs text-comic-black/50">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="comic-panel mt-10 rounded-2xl bg-white p-6">
        <h2 className="font-display text-2xl text-comic-black">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/events"
            className="comic-panel-sm rounded-full bg-action-orange px-5 py-2.5 text-sm font-bold text-white"
          >
            + Add event
          </Link>
          <Link
            href="/influencers"
            className="comic-panel-sm rounded-full bg-sky-blue px-5 py-2.5 text-sm font-bold text-white"
          >
            + Add influencer
          </Link>
          <Link
            href="/codes"
            className="comic-panel-sm rounded-full bg-golden-orange px-5 py-2.5 text-sm font-bold text-white"
          >
            + Generate codes
          </Link>
          <Link
            href="/codes"
            className="comic-panel-sm rounded-full bg-comic-black px-5 py-2.5 text-sm font-bold text-white"
          >
            Export CSV
          </Link>
        </div>
      </div>
    </div>
  );
}
