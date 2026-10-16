import { notFound } from "next/navigation";
import { TagManageView } from "@/components/TagManageView";
import { requireOwner } from "@/lib/auth/requireOwner";
import { siteUrl } from "@/lib/site";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const owner = await requireOwner();
  const data = owner.openTag((await params).id);
  if (!data) notFound();
  return <TagManageView tag={data.tag} conversations={data.conversations} siteUrl={siteUrl()} />;
}
