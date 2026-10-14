import type { Metadata } from "next";
import { Geist, Geist_Mono, Public_Sans, Noto_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/provider/theme-provider";
import { QueryProvider } from "@/components/provider/query-provider";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const geistMonoHeading = Geist_Mono({subsets:['latin'],variable:'--font-heading'});

const publicSans = Public_Sans({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QueryPad - AI Workspace & Learning Tools",
  description: "AI-powered workspace for learning, research reports, flashcards, mind maps, and interactive quizzes.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, publicSans.variable, "font-mono", jetbrainsMono.variable, geistMonoHeading.variable)}
    >
      <body className="min-h-full flex flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>{children}</QueryProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
