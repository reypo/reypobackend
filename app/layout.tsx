import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; 

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Görev Takip",
  description: "Ofis içi görev takip uygulaması",
  appleWebApp: {
    capable: true,
    title: "Görev Takip",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Klavye açıldığında içerik alanı yeniden boyutlanır; alt sabit sekme
  // çubuğu klavyenin arkasında kaybolmak yerine üstüne taşınır.
  interactiveWidget: "resizes-content",
  // Uygulama yalnızca aydınlık tema kullanır (ürün kararı, 2026-07-09).
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
