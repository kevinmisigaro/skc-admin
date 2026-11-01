import type { Metadata } from "next";
import { InfluencersPanel } from "@/components/admin/InfluencersPanel";
import { getInfluencers } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Influencers · Admin" };

export default async function AdminInfluencersPage() {
  const influencers = await getInfluencers();
  return <InfluencersPanel influencers={influencers} />;
}
