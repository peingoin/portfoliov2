import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <p className="display text-[96px] sm:text-[160px]">404</p>
      <p className="mt-2 max-w-[30ch] text-[18px]">This page drifted out of orbit. Nothing here.</p>
      <Link href="/" className="btn btn-primary mt-8">
        Back to the room
      </Link>
    </main>
  );
}
