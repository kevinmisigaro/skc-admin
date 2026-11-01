// Creates the first SKC admin user: a Supabase Auth account + its
// admin_profiles row. Run once per staff member you want to provision.
//
//   node --env-file=.env.local scripts/create-admin.mjs "you@skc.com" "a-strong-password" "Your Name" platform_admin
//
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.

import { createClient } from "@supabase/supabase-js";

const [, , email, password, fullName, role = "platform_admin"] = process.argv;

if (!email || !password || !fullName) {
  console.error(
    'Usage: node --env-file=.env.local scripts/create-admin.mjs "<email>" "<password>" "<full name>" [role]',
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: userData, error: userError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (userError) {
  console.error("Failed to create auth user:", userError.message);
  process.exit(1);
}

const { error: profileError } = await supabase.from("admin_profiles").insert({
  id: userData.user.id,
  full_name: fullName,
  role,
});

if (profileError) {
  console.error("Auth user created, but admin_profiles insert failed:", profileError.message);
  console.error(`You can insert it manually: id=${userData.user.id}`);
  process.exit(1);
}

console.log(`Admin created: ${email} (${role}). They can now sign in at /admin/login.`);
