import { notFound } from "next/navigation";
import { publicPages } from "@/features/public/pages";
import Link from "next/link";
import { Card, EmptyState, PageHeader } from "@/components/ui";
export function generateStaticParams() {
  return Object.keys(publicPages).map((slug) => ({ slug }));
}
export const dynamicParams = false;
export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!Object.hasOwn(publicPages, slug)) notFound();
  const page = publicPages[slug as keyof typeof publicPages];
  if (slug === "about") {
    return (
      <div className="container section">
        <PageHeader {...page} />
        <section aria-labelledby="trust-story" className="about-intro card">
          <p className="eyebrow">WHY WE ARE HERE</p>
          <h2 id="trust-story">Everyone deserves the chance to see clearly.</h2>
          <p className="muted">
            KARUNA AJN medical trust is a charitable eye-care trust focused on
            bringing screening closer to communities. The aim is to make a first
            step easier to take, explain what comes next, and help people stay
            connected to care.
          </p>
          <p className="muted">
            Verified details about the trust’s history, team, registration, and
            service locations will be added as they are confirmed.
          </p>
        </section>
        <section aria-labelledby="care-approach" className="section about-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">OUR WORK</p>
              <h2 id="care-approach">Care beyond the screening.</h2>
            </div>
            <p className="muted">
              A connected approach gives people clearer guidance from their
              first eye check to the next step in care.
            </p>
          </div>
          <div className="three-grid">
            {[
              ["01", "Screen with care", "Community eye camps provide an accessible place to begin understanding eye health."],
              ["02", "Guide the next step", "Clear explanations and referrals can help people find appropriate further assessment."],
              ["03", "Stay connected", "Thoughtful follow-ups can support people as they continue their care journey."],
            ].map(([number, title, description]) => (
              <Card className="approach-card" key={number}>
                <span className="step-number">{number}</span>
                <h3>{title}</h3>
                <p className="muted">{description}</p>
              </Card>
            ))}
          </div>
        </section>
        <section aria-labelledby="responsible-impact" className="section about-impact">
          <span className="privacy-seal" aria-hidden>◎</span>
          <div>
            <p className="eyebrow">OUR IMPACT</p>
            <h2 id="responsible-impact">Every person matters. Every story deserves privacy.</h2>
            <p className="muted">
              The trust plans to share reviewed, anonymous summaries of its
              community work. Personal details and health records will stay
              within the secure staff portal. Verified measures will be added
              once they are ready to publish responsibly.
            </p>
            <Link href="/camps" className="text-link">
              Explore eye camps <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </div>
    );
  }
  return (
    <div className="container section">
      <PageHeader {...page} />
      <EmptyState title={page.emptyTitle} description={page.emptyDescription} />
    </div>
  );
}
