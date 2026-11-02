import Link from "next/link";
import Image from "next/image";
export default function Home() {
  return (
    <>
      <section className="hero-stage">
        <div className="hero container">
          <div className="hero-copy">
            <div className="hero-kicker-row">
              <p className="eyebrow">
                <span className="small-line" /> COMMUNITY FIRST. ALWAYS.
              </p>
              <span className="hero-care-pill">
                <i aria-hidden /> Free community eye care
              </span>
            </div>
            <h1>
              Better vision.
              <br />
              <em>Brighter lives.</em>
            </h1>
            <p className="hero-description">
              Everyone deserves the chance to see clearly. Bringing free eye
              screening, compassionate guidance, and a path to further care closer
              to home.
            </p>
            <div className="hero-actions">
              <Link className="button hero-primary-button" href="/camps">
                Explore eye camps <span aria-hidden>↗</span>
              </Link>
              <Link className="text-link" href="/about">
                About the trust <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="hero-note">
              <span className="note-symbol" aria-hidden>
                ✳
              </span>
              <p>
                Care without barriers.
                <br />
                <strong>People at the heart of every camp.</strong>
              </p>
            </div>
          </div>
          <figure className="hero-photo">
            <Image
              src="/images/community-eye-screening.webp"
              alt="An optometrist gently checking an older woman’s vision with a trial lens frame at a community eye camp"
              fill
              priority
              sizes="(max-width: 700px) 100vw, 48vw"
            />
            <div className="hero-photo-badge" aria-hidden>
              <span>◎</span>
              <p>Screen · Guide<br />Follow up</p>
            </div>
            <figcaption>
              <span>Illustrative community screening</span>
              <strong>Care that meets people where they are.</strong>
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="values-strip">
        <div className="values-marquee" aria-label="Our care principles">
          <div className="values-track">
            <span>Free community screening</span>
            <span>Respectful, personal care</span>
            <span>Guidance beyond the camp</span>
            <span>Privacy at every step</span>
            <span aria-hidden>Free community screening</span>
            <span aria-hidden>Respectful, personal care</span>
            <span aria-hidden>Guidance beyond the camp</span>
            <span aria-hidden>Privacy at every step</span>
          </div>
        </div>
      </section>
      <section className="section approach-section">
        <div className="container">
          <div className="section-heading approach-heading">
            <div>
              <p className="eyebrow">OUR APPROACH</p>
              <h2>
                One journey.
                <br />
                <em>Three caring steps.</em>
              </h2>
            </div>
            <p className="muted">
              From a first screening to the next step in treatment,
              <br className="desktop-only" /> every person is met with clarity,
              dignity, and care.
            </p>
          </div>

          <div className="approach-journey">
            <span className="journey-line" aria-hidden />

            <article className="approach-step">
              <div className="approach-icon" aria-hidden>
                <svg viewBox="0 0 64 64" role="img">
                  <path d="M7 32s9-14 25-14 25 14 25 14-9 14-25 14S7 32 7 32Z" />
                  <circle cx="32" cy="32" r="7" />
                  <path d="M32 9v5M15 14l4 5M49 14l-4 5" />
                </svg>
              </div>
              <div className="approach-step-top">
                <span className="approach-number">01</span>
                <span className="approach-label">Discover</span>
              </div>
              <h3>Screen with care</h3>
              <p>
                Accessible eye-testing camps help people understand their eye
                health in a welcoming, familiar setting.
              </p>
            </article>

            <article className="approach-step featured">
              <div className="approach-icon" aria-hidden>
                <svg viewBox="0 0 64 64" role="img">
                  <circle cx="20" cy="20" r="8" />
                  <circle cx="45" cy="43" r="8" />
                  <path d="M26 25l13 12M34 20h12v12" />
                  <path d="M11 50c4-8 11-12 20-12" />
                </svg>
              </div>
              <div className="approach-step-top">
                <span className="approach-number">02</span>
                <span className="approach-label">Understand</span>
              </div>
              <h3>Guide the next step</h3>
              <p>
                Clear explanations and thoughtful referrals turn a screening
                result into a plan people can confidently follow.
              </p>
            </article>

            <article className="approach-step">
              <div className="approach-icon" aria-hidden>
                <svg viewBox="0 0 64 64" role="img">
                  <path d="M32 53s-19-11-19-26c0-8 5-13 12-13 4 0 7 2 9 6 2-4 5-6 9-6 7 0 12 5 12 13 0 15-23 26-23 26Z" />
                  <path d="M22 31h7l3-6 5 13 3-7h6" />
                </svg>
              </div>
              <div className="approach-step-top">
                <span className="approach-number">03</span>
                <span className="approach-label">Support</span>
              </div>
              <h3>Stay connected</h3>
              <p>
                Thoughtful follow-ups help people feel supported beyond the
                camp and throughout their care journey.
              </p>
            </article>
          </div>

          <div className="approach-promise">
            <span aria-hidden>◎</span>
            <p>
              <strong>Care does not end at the eye chart.</strong>
              The next step should always feel clear.
            </p>
            <Link href="/about" className="text-link">
              See how we work <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
      <section className="section care-in-action">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CARE IN ACTION</p>
              <h2>
                Human care at
                <br />
                every step.
              </h2>
            </div>
            <div>
              <p className="muted">
                Eye care becomes easier to trust when people feel seen,
                informed, and supported.
              </p>
              <p className="image-disclosure">Illustrative photography</p>
            </div>
          </div>
          <div className="care-photo-grid">
            <article className="care-photo-card">
              <div className="care-photo-frame">
                <Image
                  src="/images/school-eye-screening.webp"
                  alt="A schoolgirl completing a simple vision screening with an optometrist’s support"
                  fill
                  sizes="(max-width: 700px) 100vw, 50vw"
                />
              </div>
              <div className="care-photo-copy">
                <span className="step-number">01</span>
                <div>
                  <h3>Early checks, closer to home.</h3>
                  <p className="muted">
                    Community and school screenings can help identify concerns
                    before they become barriers to learning and everyday life.
                  </p>
                </div>
              </div>
            </article>
            <article className="care-photo-card">
              <div className="care-photo-frame follow-up-photo">
                <Image
                  src="/images/follow-up-guidance.webp"
                  alt="An eye-care professional explaining eyeglasses and next steps to a man after screening"
                  fill
                  sizes="(max-width: 700px) 100vw, 50vw"
                />
              </div>
              <div className="care-photo-copy">
                <span className="step-number">02</span>
                <div>
                  <h3>Guidance people can understand.</h3>
                  <p className="muted">
                    Clear explanations and thoughtful follow-up help people move
                    from a screening result to the care they may need.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="container">
        <div className="community-banner">
          <div>
            <p className="eyebrow">CARE IN YOUR COMMUNITY</p>
            <h2>
              A place to begin.
              <br />A team that cares.
            </h2>
            <p>Camp schedules will appear here once confirmed by the trust.</p>
          </div>
          <Link href="/camps" className="button light">
            View camp information ↗
          </Link>
        </div>
      </section>
      <section className="section container privacy-section">
        <span className="privacy-seal" aria-hidden>
          ◎
        </span>
        <div>
          <p className="eyebrow">TRUST IS PART OF CARE</p>
          <h2>Real stories deserve real privacy.</h2>
          <p className="muted">
            The About page explains our community care approach and how verified
            impact summaries can protect privacy.
            <br />
            Personal details and health records stay within the secure staff
            portal.
          </p>
        </div>
        <Link href="/about" className="text-link">
          About the trust →
        </Link>
      </section>
    </>
  );
}
