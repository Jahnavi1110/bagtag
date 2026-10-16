import { notFound } from "next/navigation";
import { TagForm } from "@/components/forms/TagForm";
import { requireOwner } from "@/lib/auth/requireOwner";
import { siteUrl } from "@/lib/site";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const owner = await requireOwner();
  const tag = owner.getTag((await params).id);
  if (!tag) notFound();
  return <TagForm tag={tag} siteUrl={siteUrl()} />;
}
