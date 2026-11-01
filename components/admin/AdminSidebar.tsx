"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Ticket,
  ClipboardList,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/influencers", label: "Influencers", icon: Users },
  { href: "/codes", label: "Referral Codes", icon: Ticket },
  { href: "/redemptions", label: "Ticket Orders", icon: ClipboardList },
];

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3202";

export function AdminSidebar({
  fullName,
  role,
}: {
  fullName: string;
  role: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r-4 border-comic-black bg-comic-black text-warm-white">
      <div className="border-b border-white/15 p-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="comic-panel-sm flex h-9 w-9 items-center justify-center rounded-full bg-comic-red font-display text-lg text-white">
            S
          </span>
          <span className="font-display text-xl">SKC Admin</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active ? "bg-comic-red text-white" : "text-warm-white/80 hover:bg-white/10",
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/15 p-4">
        {/* External site on a different origin, so a plain <a> is correct here. */}
        <a
          href={WEBSITE_URL}
          className="mb-3 flex items-center gap-2 text-xs font-semibold text-warm-white/60 hover:text-warm-white"
        >
          <ExternalLink size={14} /> View public site
        </a>
        <div className="mb-2">
          <p className="text-sm font-bold">{fullName}</p>
          <p className="text-xs text-warm-white/60 capitalize">{role.replace("_", " ")}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}
