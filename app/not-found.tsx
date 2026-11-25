import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-[1240px] flex-col justify-center px-[var(--margin)]">
      <p className="label">Error 404 · Unsurveyed</p>
      <h1 className="display mt-3 text-[56px] md:text-[112px]">Off the map</h1>
      <p className="mt-4 max-w-[40ch] text-ink-muted">This sheet does not exist. The trail picks up again at the map.</p>
      <p className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-primary">
          Back to the map
        </Link>
        <Link href="/gazetteer/" className="btn">
          Plain list
        </Link>
      </p>
    </main>
  );
}
