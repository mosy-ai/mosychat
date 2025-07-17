import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { AppSidebar } from "@/components/vietrux-ui/app-sidebar";
// import { ChartAreaInteractive } from "@/components/vietrux-ui/chart-area-interactive"
// import { SectionCards } from "@/components/vietrux-ui/section-cards"
import { SiteHeader } from "@/components/vietrux-ui/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import LayoutContextProvider from "@/components/vietrux-ui/layout-context-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChatMosy",
  description:
    "MosyAI helps you get answers, find inspiration and be more productive. It is free to use and easy to try. Just ask and ChatMosyAI can help with writing, learning, brainstorming and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutContextProvider>{children}</LayoutContextProvider>
      </body>
    </html>
  );
}
