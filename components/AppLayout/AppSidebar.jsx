"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { websiteDetails } from "@/data/website";
import {
  ArrowUpDown,
  BanknoteIcon,
  Calendar,
  DollarSign,
  Download,
  LayoutDashboard,
  List,
  Search,
  Settings,
  Tags,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { NavMain } from "./NavMain";
import { NavUser } from "./NavUser";

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
        title: "Transactions",
        url: "/transactions",
        icon: ArrowUpDown,
      },
      {
        title: "Bank Accounts",
        url: "/bank-account",
        icon: BanknoteIcon,
      },
      {
        title: "Categories",
        url: "/categories",
        icon: Tags,
      },
      {
        title: "To Do List",
        url: "/todo",
        icon: List,
      },
      {
        title: "Bulk Upload",
        url: "/bulk-upload",
        icon: Upload,
      },
      {
        title: "Download Reports",
        url: "/download-reports",
        icon: Download,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  };

  const navQuick = [
    {
      title: "Search Transactions",
      url: "/search-transactions",
      icon: Search,
    },
    {
      title: "Schedule Transactions",
      url: "/schedule-transactions",
      icon: Calendar,
    },
  ];

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
                <span className="sr-only">Website Logo</span>
                {/* App Name */}
                <span className="text-base font-semibold">
                  {websiteDetails.websiteName}.
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} navQuick={navQuick} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
