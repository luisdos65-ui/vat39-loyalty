import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vat39 Loyalty",
  description: "Spaar voor korting bij Vat39 De Specialist",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <main className="min-h-screen flex flex-col items-center justify-between p-4 max-w-md mx-auto bg-white shadow-xl">
          {children}
        </main>
      </body>
    </html>
  );
}
