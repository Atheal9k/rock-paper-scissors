import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

import ToasterProvider from "@/providers/ToasterProvider";
import WagmiProvider from "@/providers/WagmiProvider";
import RadixThemeProvider from "@/providers/RadixThemeProvider";

const font = Figtree({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RPS",
  description: "The Ultimate RPS Game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={font.className}>
        <RadixThemeProvider>
          <ToasterProvider />
          <WagmiProvider>{children}</WagmiProvider>
        </RadixThemeProvider>
      </body>
    </html>
  );
}
