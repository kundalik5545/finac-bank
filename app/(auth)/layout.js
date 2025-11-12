import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
