import Link from "next/link";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="KARUNA AJN medical trust home">
      <span className="brand-mark" aria-hidden>
        <svg viewBox="0 0 32 32" fill="none">
          <path
            d="M3 16s5-9 13-9 13 9 13 9-5 9-13 9S3 16 3 16Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="16" cy="16" r="4" fill="currentColor" />
        </svg>
      </span>
      <span>
        <span className="brand-name">KARUNA AJN</span>
        <span className="brand-sub">medical trust</span>
      </span>
    </Link>
  );
}
