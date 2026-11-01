import type { Metadata } from "next";
import { CodesPanel } from "@/components/admin/CodesPanel";
import { getReferralCodesWithInfluencer, getInfluencers } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Referral Codes · Admin" };

export default async function AdminCodesPage() {
  const [codes, influencers] = await Promise.all([
    getReferralCodesWithInfluencer(),
    getInfluencers(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <CodesPanel codes={codes as any} influencers={influencers} />;
}
