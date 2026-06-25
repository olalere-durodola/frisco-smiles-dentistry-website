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

// booking modal (5-step, visual-only)
const modal = document.getElementById('booking');
if (modal) {
  const card = modal.querySelector('.modal-card');
  const dots = modal.querySelectorAll('.bk-dot');
  const controls = modal.querySelector('.bk-controls');
  const nextBtn = document.getElementById('bkNext');
  const backBtn = document.getElementById('bkBack');
  const nameInput = document.getElementById('bkName');
  const phoneInput = document.getElementById('bkPhone');
  const summary = document.getElementById('bkSummary');

  const state = { step: 0, reason: '', day: '', time: '', name: '', phone: '' };
  // which state field each panel writes to
  const panelField = { 0: 'reason', 1: 'day', 2: 'time' };
  let trigger = null;

  const stepValid = s => {
    if (s === 0) return !!state.reason;
    if (s === 1) return !!state.day;
    if (s === 2) return !!state.time;
    if (s === 3) return state.name.trim() !== '' && state.phone.trim() !== '';
    return true;
  };

  const fillSummary = () => {
    const rows = [
      ['Reason', state.reason],
      ['Day', state.day],
      ['Time', state.time],
      ['Name', state.name],
      ['Phone', state.phone]
    ];
    summary.innerHTML = rows.map(([k, v]) =>
      `<div class="bk-row"><span class="bk-row-k">${k}</span><span class="bk-row-v">${v || '—'}</span></div>`
    ).join('');
  };

  const render = () => {
    card.dataset.step = state.step;
    dots.forEach((d, di) => d.classList.toggle('active', di === state.step));
    if (state.step === 4) {
      controls.style.display = 'none';
      fillSummary();
    } else {
      controls.style.display = 'flex';
      nextBtn.textContent = state.step === 3 ? 'Request appointment' : 'Next';
      nextBtn.disabled = !stepValid(state.step);
      backBtn.disabled = state.step === 0;
    }
  };

  const goTo = s => { state.step = Math.max(0, Math.min(4, s)); render(); };

  const open = el => {
    trigger = el || document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    render();
    const first = card.querySelector('.bk-choice, .bk-input, button');
    first?.focus();
  };
  const close = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
    trigger?.focus?.();
  };

  document.querySelectorAll('[data-open-booking]').forEach(b =>
    b.addEventListener('click', () => open(b)));
  document.querySelectorAll('[data-close-booking]').forEach(b =>
    b.addEventListener('click', close));

  // choice buttons
  card.querySelectorAll('.bk-step').forEach(panel => {
    const idx = Number(panel.dataset.panel);
    const field = panelField[idx];
    if (!field) return;
    panel.querySelectorAll('.bk-choice').forEach(choice => {
      choice.addEventListener('click', () => {
        panel.querySelectorAll('.bk-choice').forEach(c => c.classList.remove('selected'));
        choice.classList.add('selected');
        state[field] = choice.dataset.value;
        nextBtn.disabled = false;
        setTimeout(() => goTo(state.step + 1), 180);
      });
    });
  });

  nameInput?.addEventListener('input', () => { state.name = nameInput.value; nextBtn.disabled = !stepValid(state.step); });
  phoneInput?.addEventListener('input', () => { state.phone = phoneInput.value; nextBtn.disabled = !stepValid(state.step); });

  nextBtn.addEventListener('click', () => {
    if (!stepValid(state.step)) return;
    if (state.step === 3) { state.name = nameInput.value; state.phone = phoneInput.value; }
    goTo(state.step + 1);
  });
  backBtn.addEventListener('click', () => goTo(state.step - 1));

  // Escape closes + simple focus trap
  modal.addEventListener('keydown', e => {
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    const focusable = [...card.querySelectorAll('button, input, [href], [tabindex]:not([tabindex="-1"])')]
      .filter(el => !el.disabled && el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}
