import { notFound } from "next/navigation";
import { PublicTagView } from "@/components/PublicTagView";
import { viewPublicTag } from "@/lib/finder";

export const dynamic = "force-dynamic"; // count every scan; never cache

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const tag = viewPublicTag((await params).code);
  if (!tag) notFound();
  return <PublicTagView tag={tag} />;
}
