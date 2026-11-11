import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PayAgent - AI Shopping Assistant",
  description:
    "An intelligent AI shopping agent that helps you discover products, compare options, and checkout securely with PayPal. Built for the PayPal AI Hackathon 2026.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛒</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var t = localStorage.getItem("payagent_theme");
                if (t === "light" || t === "dark") {
                  document.documentElement.classList.remove("light", "dark");
                  document.documentElement.classList.add(t);
                } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
                  document.documentElement.classList.remove("light", "dark");
                  document.documentElement.classList.add("light");
                }
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-[#ebedfb] transition-colors duration-200`}
      >
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
