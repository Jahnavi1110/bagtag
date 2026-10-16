import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { logout } from "@/lib/actions/auth";
import { Wordmark } from "./brand/Wordmark";

export async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="border-b border-ink/10 bg-canvas">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" aria-label="Tagback home" className="text-ink">
          <Wordmark className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <Link href="/tags/new" className="hover:underline">New tag</Link>
              <span className="hidden text-muted sm:inline">{user.email}</span>
              <form action={logout}>
                <button className="text-muted hover:underline">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">Log in</Link>
              <Link href="/signup" className="rounded-[100px] bg-ink px-4 py-1.5 text-canvas hover:bg-ink/85">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
