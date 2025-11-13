"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain({ items }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupLabel
        className={cn(
          "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3",
          !isMobile ? "text-center" : ""
        )}
      >
        {!isMobile ? "Navigation" : "•••"}
      </SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu className="space-y-2">
          {items.map((item) => {
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} asChild>
                  <Link
                    href={item.url}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600 hover:scale-105 dark:text-white"
                    )}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
