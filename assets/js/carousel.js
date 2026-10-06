(() => {
  'use strict';
  const carousel = document.querySelector('.project-carousel');
  if (!carousel) return;
  const viewport = carousel.querySelector('.carousel-viewport');
  const cards = [...carousel.querySelectorAll('.project-card')];
  const controls = carousel.querySelector('.carousel-controls');
  const pagination = carousel.querySelector('.carousel-pagination');
  const previous = carousel.querySelector('.carousel-prev');
  const next = carousel.querySelector('.carousel-next');
  const status = carousel.querySelector('#carousel-status');
  let slides = cards;
  let current = 0;
  let printing = false;
  let scrollTimer;
  const title = card => card.querySelector('h3').textContent.trim();
  const motionDisabled = () => document.documentElement.classList.contains('motion-off') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    if (printing || !slides[current]) return;
    viewport.style.height = `${Math.ceil(slides[current].getBoundingClientRect().height)}px`;
  }
  function update() {
    cards.forEach(card => {
      const index = slides.indexOf(card);
      const active = index === current && !card.hidden;
      card.inert = !active;
      card.setAttribute('aria-hidden', String(!active));
      if (index >= 0) card.setAttribute('aria-label', `${index + 1} of ${slides.length}: ${title(card)}`);
    });
    [...pagination.children].forEach((button, index) => {
      if (index === current) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    previous.disabled = next.disabled = slides.length < 2;
    status.textContent = slides.length ? `${current + 1} / ${slides.length} — ${title(slides[current])}` : 'No contributions';
    resize();
  }
  function goTo(index, animate = true) {
    if (printing || !slides.length) return;
    current = (index + slides.length) % slides.length;
    update();
    viewport.scrollTo({ left: current * viewport.clientWidth, behavior: animate && !motionDisabled() ? 'smooth' : 'instant' });
  }
  function settle() {
    clearTimeout(scrollTimer);
    if (printing || !viewport.clientWidth || !slides.length) return;
    const index = Math.min(slides.length - 1, Math.max(0, Math.round(viewport.scrollLeft / viewport.clientWidth)));
    if (index !== current) { current = index; update(); }
  }
  function buildPagination() {
    pagination.replaceChildren();
    slides.forEach((card, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `Show contribution ${index + 1}: ${title(card)}`);
      button.setAttribute('aria-controls', 'project-viewport');
      button.addEventListener('click', () => goTo(index));
      pagination.append(button);
    });
  }

  cards.forEach(card => {
    card.classList.add('visible');
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'slide');
    card.querySelectorAll('details').forEach(details => details.addEventListener('toggle', resize));
  });
  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-roledescription', 'carousel');
  carousel.setAttribute('aria-label', 'Selected contributions');
  viewport.tabIndex = 0;
  viewport.setAttribute('aria-label', 'Project slides. Use left and right arrows to browse.');
  carousel.classList.add('is-ready');
  controls.hidden = false;
  buildPagination();
  goTo(0, false);
  previous.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  viewport.addEventListener('keydown', event => {
    if (event.target !== viewport) return;
    const actions = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: slides.length - 1 };
    if (Object.hasOwn(actions, event.key)) { event.preventDefault(); goTo(actions[event.key]); }
  });
  viewport.addEventListener('scroll', () => { clearTimeout(scrollTimer); scrollTimer = setTimeout(settle, 180); }, { passive: true });
  viewport.addEventListener('scrollend', settle);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(resize);
    cards.forEach(card => observer.observe(card));
  }
  window.addEventListener('resize', () => goTo(current, false));
  if (document.fonts) document.fonts.ready.then(resize);

  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    clearTimeout(scrollTimer);
    document.querySelectorAll('[data-filter]').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    cards.forEach(card => { card.hidden = filter !== 'all' && !card.dataset.category.split(' ').includes(filter); });
    slides = cards.filter(card => !card.hidden);
    buildPagination();
    goTo(0, false);
    document.querySelector('#filter-status').textContent = `${slides.length} ${slides.length === 1 ? 'contribution' : 'contributions'}${filter === 'all' ? '' : ` · ${button.textContent.trim()}`}`;
  }));

  let printVisibility;
  window.addEventListener('beforeprint', () => {
    printing = true;
    printVisibility = cards.map(card => card.hidden);
    carousel.classList.remove('is-ready');
    viewport.style.height = '';
    cards.forEach(card => { card.hidden = false; card.inert = false; card.removeAttribute('aria-hidden'); });
  });
  window.addEventListener('afterprint', () => {
    if (!printing) return;
    cards.forEach((card, index) => { card.hidden = printVisibility[index]; });
    carousel.classList.add('is-ready');
    printing = false;
    requestAnimationFrame(() => goTo(current, false));
  });
})();
