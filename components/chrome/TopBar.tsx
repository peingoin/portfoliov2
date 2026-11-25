import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { Nav } from "./Nav";

export function TopBar() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-[var(--margin)] pt-3 md:pt-5">
      <Link
        href="/"
        className="pointer-events-auto flex min-h-11 items-center gap-2.5"
        aria-label={`${site.name}, home`}
      >
        <Image src="/logo-mark.svg" alt="" width={28} height={28} priority />
        <span className="heading hidden text-[15px] tracking-[0.06em] sm:inline">{site.name}</span>
      </Link>
      <div className="pointer-events-auto">
        <Nav />
      </div>
    </header>
  );
}
