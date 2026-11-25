import Link from "next/link";
import { site } from "@/content/site";

export function TopBar() {
  return (
    <div className="topbar">
      <Link href="/" aria-label={`${site.firstName} ${site.lastName}, home`}>
        {site.firstName} {site.lastName}
      </Link>
      <nav aria-label="Site">
        <Link href="/#index">Index</Link>
        <Link href="/#about">About</Link>
        <Link href="/#contact">Contact</Link>
      </nav>
    </div>
  );
}
