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
