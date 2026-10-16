import Link from "next/link";
import { card } from "./ui";

export function NotFoundView({ title, body }: { title: string; body: string }) {
  return (
    <div className={`${card} mx-auto mt-12 max-w-md text-center`}>
      <div className="text-5xl font-bold text-gray-300">404</div>
      <h1 className="mt-2 text-xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-gray-600">{body}</p>
      <Link href="/" className="mt-4 inline-block text-sm text-blue-700 underline">Go to Tagback</Link>
    </div>
  );
}
