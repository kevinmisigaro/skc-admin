import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/auth";

const updateSchema = z.object({
  status: z.enum(["active", "inactive"]).optional(),
  displayName: z.string().trim().min(2).max(120).optional(),
  contact: z.string().trim().max(200).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
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
  const { data, error } = await supabase
    .from("influencers")
    .update({
      ...(parsed.data.status && { status: parsed.data.status }),
      ...(parsed.data.displayName && { display_name: parsed.data.displayName }),
      ...(parsed.data.contact !== undefined && { contact: parsed.data.contact }),
      ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
