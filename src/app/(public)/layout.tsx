import Link from "next/link";
import { Brand } from "@/components/brand";
import { Navigation } from "@/components/navigation";
import { PremiumMotion } from "@/components/premium-motion";
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PremiumMotion />
      <div className="public-header-shell">
        <div className="top-strip">
          A clearer tomorrow begins with care.{" "}
          <span>Community eye care · India</span>
        </div>
        <header className="public-header container">
          <Brand />
          <Navigation />
        </header>
      </div>
      <main id="main-content">{children}</main>
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <Brand />
            <p>
              Bringing eye care closer to the communities
              <br />
              who need it.
            </p>
          </div>
          <div>
            <p className="eyebrow">Care, with dignity</p>
            <p>
              Your health information belongs in trusted hands.
              <br />
              Patient records are never shared on this website.
            </p>
          </div>
          <div>
            <Link href="/contact">Get in touch ↗</Link>
            <Link href="/login">Staff portal ↗</Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>KARUNA AJN medical trust · Phase 1 demonstration.</span>
          <span>Built around people. Designed for access.</span>
        </div>
      </footer>
    </>
  );
}
