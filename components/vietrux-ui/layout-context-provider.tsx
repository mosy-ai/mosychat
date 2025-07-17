"use client";

import React from "react";
import { useEffect, useState } from "react";
import { UserResponse } from "@/lib/api-client";
import { verifyAndGetMe } from "@/lib/custom-func";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/vietrux-ui/app-sidebar";
import { SiteHeader } from "@/components/vietrux-ui/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { IconLoader2 } from "@tabler/icons-react";

export default function LayoutContextProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await verifyAndGetMe();
        if (!currentUser) {
          throw new Error("User not found");
        }
        setUser(currentUser);
        setLoading(false);
      } catch (error) {}
    };
    getUser();
  }, []);
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user ?? undefined} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {loading ? (
                <div className="flex flex-col items-center pt-20">
                  <IconLoader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  Loading...
                </div>
              ) : (
                children
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
