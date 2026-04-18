/* Jiongan Mu — interactions v3 */
(() => {
  const body = document.body;
  const html = document.documentElement;

  /* ---- apply tweaks ---- */
  function applyAccent(hex) {
    document.documentElement.style.setProperty('--accent', hex);
    document.querySelectorAll('.sw').forEach(b => b.classList.toggle('is-active', b.dataset.accent === hex));
  }
  function applyMotion(val) { body.classList.toggle('reduced', val === 'off'); markSeg('motion', val); }
  function applyDensity(val) { body.dataset.density = val; markSeg('density', val); }
  function markSeg(key, val) {
    document.querySelectorAll(`.seg[data-tweak="${key}"] button`).forEach(b => b.classList.toggle('is-active', b.dataset.val === val));
  }

  const T = window.__TWEAKS || {};
  applyAccent(T.accent || '#b8532a');
  applyMotion(T.motion || 'on');
  applyDensity(T.density || 'regular');

  /* ---- progress bar + top bar fade ---- */
  const progress = document.querySelector('.progress span');
  const top = document.querySelector('.top');
  const heroH = () => document.querySelector('.hero')?.offsetHeight || window.innerHeight;
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function onScroll() {
    const sc = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (clamp(sc / docH, 0, 1) * 100) + '%';
    if (top) top.classList.toggle('is-visible', sc > heroH() * 0.6);
  }
  let rafId;
  function schedule() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => { rafId = 0; onScroll(); });
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  onScroll();

  /* ---- about scrub: activate current paragraph ---- */
  const aboutPs = document.querySelectorAll('.about-big p');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => e.target.classList.toggle('in-view', e.isIntersecting && e.intersectionRatio > 0.5));
    }, { threshold: [0, 0.5, 1], rootMargin: '-20% 0px -20% 0px' });
    aboutPs.forEach(p => io.observe(p));
  } else {
    aboutPs.forEach(p => p.classList.add('in-view'));
  }

  /* ---- hero entrance: flip is-loaded after first paint ---- */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => body.classList.add('is-loaded'));
  });

  /* ---- scroll reveals: fade + rise on first intersection ---- */
  const revealEls = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          revealIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => revealIO.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ---- TWEAKS protocol ---- */
  const panel = document.getElementById('tweaks');
  const openTweaks = () => panel && (panel.hidden = false);
  const closeTweaks = () => panel && (panel.hidden = true);
  window.addEventListener('message', (ev) => {
    const d = ev.data || {};
    if (d.type === '__activate_edit_mode') openTweaks();
    else if (d.type === '__deactivate_edit_mode') closeTweaks();
  });
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch(e) {}
  const closeBtn = document.getElementById('tweaks-close');
  if (closeBtn) closeBtn.addEventListener('click', closeTweaks);

  function persist(edits) {
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*'); } catch(e) {}
    Object.assign(window.__TWEAKS, edits);
  }

  document.querySelectorAll('.sw').forEach(sw => {
    sw.addEventListener('click', () => { const hex = sw.dataset.accent; applyAccent(hex); persist({ accent: hex }); });
  });
  document.querySelectorAll('.seg').forEach(seg => {
    const key = seg.dataset.tweak;
    seg.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        if (key === 'motion') applyMotion(val);
        else if (key === 'density') applyDensity(val);
        persist({ [key]: val });
      });
    });
  });
})();
