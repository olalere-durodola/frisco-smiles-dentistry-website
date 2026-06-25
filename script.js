document.addEventListener('DOMContentLoaded', () => {
  // interactivity modules registered in later tasks
});

// scroll progress
const progress = document.getElementById('progress');
const onScroll = () => {
  if (!progress) return;
  const h = document.documentElement;
  const pct = h.scrollTop / (h.scrollHeight - h.clientHeight || 1) * 100;
  progress.style.width = pct + '%';
};
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
navLinks?.addEventListener('click', e => {
  if (e.target.tagName === 'A') { navLinks.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); }
});

// services filter
const filters = document.querySelectorAll('.filter');
const svcs = document.querySelectorAll('.svc');
filters.forEach(btn => btn.addEventListener('click', () => {
  filters.forEach(f => f.classList.remove('active'));
  btn.classList.add('active');
  const cat = btn.dataset.filter;
  svcs.forEach(s => { s.style.display = (cat === 'all' || s.dataset.cat === cat) ? '' : 'none'; });
}));

// before/after slider
const ba = document.getElementById('ba');
if (ba) {
  const before = document.getElementById('baBefore');
  const handle = document.getElementById('baHandle');
  const inner = ba.querySelector('.ba-before-inner');
  const sizeInner = () => { if (inner) inner.style.width = ba.clientWidth + 'px'; };
  sizeInner();
  window.addEventListener('resize', sizeInner);
  let dragging = false;
  const setPct = clientX => {
    const r = ba.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, (clientX - r.left) / r.width * 100));
    before.style.width = pct + '%'; handle.style.left = pct + '%';
  };
  ba.addEventListener('pointerdown', e => { dragging = true; ba.setPointerCapture?.(e.pointerId); setPct(e.clientX); });
  window.addEventListener('pointermove', e => { if (dragging) setPct(e.clientX); });
  window.addEventListener('pointerup', () => dragging = false);
}

// testimonials carousel
const track = document.getElementById('tTrack');
if (track) {
  const slides = track.children.length;
  let i = 0;
  const dots = document.querySelectorAll('.t-dot');
  const go = n => {
    i = (n + slides) % slides;
    track.style.transform = `translateX(-${i*100}%)`;
    dots.forEach((d,di) => d.classList.toggle('active', di===i));
  };
  document.getElementById('tPrev')?.addEventListener('click', () => go(i-1));
  document.getElementById('tNext')?.addEventListener('click', () => go(i+1));
  dots.forEach((d,di) => d.addEventListener('click', () => go(di)));
  go(0);
}

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(q => q.addEventListener('click', () => {
  const item = q.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(o => { o.classList.remove('open'); o.querySelector('.faq-q').setAttribute('aria-expanded','false'); });
  if (!isOpen) { item.classList.add('open'); q.setAttribute('aria-expanded','true'); }
}));
