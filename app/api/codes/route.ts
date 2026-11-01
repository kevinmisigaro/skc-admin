import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/auth";
import { generateReferralCode } from "@/lib/codes";

const createSchema = z.object({
  influencerId: z.uuid(),
  influencerName: z.string().trim().min(1),
  count: z.coerce.number().int().min(1).max(100),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  commissionPercent: z.coerce.number().min(0).max(100).optional(),
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

  const { influencerId, influencerName, count, discountPercent, commissionPercent } = parsed.data;
  const supabase = await createClient();

  const created: { id: string; code: string }[] = [];
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    while (attempts < 5) {
      attempts++;
      const code = generateReferralCode(influencerName);
      const { data, error } = await supabase
        .from("referral_codes")
        .insert({
          code,
          influencer_id: influencerId,
          created_by: session.id,
          ...(discountPercent !== undefined && { discount_percent: discountPercent }),
          ...(commissionPercent !== undefined && { commission_percent: commissionPercent }),
        })
        .select("id, code")
        .single();

      if (!error && data) {
        created.push(data);
        break;
      }
      // 23505 = unique_violation on `code` — regenerate and retry.
      if (error && error.code !== "23505") {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
  }

  return NextResponse.json({ created }, { status: 201 });
}
