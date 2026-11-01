import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/auth";

const updateSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().min(1).max(4000).optional(),
  eventDate: z.string().trim().min(1).optional(),
  venue: z.string().trim().min(1).max(200).optional(),
  ticketUrl: z.string().trim().url().nullable().optional().or(z.literal("")),
  coverImage: z.string().trim().max(500).nullable().optional(),
  priceAmount: z.coerce.number().min(0).max(100_000_000).optional(),
  currency: z.string().trim().toUpperCase().length(3).optional(),
  status: z.enum(["upcoming", "past"]).optional(),
  isPublished: z.boolean().optional(),
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

  const d = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .update({
      ...(d.title !== undefined && { title: d.title }),
      ...(d.description !== undefined && { description: d.description }),
      ...(d.eventDate !== undefined && { event_date: d.eventDate }),
      ...(d.venue !== undefined && { venue: d.venue }),
      ...(d.ticketUrl !== undefined && { ticket_url: d.ticketUrl || null }),
      ...(d.coverImage !== undefined && { cover_image: d.coverImage || null }),
      ...(d.priceAmount !== undefined && { price_cents: Math.round(d.priceAmount * 100) }),
      ...(d.currency !== undefined && { currency: d.currency }),
      ...(d.status !== undefined && { status: d.status }),
      ...(d.isPublished !== undefined && { is_published: d.isPublished }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    // 23503 = foreign_key_violation — ticket_orders still references this event.
    if (error.code === "23503") {
      return NextResponse.json(
        { error: "This event has ticket orders and can't be deleted. Unpublish it instead." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
