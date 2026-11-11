"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { ComicButtonAsButton } from "@/components/ui/ComicButton";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Incorrect email or password.");
        setLoading(false);
        return;
      }

      const next = searchParams.get("next") ?? "/";
      router.push(next);
      router.refresh();
    } catch {
      setError(
        "Sign-in isn't available yet — Supabase hasn't been connected. See the README for setup steps.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-comic-black px-4">
      <form
        onSubmit={handleSubmit}
        className="comic-panel w-full max-w-sm rounded-2xl bg-warm-white p-8"
      >
        <div className="flex flex-col items-center text-center">
          <span className="comic-panel-sm flex h-14 w-14 items-center justify-center rounded-full bg-comic-red text-white">
            <ShieldCheck size={26} />
          </span>
          <h1 className="font-display mt-3 text-3xl text-comic-black">Staff Login</h1>
          <p className="mt-1 text-sm text-comic-black/60">
            Swahili Komik Con admin dashboard
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-bold text-comic-black">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border-2 border-comic-black px-4 py-3 focus:ring-4 focus:ring-golden-orange/40 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-bold text-comic-black">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border-2 border-comic-black px-4 py-3 pr-11 focus:ring-4 focus:ring-golden-orange/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-comic-black/60 hover:text-comic-black"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm font-semibold text-comic-red">{error}</p>}
          <ComicButtonAsButton type="submit" variant="red" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign in"}
          </ComicButtonAsButton>
        </div>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
