import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QCEN | Camisas — Que Comece Em Nós",
  description: "Gerenciador de pedidos de camisas, tamanhos e pagamentos do QCEN (Que Comece Em Nós).",
  icons: {
    icon: [
      { url: '/icon.png', sizes: '128x128', type: 'image/png' },
      { url: '/qcen-logo.png' }
    ],
    shortcut: '/icon.png',
    apple: '/qcen-logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "QCEN Camisas",
  },
};

export const viewport: Viewport = {
  themeColor: "#090a10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`h-full antialiased dark ${anton.variable} ${inter.variable}`}>
      <body className="min-h-full flex flex-col selection:bg-blue-600 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
