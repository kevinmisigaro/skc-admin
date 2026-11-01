"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { ComicButtonAsButton } from "@/components/ui/ComicButton";
import { createClient } from "@/lib/supabase/client";

/**
 * Shown when a Supabase Auth session exists but has no matching
 * admin_profiles row. Never redirect to /login here — the middleware
 * bounces any signed-in user straight back out of /login, so a redirect
 * would just loop between "/" and "/login" forever.
 */
export function NotProvisioned({ email }: { email: string | null }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-comic-black px-4">
      <div className="comic-panel w-full max-w-sm rounded-2xl bg-warm-white p-8 text-center">
        <span className="comic-panel-sm mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-comic-red text-white">
          <ShieldAlert size={26} />
        </span>
        <h1 className="font-display mt-3 text-3xl text-comic-black">Not provisioned</h1>
        <p className="mt-2 text-sm text-comic-black/60">
          {email ?? "This account"} is signed in but isn&apos;t set up as SKC staff yet. Ask a
          platform admin to add you, or run{" "}
          <code className="rounded bg-comic-black/10 px-1">scripts/create-admin.mjs</code>.
        </p>
        <ComicButtonAsButton
          variant="black"
          className="mt-6 w-full"
          onClick={handleSignOut}
        >
          Sign out
        </ComicButtonAsButton>
      </div>
    </div>
  );
}
