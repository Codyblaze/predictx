"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/markets", label: "Markets" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/markets/create", label: "Create" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-x1-border bg-x1-dark/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-x1-green">⬡</span>
            <span>PredictX</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={clsx(
                  "text-sm font-medium transition-colors",
                  pathname === n.href
                    ? "text-x1-green"
                    : "text-x1-muted hover:text-white"
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus="avatar"
        />
      </div>
    </header>
  );
}
