import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { logout } from "@/lib/actions/auth";

export async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-blue-700">
          Tagback
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <Link href="/tags/new" className="hover:underline">New tag</Link>
              <span className="hidden text-gray-500 sm:inline">{user.email}</span>
              <form action={logout}>
                <button className="text-gray-600 hover:underline">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">Log in</Link>
              <Link href="/signup" className="rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
