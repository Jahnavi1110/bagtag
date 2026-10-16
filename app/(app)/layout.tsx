import { Header } from "@/components/Header";

/** Shared chrome for every page except the full-screen landing page. URLs are unchanged by the (app) group. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </>
  );
}
