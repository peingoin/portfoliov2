/** A square with one folded corner. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M3 3h18l8 8v18H3z" fill="currentColor" />
      <path d="M21 3v8h8" fill="var(--color-paper)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
