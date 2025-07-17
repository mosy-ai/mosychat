"use client";
import * as React from "react";
import {
  IconMessage2,
  IconDatabase,
  IconInnerShadowTop,
  IconUsersGroup,
  IconUsers,
} from "@tabler/icons-react";
import { NavAdminPanel } from "@/components/vietrux-ui/nav-admin";
import { NavMain } from "@/components/vietrux-ui/nav-main";
import { NavUser } from "@/components/vietrux-ui/nav-user";
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
const data = {
  navMain: [
    {
      name: "Chat Mosy",
      url: "/test/dashboard",
      icon: IconMessage2,
    },
    {
      name: "Knowledge Base",
      url: "/test/dashboard/knowledge-base",
      icon: IconDatabase,
    },
  ],
  adminPanel: [
    {
      name: "Agents",
      url: "/test/dashboard/agents",
      icon: IconDatabase,
    },
    {
      name: "Knowledge Base", 
      url: "/test/dashboard/knowledge-base",
      icon: IconDatabase,
    },
    {
      name: "Users",
      url: "/test/dashboard/users",
      icon: IconUsers,
    },
    {
        name: "Groups",
        url: "/test/dashboard/groups",
        icon: IconUsersGroup,
    }
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
                <IconInnerShadowTop className="!size-5" />
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
        <NavUser user={user as {name: string, email:string}} />
      </SidebarFooter>
    </Sidebar>
  );
}
