import { auth } from "@/lib/auth";
import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/AppLayout/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import Navbar from "@/components/AppLayout/Navbar";
import { Toaster } from "@/components/ui/sonner";

export default async function MainLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Navbar />
        <Toaster />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="container mx-auto flex px-2 md:px-4 lg:px-0 pt-4">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
