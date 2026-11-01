import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const createSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(160).optional().or(z.literal("")),
  description: z.string().trim().min(1).max(4000),
  eventDate: z.string().trim().min(1),
  venue: z.string().trim().min(1).max(200),
  ticketUrl: z.string().trim().url().optional().or(z.literal("")),
  coverImage: z.string().trim().max(500).optional().or(z.literal("")),
  priceAmount: z.coerce.number().min(0).max(100_000_000).optional(),
  currency: z.string().trim().toUpperCase().length(3).optional().or(z.literal("")),
  status: z.enum(["upcoming", "past"]).optional(),
  isPublished: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const baseSlug = slugify(data.slug || data.title);
  const supabase = await createClient();

  let slug = baseSlug;
  let attempts = 0;
  let insertError: { code?: string; message: string } | null = null;
  let created: Record<string, unknown> | null = null;

  while (attempts < 5) {
    attempts++;
    const { data: row, error } = await supabase
      .from("events")
      .insert({
        slug,
        title: data.title,
        description: data.description,
        event_date: data.eventDate,
        venue: data.venue,
        ticket_url: data.ticketUrl || null,
        cover_image: data.coverImage || null,
        price_cents: data.priceAmount != null ? Math.round(data.priceAmount * 100) : 0,
        currency: data.currency || "TZS",
        status: data.status ?? "upcoming",
        is_published: data.isPublished ?? true,
      })
      .select()
      .single();

    if (!error && row) {
      created = row;
      break;
    }
    insertError = error;
    // 23505 = unique_violation on `slug` — append a short suffix and retry.
    if (error?.code === "23505") {
      slug = `${baseSlug}-${attempts}`;
      continue;
    }
    break;
  }

  if (!created) {
    return NextResponse.json(
      { error: insertError?.message ?? "Could not create event." },
      { status: 400 },
    );
  }

  return NextResponse.json(created, { status: 201 });
}
