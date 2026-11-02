(() => {
  const button = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#public-nav');
  if (button && nav) button.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    button.innerHTML = (open ? 'Close' : 'Menu') + ' <span aria-hidden="true">☰</span>';
  });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('motion-ready');
  const selectors = ['main > section','main > .container.section > *','.hero-copy > *','.values-grid > *','.approach-journey > article','.care-photo-grid > article','.three-grid > *','.community-banner > *','.privacy-section > *','.footer-grid > *'];
  const items = [...new Set(selectors.flatMap(s => [...document.querySelectorAll(s)]))];
  items.forEach((el, i) => { el.classList.add('motion-target'); el.style.setProperty('--motion-delay', Math.min(i % 6, 5) * 70 + 'ms'); });
  const reveal = () => items.forEach(el => { if (el.getBoundingClientRect().top < innerHeight * .94) el.classList.add('is-visible'); });
  addEventListener('scroll', reveal, {passive:true}); addEventListener('resize', reveal, {passive:true}); requestAnimationFrame(reveal);
})();