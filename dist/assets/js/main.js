(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.querySelector('#motion-toggle');
  let motionOff = reducedMotion.matches;
  try { const saved = localStorage.getItem('portfolio-motion'); if (saved) motionOff = saved === 'off'; } catch {}
  function applyMotion() {
    root.classList.toggle('motion-off', motionOff);
    motionButton.setAttribute('aria-pressed', String(motionOff));
    motionButton.innerHTML = `Motion: ${motionOff ? 'off' : 'on'} <span aria-hidden="true">${motionOff ? '○' : '◉'}</span>`;
    document.querySelectorAll('.motion-asset').forEach(img => { img.src = motionOff ? img.dataset.still : img.dataset.motion; });
  }
  applyMotion();
  motionButton.addEventListener('click', () => {
    motionOff = !motionOff;
    try { localStorage.setItem('portfolio-motion', motionOff ? 'off' : 'on'); } catch {}
    applyMotion();
  });
  reducedMotion.addEventListener('change', event => { motionOff = event.matches; applyMotion(); });

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  function closeMenu() { nav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); }
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menuButton.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
    }, { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    root.classList.add('js');
    const sections = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          nav.querySelectorAll('a').forEach(link => {
            if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        }
      });
    }, { rootMargin: '-15% 0px -65% 0px' });
    document.querySelectorAll('main>section[id]').forEach(section => sections.observe(section));
  }

  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
    let count = 0;
    document.querySelectorAll('.project-card').forEach(card => {
      card.hidden = filter !== 'all' && !card.dataset.category.split(' ').includes(filter);
      if (!card.hidden) { count++; card.classList.add('visible'); }
    });
    document.querySelector('#filter-status').textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown.`;
  }));

  const toast = document.querySelector('.toast');
  let toastTimer;
  function showToast(message) { toast.textContent = message; toast.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500); }
  document.querySelector('.copy-email').addEventListener('click', async () => {
    const email = 'srikrishnakamma@outlook.com';
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(email);
      else {
        const field = document.createElement('textarea'); field.value = email; field.style.position = 'fixed'; field.style.left = '-9999px'; document.body.append(field); field.select();
        const copied = document.execCommand('copy'); field.remove(); if (!copied) throw new Error('Clipboard unavailable');
      }
      showToast('Email address copied. Let’s connect!');
    } catch { showToast('Select the email address to copy it.'); }
  });

  const progress = document.querySelector('.reading-progress');
  let scrollQueued = false;
  function updateProgress() { const distance = root.scrollHeight - window.innerHeight; progress.style.width = `${distance > 0 ? (window.scrollY / distance) * 100 : 0}%`; scrollQueued = false; }
  window.addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); } }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
  document.querySelector('#year').textContent = new Date().getFullYear();
  window.addEventListener('beforeprint', () => document.querySelectorAll('details').forEach(details => { details.dataset.printOpen = String(details.open); details.open = true; }));
  window.addEventListener('afterprint', () => document.querySelectorAll('details').forEach(details => { details.open = details.dataset.printOpen === 'true'; delete details.dataset.printOpen; }));
})();
