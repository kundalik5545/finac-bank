"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DollarSign,
  LayoutDashboard,
  BarChart,
  File,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { NavUser } from "./NavUser";
import { NavMain } from "./NavMain";

export function AppSidebar() {
  const data = {
    user: {
      name: "Kundalik Jadhav",
      email: "jk@fm.com",
      avatar: "https://avatars.githubusercontent.com/u/167022612",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Add Bank",
        url: "/add-bank",
        icon: Plus,
      },
      {
        title: "Transactions",
        url: "/transactions",
        icon: BarChart,
      },
      {
        title: "File Handle",
        url: "/file-handle",
        icon: File,
      },
    ],
  };
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                {/* Icon logo */}
                <DollarSign size="16" />
                {/* App Name */}
                <span className="text-base font-semibold">Acme Inc.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
