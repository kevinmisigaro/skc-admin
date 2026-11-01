import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/auth";

const updateSchema = z.object({
  status: z.enum(["available", "disabled"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  // Guard against flipping a code that's already been redeemed back to
  // "available" — only available <-> disabled transitions are allowed here.
  const { data: current, error: fetchError } = await supabase
    .from("referral_codes")
    .select("status")
    .eq("id", id)
    .single();

  if (fetchError || !current) {
    return NextResponse.json({ error: "Code not found." }, { status: 404 });
  }
  if (current.status === "used") {
    return NextResponse.json(
      { error: "A used code cannot change status." },
      { status: 409 },
    );
  }

  const { data, error } = await supabase
    .from("referral_codes")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
