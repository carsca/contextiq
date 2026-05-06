import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ContextIQ",
  description: "Smart behavior insights and activity tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen font-sans antialiased">
        <div className="flex min-h-screen">
          <Sidebar />

          <main className="relative flex-1 overflow-x-hidden p-6 sm:p-10">
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]">
              <div className="absolute right-0 top-0 h-[420px] w-[420px] translate-x-1/4 -translate-y-1/4 rounded-full bg-cyan-500/20 blur-[100px]" />
              <div className="absolute bottom-0 left-1/3 h-[320px] w-[320px] translate-y-1/3 rounded-full bg-violet-600/15 blur-[90px]" />
            </div>
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}