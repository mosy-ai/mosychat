"use client";
import LayoutContextProvider from "@/components/vietrux-ui/layout-context-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LayoutContextProvider>{children}</LayoutContextProvider>
  );
}
