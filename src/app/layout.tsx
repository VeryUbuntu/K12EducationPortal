import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { PageTracker } from "@/components/PageTracker";
import "./globals.css";
export const metadata: Metadata = {
  title: "SXU.com - K12 Education Portal",
  description: "Personal education portal for Chinese K-12 students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className="font-sans antialiased flex flex-col min-h-screen bg-slate-50 text-slate-900">
        <PageTracker />
        <Navbar />
        <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
