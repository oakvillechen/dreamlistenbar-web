import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/lib/PlayerContext";
import { UserProvider } from "@/lib/UserContext";
import GlobalPlayer from "@/components/GlobalPlayer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DreamListenBar - 有声小说",
  description: "DreamListenBar - 免费有声小说播放应用，支持离线收听、定时关闭、跨设备同步",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192" },
      { url: "/icon-512.png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
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
