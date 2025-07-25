"use client";
import * as React from "react";
import {
  IconMessage2,
  IconDatabase,
  IconUsersGroup,
  IconUsers,
  IconRobot,
  IconHeart
} from "@tabler/icons-react";
import { NavAdminPanel } from "@/components/mosy-ui/nav-admin";
import { NavMain } from "@/components/mosy-ui/nav-main";
import { NavUser } from "@/components/mosy-ui/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserResponse } from "@/lib/api-client";
import Image from "next/image";
const data = {
  navMain: [
    {
      name: "Chat Mosy",
      url: "/dashboard",
      icon: IconMessage2,
    },
    {
      name: "Knowledge Base",
      url: "/dashboard/knowledge-base",
      icon: IconDatabase,
    },
  ],
  adminPanel: [
    {
      name: "Agents",
      url: "/dashboard/agents",
      icon: IconRobot,
    },
    {
      name: "Users",
      url: "/dashboard/users",
      icon: IconUsers,
    },
    {
      name: "Groups",
      url: "/dashboard/groups",
      icon: IconUsersGroup,
    },
    {
      name: "Feedback",
      url: "/dashboard/feedbacks",
      icon: IconHeart,
    },
  ],
};
export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user?: UserResponse }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <Image
                  src="/Mosy-Light.png"
                  alt="Logo"
                  width={32}
                  height={32}
                />
                <span className="text-base font-semibold">Mosy Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavAdminPanel items={data.adminPanel} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user as { name: string; email: string }} />
      </SidebarFooter>
    </Sidebar>
  );
}
