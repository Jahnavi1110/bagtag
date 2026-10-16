import { PrintSheet } from "@/components/PrintSheet";
import { requireOwner } from "@/lib/auth/requireOwner";
import { siteUrl } from "@/lib/site";

export default async function Page() {
  const owner = await requireOwner();
  return <PrintSheet tags={owner.listTags()} siteUrl={siteUrl()} />;
}
