"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const TABS = [
  { href: "/markets", label: "Open" },
  { href: "/markets/closed", label: "Closed & Resolved" },
];

export function MarketNavTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={clsx(
            "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
            pathname === tab.href
              ? "bg-x1-green text-black"
              : "bg-x1-border text-x1-muted hover:text-white"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
