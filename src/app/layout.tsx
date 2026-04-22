import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
      <body className="min-h-screen bg-gray-100">
        <div className="flex min-h-screen">
          
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r p-6">
            <h1 className="text-2xl font-bold mb-8">ContextIQ</h1>

            <nav className="flex flex-col gap-4">
              <Link href="/dashboard" className="hover:font-semibold">
                Dashboard
              </Link>

              <Link href="/log" className="hover:font-semibold">
                Activity Log
              </Link>

              <Link href="/suggestions" className="hover:font-semibold">
                Suggestions
              </Link>

              <Link href="/settings" className="hover:font-semibold">
                Settings
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}