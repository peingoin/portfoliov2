import Link from "next/link";
import { TopBar } from "@/components/TopBar";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col justify-center px-[var(--gutter)]">
      <TopBar />
      <p className="label">404</p>
      <h1 className="display mt-3 text-[clamp(80px,22vw,320px)]">Not a letter.</h1>
      <p className="lede mt-4 max-w-[36ch]">There is nothing at this address. The name is back on the first page.</p>
      <p className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-acid">
          Back to the name
        </Link>
        <Link href="/#index" className="btn">
          Index
        </Link>
      </p>
    </main>
  );
}
