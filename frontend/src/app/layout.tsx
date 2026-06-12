import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PredictX — AI-Powered Prediction Markets on X1 EcoChain",
  description:
    "Create and trade binary prediction markets on X1 EcoChain. AI-powered probability scoring, sub-cent fees, instant finality.",
  metadataBase: new URL("https://predictx1.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "PredictX",
    description: "Decentralized prediction markets powered by AI on X1 EcoChain",
    siteName: "PredictX",
    url: "https://predictx1.com",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-x1-dark text-white`}>
        <Providers>
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
