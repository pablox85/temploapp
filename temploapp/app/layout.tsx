import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const themeScript = `try{const saved=localStorage.getItem("temploapp-theme");const dark=saved?saved==="dark":true;document.documentElement.classList.toggle("dark",dark)}catch{}`;

export const metadata: Metadata = {
  title: { default: "TemploAPP", template: "%s · TemploAPP" },
  description: "Lista colaborativa de ítems, simple y segura.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}<Analytics /></body>
    </html>
  );
}
