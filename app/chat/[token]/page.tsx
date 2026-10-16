import { notFound } from "next/navigation";
import { FinderChatView } from "@/components/FinderChatView";
import { getFinderConversation } from "@/lib/finder";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const conv = getFinderConversation(token);
  if (!conv) notFound();
  return <FinderChatView token={token} tag={conv.tag} messages={conv.messages} />;
}
