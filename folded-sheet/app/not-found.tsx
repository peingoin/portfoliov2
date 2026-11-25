import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <div className="face front" style={{ position: "relative", width: "min(360px, 90vw)", height: "min(360px, 90vw)" }}>
        <span className="num">404</span>
        <h1 className="riso">Blank panel.</h1>
        <p>Nothing is printed here. The sheet starts again at the beginning.</p>
        <p className="meta">
          <Link href="/" className="btn btn-blue">
            Back to the sheet
          </Link>
        </p>
      </div>
    </main>
  );
}
