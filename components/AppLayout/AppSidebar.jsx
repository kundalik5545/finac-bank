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
  Wallet,
  TrendingUp,
  Target,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { NavMain } from "./NavMain";
import { NavUser } from "./NavUser";
import { useEffect, useState } from "react";

export function AppSidebar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          console.error("Failed to fetch user");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const data = {
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
        title: "Budgets",
        url: "/budgets",
        icon: Wallet,
      },
      {
        title: "Recurring Transactions",
        url: "/recurring-transactions",
        icon: Calendar,
      },
      {
        title: "Investments",
        url: "/investments",
        icon: TrendingUp,
      },
      {
        title: "Investment Analytics",
        url: "/investments/analytics",
        icon: TrendingUp,
      },
      {
        title: "Goals",
        url: "/investments/goals",
        icon: Target,
      },
      {
        title: "Assets",
        url: "/assets",
        icon: Building2,
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
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
