import { AppSidebar } from "@/components/AppLayout/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import Navbar from "@/components/AppLayout/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { headers } from "next/headers";

export async function ConditionalLayout({ children }) {
  // Get the pathname from the request headers (works on server)
  const path =
    headers().get("x-invoke-path") || headers().get("x-pathname") || "";
  let pathname = path || "/";

  // Fallback for edge/renderPathHeader
  if (!pathname || pathname === "[[...path]]") {
    // Try parsing from referer or fallback to "/"
    pathname =
      headers()
        .get("referer")
        ?.replace(/^https?:\/\/[^/]+/, "") || "/";
  }

  const isAuthRoute =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  const isHomePage = pathname === "/";

  if (isAuthRoute || isHomePage) {
    return (
      <>
        <Toaster />
        {children}
      </>
    );
  }

  return (
    <>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Navbar />
        <Toaster />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
