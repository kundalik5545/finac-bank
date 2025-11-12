import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function NotFound() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="container mx-auto flex flex-col items-center justify-center h-[700px]">
      <h1 className="text-6xl mb-4 bg-gradient-to-br from-blue-600 to-purple-600 font-extrabold tracking-tighter pr-2 pb-2 text-transparent bg-clip-text">
        404
      </h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-gray-600 dark:text-white/60 mb-8 px-4 md:px-2">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been
        moved.
      </p>
      {session ? (
        <Link href="/dashboard">
          <Button>Return to Dashboard</Button>
        </Link>
      ) : (
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      )}
    </div>
  );
}
