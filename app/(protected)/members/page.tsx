import type { Metadata } from "next";
import { MembersPanel } from "@/components/admin/MembersPanel";
import { getMembers } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Members · Admin" };

export default async function AdminMembersPage() {
  const members = await getMembers();
  return <MembersPanel members={members} />;
}
