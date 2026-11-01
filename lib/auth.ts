import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/types/database";

export interface AdminSession {
  id: string;
  email: string | null;
  fullName: string;
  role: AdminRole;
}

/** Returns the signed-in staff member's profile, or null if unauthenticated or not provisioned as admin. */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    fullName: profile.full_name,
    role: profile.role,
  };
}
