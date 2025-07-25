"use client";

import React, { createContext, useContext } from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserResponse } from "@/lib/api-client";
import { verifyAndGetMe } from "@/lib/custom-func";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/mosy-ui/app-sidebar";
import { SiteHeader } from "@/components/mosy-ui/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { IconLoader2 } from "@tabler/icons-react";

// Create Auth Context
interface AuthContextType {
  user: UserResponse | null;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/'];

export default function LayoutContextProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  const logout = () => {
    setUser(null);
    // Clear any stored tokens/cookies here
    localStorage.removeItem('token'); // or however you store auth tokens
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      setLoading(true);
      const currentUser = await verifyAndGetMe();
      if (!currentUser) {
        throw new Error("User not found");
      }
      setUser(currentUser);
      setAuthError(null);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
      setAuthError(error instanceof Error ? error.message : "Authentication failed");
      
      // Only redirect to login if we're not already on a public route
      if (!isPublicRoute) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const currentUser = await verifyAndGetMe();
        if (!currentUser) {
          throw new Error("User not found");
        }
        setUser(currentUser);
        setAuthError(null);
        
        // If user is authenticated and on a public route, redirect to dashboard/home
        if (isPublicRoute && pathname !== '/') {
          router.push('/dashboard'); // or your default authenticated route
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setUser(null);
        setAuthError(error instanceof Error ? error.message : "Authentication failed");
        
        // Only redirect to login if we're not already on a public route
        if (!isPublicRoute) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [pathname, router, isPublicRoute]);

  // If we're on a public route and don't need the sidebar layout
  if (isPublicRoute) {
    return (
      <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <IconLoader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : (
          children
        )}
      </AuthContext.Provider>
    );
  }

  // For protected routes, show the full sidebar layout
  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
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
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                ) : authError ? (
                  <div className="flex flex-col items-center pt-20">
                    <div className="text-center">
                      <p className="text-destructive mb-4">Authentication Error</p>
                      <p className="text-sm text-muted-foreground mb-4">{authError}</p>
                      <button 
                        onClick={() => router.push('/login')}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                      >
                        Go to Login
                      </button>
                    </div>
                  </div>
                ) : user ? (
                  children
                ) : (
                  <div className="flex flex-col items-center pt-20">
                    <p className="text-muted-foreground">No user found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthContext.Provider>
  );
}