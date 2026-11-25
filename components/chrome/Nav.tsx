"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Map" },
  { href: "/gazetteer/", label: "Gazetteer" },
  { href: "/#base-camp", label: "Base camp" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className="flex items-center gap-1">
        {ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.replace(/\/$/, ""));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`label flex min-h-11 items-center px-3 transition-colors duration-150 hover:text-signal ${
                  active ? "text-ink" : ""
                }`}
              >
                {active && <span className="mr-2 inline-block h-1.5 w-1.5 rotate-45 bg-signal" aria-hidden="true" />}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
