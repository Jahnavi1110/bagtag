import { DashboardView } from "@/components/DashboardView";
import { requireOwner } from "@/lib/auth/requireOwner";

export default async function Page() {
  const owner = await requireOwner();
  return <DashboardView tags={owner.listTags()} />;
}
