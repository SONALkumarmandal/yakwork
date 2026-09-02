import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Yakwork — Find your next open-source contribution",
  description: "Matched open-source issues and repositories based on your GitHub profile or preferences.",
  other: {
    "color-scheme": "light",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased selection:bg-gold/20 selection:text-gold-ink">
        <Navbar />
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}

