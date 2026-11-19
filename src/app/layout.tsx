import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Yaadhum Monitor",
  description: "Employee screen & activity monitoring dashboard — Yaadhum International Technologies",
  icons: {
    icon: "/brand/yaadhum-mark.jpg",
    apple: "/brand/yaadhum-mark.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="min-h-screen font-sans text-cream-100 antialiased">{children}</body>
    </html>
  );
}
