"use client";

import React from "react";
import { Button } from "../ui/button";
import ModeToggle from "./ModeToggle";
import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Bell, LogOut, Settings2, User2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { websiteDetails } from "@/data/website";
import { authClient } from "@/lib/auth-client";

const Navbar = () => {
  const isMobile = useIsMobile();

  const user = {
    name: "Kundalik Jadhav",
    email: "jk@fm.com",
    avatar: "https://avatars.githubusercontent.com/u/167022612",
  };
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{websiteDetails.websiteName}</h1>

        {/* Right Side */}
        <div className="ml-auto flex items-center gap-2">
          {/* Notification Icon, Dark Mode Icon,User Icon */}
          <section className="flex items-center">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => alert("You have 5 Notification pending.")}
            >
              <Bell />
            </Button>

            {/* Theme Toggle */}
            <ModeToggle />

            {/* User detail */}

            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="icon"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-lg grayscale">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="rounded-lg">
                          CN
                        </AvatarFallback>
                      </Avatar>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                    side={isMobile ? "bottom" : "top"}
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="rounded-lg">
                            JK
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-medium">
                            {user.name}
                          </span>
                          <span className="text-muted-foreground truncate text-xs">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <User2 />
                        Account
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings2 />
                        Setting
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Bell />
                        Notifications
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      <Button
                        variant="ghost"
                        onClick={() => authClient.signOut()}
                      >
                        <LogOut /> Log out
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </section>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
