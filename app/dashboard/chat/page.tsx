"use client";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useEffect, useState } from "react";

import { UserResponse } from "@/lib/api-client";
import { verifyAndGetMe } from "@/lib/custom-func";

import { ThreadList } from "@/components/thread-list";
import { Thread } from "@/components/thread";
import { MyRuntimeProvider } from "@/components/assistannt-ui-runtime/MyRuntimeProvider";

export default function Dashboard() {
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await verifyAndGetMe();
        if (!currentUser) {
          throw new Error("User not found");
        }
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to get user:", error);
      }
    };
    getUser();
  }, []);

  return (
    <DashboardLayout>
      <MyRuntimeProvider>
        <div className="grid h-[85vh] grid-cols-[200px_1fr]">
          <ThreadList />
          <Thread />
        </div>
      </MyRuntimeProvider>
    </DashboardLayout>
  );
}
