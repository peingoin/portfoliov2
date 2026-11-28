"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * The one bar that is always within reach. It tucks away while you scroll
 * down, so it never sits over the scene, and comes back as soon as you
 * scroll up.
 */
export function SiteNav() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 120);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="nav" data-hidden={hidden || undefined} onFocusCapture={() => setHidden(false)}>
      <Link href="/" className="nav-logo" aria-label="Home">
        <Image src="/logo.svg" alt="" width={53} height={44} priority />
      </Link>
      <nav aria-label="Main">
        <ul className="nav-links">
          <li>
            <Link href="/#work">Work</Link>
          </li>
          <li>
            <Link href="/#about">About</Link>
          </li>
          <li className="max-sm:hidden">
            <Link href="/#contact">Contact</Link>
          </li>
          <li>
            <Link href="/#contact" className="nav-cta">
              Say hi
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
