import { AuthForm } from "@/components/forms/AuthForm";

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return <AuthForm mode="login" next={(await searchParams).next} />;
}
