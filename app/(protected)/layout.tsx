import { getAdminSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { NotProvisioned } from "@/components/admin/NotProvisioned";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // Authenticated via Supabase but not provisioned in admin_profiles — the
  // middleware only checks for *a* session, so this is the actual role
  // gate. The middleware also bounces any signed-in user straight out of
  // /login, so redirecting there from here would just loop forever —
  // render an explicit "not provisioned" screen instead.
  if (!session) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return <NotProvisioned email={user?.email ?? null} />;
  }

  return (
    <div className="flex min-h-screen bg-warm-white">
      <AdminSidebar fullName={session.fullName} role={session.role} />
      <main className="flex-1 overflow-x-hidden p-6 sm:p-8">{children}</main>
    </div>
  );
}
