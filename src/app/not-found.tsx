import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main-content" className="container section empty-state">
      <p className="eyebrow">PAGE NOT FOUND</p>
      <h1>Let’s find your way back.</h1>
      <p>This page is unavailable or has not been published.</p>
      <Link href="/" className="button">
        Return home
      </Link>
    </main>
  );
}
