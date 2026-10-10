(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.dataset.motion = reduce ? 'reduced' : 'full';

  document.querySelectorAll('.reveal, .card, .section-heading').forEach((element) => {
    if (reduce) { element.classList.add('is-visible'); return; }
    const observer = new IntersectionObserver((entries, obs) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
    }), { threshold: .12 });
    observer.observe(element);
  });

  const canvas = document.querySelector('[data-particle-mesh]');
  if (canvas && !reduce) {
    const ctx = canvas.getContext('2d'); let points = []; let frame = 0; let visible = true;
    const resize = () => {
      const ratio = devicePixelRatio || 1; canvas.width = innerWidth * ratio; canvas.height = innerHeight * ratio;
      canvas.style.width = `${innerWidth}px`; canvas.style.height = `${innerHeight}px`; ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(80, Math.max(24, Math.floor(innerWidth * innerHeight / 22000)));
      points = Array.from({ length: count }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: (Math.random() - .5) * .16, vy: (Math.random() - .5) * .16 }));
    };
    const draw = () => {
      if (!visible) return; ctx.clearRect(0, 0, innerWidth, innerHeight);
      points.forEach((p) => { p.x = (p.x + p.vx + innerWidth) % innerWidth; p.y = (p.y + p.vy + innerHeight) % innerHeight; ctx.fillStyle = 'rgba(0,230,246,.7)'; ctx.fillRect(p.x, p.y, 2, 2); points.forEach((q) => { const d = Math.hypot(p.x-q.x, p.y-q.y); if (d < 120) { ctx.strokeStyle = `rgba(154,108,255,${(1-d/120)*.16})`; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke(); } }); });
      frame = requestAnimationFrame(draw);
    };
    addEventListener('resize', resize); document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible && !frame) draw(); }); resize(); draw();
  }

  document.querySelectorAll('[data-tilt]').forEach((card) => {
    if (reduce || matchMedia('(hover: none)').matches) return;
    card.addEventListener('pointermove', (event) => { const rect = card.getBoundingClientRect(); card.style.setProperty('--rx', `${((event.clientY-rect.top)/rect.height-.5)*-5}deg`); card.style.setProperty('--ry', `${((event.clientX-rect.left)/rect.width-.5)*5}deg`); });
    card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
  });
  document.querySelectorAll('[data-magnetic]').forEach((button) => {
    if (reduce || matchMedia('(hover: none)').matches) return;
    button.addEventListener('pointermove', (event) => { const rect=button.getBoundingClientRect(); button.style.setProperty('--mx', `${event.clientX-rect.left}px`); button.style.setProperty('--my', `${event.clientY-rect.top}px`); button.style.transform=`translate(${((event.clientX-rect.left)/rect.width-.5)*8}px,${((event.clientY-rect.top)/rect.height-.5)*8}px)`; });
    button.addEventListener('pointerleave', () => { button.style.transform=''; });
  });

  const gate=document.querySelector('#age-gate'); const gated=document.querySelectorAll('.payment-gated'); const denied=document.querySelector('#age-gate-denied-notice');
  if(gate && gated.length){ const reveal=ok=>{gated.forEach(x=>{x.hidden=!ok;x.style.display=ok?'grid':'none';}); if(denied) denied.hidden=ok;}; if(sessionStorage.getItem('muse.age.ok')==='1') reveal(true); else {reveal(false); gate.showModal?.(); gate.querySelector('[data-age="confirm"]')?.addEventListener('click',()=>{sessionStorage.setItem('muse.age.ok','1'); gate.close(); reveal(true)}); gate.querySelector('[data-age="deny"]')?.addEventListener('click',()=>{gate.close(); reveal(false); if(denied) denied.hidden=false});}}
})();
