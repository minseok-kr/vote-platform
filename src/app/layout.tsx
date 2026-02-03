import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { ToastProvider } from "@/components/toast";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "VOTE - 심플 투표 플랫폼",
    template: "%s | VOTE",
  },
  description: "누구나 쉽게 참여할 수 있는 익명 투표 플랫폼. 투표를 만들고, 의견을 공유하세요.",
  keywords: ["투표", "설문조사", "poll", "vote", "익명 투표"],
  authors: [{ name: "VOTE" }],
  creator: "VOTE",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://vote.example.com",
    siteName: "VOTE",
    title: "VOTE - 심플 투표 플랫폼",
    description: "누구나 쉽게 참여할 수 있는 익명 투표 플랫폼",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VOTE - 심플 투표 플랫폼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VOTE - 심플 투표 플랫폼",
    description: "누구나 쉽게 참여할 수 있는 익명 투표 플랫폼",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} ${cormorant.variable} antialiased`}>
        <ToastProvider>
          <KeyboardShortcutsProvider>{children}</KeyboardShortcutsProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
