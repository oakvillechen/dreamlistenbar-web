import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/lib/PlayerContext";
import { UserProvider } from "@/lib/UserContext";
import GlobalPlayer from "@/components/GlobalPlayer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DreamListenBar - 有声小说",
  description: "DreamListenBar - 有声小说播放应用",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DreamListenBar",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f0f1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        <UserProvider>
          <PlayerProvider>
            {children}
            <GlobalPlayer />
          </PlayerProvider>
        </UserProvider>
      </body>
    </html>
  );
}
