import { TagForm } from "@/components/forms/TagForm";
import { requireOwner } from "@/lib/auth/requireOwner";
import { siteUrl } from "@/lib/site";

export default async function Page() {
  await requireOwner();
  return <TagForm siteUrl={siteUrl()} />;
}
