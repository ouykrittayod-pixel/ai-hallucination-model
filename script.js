/* =========================================================
   AI HALLUCINATION — A Conceptual Mathematical Model
   Interactive behaviour
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     0. Model parameters — exactly as defined in the report
     H(U,C,P,B) = 1 / (1 + e^(-Z))
     Z = aU + bC - cP - dB + k
     Demonstration parameters only (see report, section 4.4)
  --------------------------------------------------------- */
  const PARAMS = { a: 8, b: 4, c: 3, d: 2, k: -5 };

  function computeZ({U, C, P, B}){
    return PARAMS.a*U + PARAMS.b*C - PARAMS.c*P - PARAMS.d*B + PARAMS.k;
  }
  function sigmoid(z){ return 1 / (1 + Math.exp(-z)); }
  function computeH(vars){ return sigmoid(computeZ(vars)); }

  function riskLabel(h){
    if (h < 0.3) return { label: 'LOW RISK', color: 'var(--risk-low)' };
    if (h < 0.7) return { label: 'MEDIUM RISK', color: 'var(--risk-mid)' };
    return { label: 'HIGH RISK', color: 'var(--risk-high)' };
  }

  /* ---------------------------------------------------------
     1. KaTeX render
  --------------------------------------------------------- */
  function k(el, tex, display=true){
    if(!el) return;
    try{ katex.render(tex, el, { throwOnError:false, displayMode: display }); }
    catch(e){ el.textContent = tex; }
  }
  k(document.getElementById('eq-main'), "H(U,C,P,B) = \\dfrac{1}{1+e^{-Z}}");
  k(document.getElementById('eq-z'), "Z = aU + bC - cP - dB + k");
  k(document.getElementById('eq-deriv'), "\\dfrac{dH}{dZ} = H(1-H)");
  k(document.getElementById('lim-1'), "Z \\to -\\infty \\;\\Rightarrow\\; H \\to 0", true);
  k(document.getElementById('lim-2'), "Z \\to 0 \\;\\Rightarrow\\; H \\to 0.5", true);
  k(document.getElementById('lim-3'), "Z \\to +\\infty \\;\\Rightarrow\\; H \\to 1", true);

  /* ---------------------------------------------------------
     2. Scroll progress bar
  --------------------------------------------------------- */
  const progress = document.getElementById('scroll-progress');
  function updateProgress(){
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = scrolled + '%';
  }
  document.addEventListener('scroll', updateProgress, { passive:true });
  updateProgress();

  /* ---------------------------------------------------------
     3. Back to top
  --------------------------------------------------------- */
  const backBtn = document.getElementById('back-to-top');
  document.addEventListener('scroll', () => {
    backBtn.classList.toggle('show', window.scrollY > 700);
  }, { passive:true });
  backBtn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

  /* ---------------------------------------------------------
     4. Scrollspy nav
  --------------------------------------------------------- */
  const navLinks = Array.from(document.querySelectorAll('.navlinks a'));
  const sections = navLinks.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  function updateSpy(){
    let currentIdx = 0;
    sections.forEach((s, i) => {
      if (s.getBoundingClientRect().top - 100 <= 0) currentIdx = i;
    });
    navLinks.forEach(l => l.classList.remove('active'));
    if (navLinks[currentIdx]) navLinks[currentIdx].classList.add('active');
  }
  document.addEventListener('scroll', updateSpy, { passive:true });
  updateSpy();

  /* ---------------------------------------------------------
     5. Reveal on scroll
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  /* ---------------------------------------------------------
     6. Hero particle / neural network canvas
  --------------------------------------------------------- */
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const PCOUNT_BASE = 70;

  function resizeCanvas(){
    W = canvas.width = canvas.offsetWidth * devicePixelRatio;
    H = canvas.height = canvas.offsetHeight * devicePixelRatio;
  }
  function initParticles(){
    const count = window.innerWidth < 680 ? 34 : PCOUNT_BASE;
    particles = Array.from({length: count}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-0.5)*0.25, vy: (Math.random()-0.5)*0.25,
      r: Math.random()*1.6 + 0.6
    }));
  }
  resizeCanvas(); initParticles();
  window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function drawParticles(){
    ctx.clearRect(0,0,W,H);
    const linkDist = 140 * devicePixelRatio;

    particles.forEach(p => {
      if(!reduceMotion){
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
    });

    for (let i=0; i<particles.length; i++){
      for (let j=i+1; j<particles.length; j++){
        const a = particles[i], b = particles[j];
        const dx = a.x-b.x, dy = a.y-b.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < linkDist){
          ctx.strokeStyle = `rgba(79, 227, 212, ${0.14 * (1 - dist/linkDist)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    particles.forEach(p => {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(141, 123, 255, 0.7)';
      ctx.arc(p.x, p.y, p.r*devicePixelRatio, 0, Math.PI*2);
      ctx.fill();
    });

    if(!reduceMotion) requestAnimationFrame(drawParticles);
  }
  drawParticles();

  /* ---------------------------------------------------------
     7. Factor cards — click to toggle emphasis
  --------------------------------------------------------- */
  const factorCards = document.querySelectorAll('.factor-card');
  factorCards.forEach(card => {
    card.addEventListener('click', () => {
      const wasActive = card.classList.contains('active');
      factorCards.forEach(c => c.classList.remove('active'));
      if (!wasActive) card.classList.add('active');
    });
  });

  /* ---------------------------------------------------------
     8. Live demo sliders
  --------------------------------------------------------- */
  const sliders = { U: document.getElementById('slide-U'), C: document.getElementById('slide-C'),
                     P: document.getElementById('slide-P'), B: document.getElementById('slide-B') };
  const valLabels = { U: document.getElementById('val-U'), C: document.getElementById('val-C'),
                       P: document.getElementById('val-P'), B: document.getElementById('val-B') };
  const readoutH = document.getElementById('readout-h');
  const readoutZ = document.getElementById('readout-z');
  const riskPill = document.getElementById('risk-pill');
  const barFill = document.getElementById('demo-bar-fill');
  const thresholdMarker = document.getElementById('threshold-marker');

  function currentVars(){
    return { U: parseFloat(sliders.U.value), C: parseFloat(sliders.C.value),
              P: parseFloat(sliders.P.value), B: parseFloat(sliders.B.value) };
  }

  function updateDemo(){
    const vars = currentVars();
    Object.keys(vars).forEach(key => { if(valLabels[key]) valLabels[key].textContent = vars[key].toFixed(2); });
    const z = computeZ(vars);
    const h = sigmoid(z);
    readoutH.textContent = h.toFixed(3);
    readoutZ.textContent = `Z = ${z.toFixed(2)}`;
    const risk = riskLabel(h);
    riskPill.textContent = risk.label;
    riskPill.style.color = risk.color;
    barFill.style.width = (h*100).toFixed(1) + '%';
    barFill.style.background = risk.color;
    readoutH.style.color = risk.color;
    updateThresholdMarker(h);
  }
  Object.values(sliders).forEach(s => s && s.addEventListener('input', updateDemo));

  /* ---------------------------------------------------------
     9. Threshold marker (injected into threshold bar)
  --------------------------------------------------------- */
  const thresholdBar = document.querySelector('.threshold-bar');
  let markerEl = null;
  if (thresholdBar){
    markerEl = document.createElement('div');
    markerEl.className = 'threshold-marker';
    markerEl.id = 'threshold-marker';
    markerEl.title = 'ตำแหน่ง H ปัจจุบันจาก Live Demo';
    thresholdBar.style.position = 'relative';
    thresholdBar.appendChild(markerEl);
  }
  function updateThresholdMarker(h){
    if (!markerEl) return;
    markerEl.style.left = `calc(${(h*100).toFixed(2)}% - 1px)`;
  }

  updateDemo();

  /* ---------------------------------------------------------
     10. Logistic curve chart (SVG) — four scenarios
  --------------------------------------------------------- */
  const scenarios = [
    { id:1, name:'Case 1 — Best Case', z0: -8.7, color:'#4fe3a0', desc:'C 0.2 · P 0.9 · B 0.9' },
    { id:2, name:'Case 2', z0: -5.9, color:'#4fe3d4', desc:'C 0.9 · P 0.9 · B 0.9' },
    { id:3, name:'Case 3', z0: -5.2, color:'#ffc25c', desc:'C 0.2 · P 0.2 · B 0.2' },
    { id:4, name:'Case 4 — Worst Case', z0: -2.4, color:'#ff6b7a', desc:'C 0.9 · P 0.2 · B 0.2' },
  ];

  const svgNS = 'http://www.w3.org/2000/svg';
  const chartSvg = document.getElementById('curve-svg');
  const legendWrap = document.getElementById('chart-legend');

  const CW = 640, CH = 420, PAD = { l:46, r:16, t:20, b:40 };
  const plotW = CW - PAD.l - PAD.r, plotH = CH - PAD.t - PAD.b;

  function xToPx(x){ return PAD.l + x * plotW; }          // x in [0,1]
  function yToPx(y){ return PAD.t + (1 - y) * plotH; }    // y in [0,1]

  function buildAxes(){
    const g = document.createElementNS(svgNS, 'g');
    // grid + axis labels
    for (let i=0; i<=5; i++){
      const t = i/5;
      const gx = xToPx(t), gy = yToPx(t);
      const vline = document.createElementNS(svgNS,'line');
      vline.setAttribute('x1', gx); vline.setAttribute('x2', gx);
      vline.setAttribute('y1', PAD.t); vline.setAttribute('y2', CH-PAD.b);
      vline.setAttribute('stroke', 'rgba(140,160,210,0.12)');
      g.appendChild(vline);

      const hline = document.createElementNS(svgNS,'line');
      hline.setAttribute('x1', PAD.l); hline.setAttribute('x2', CW-PAD.r);
      hline.setAttribute('y1', gy); hline.setAttribute('y2', gy);
      hline.setAttribute('stroke', 'rgba(140,160,210,0.12)');
      g.appendChild(hline);

      const xt = document.createElementNS(svgNS,'text');
      xt.setAttribute('x', gx); xt.setAttribute('y', CH-PAD.b+18);
      xt.setAttribute('fill', 'rgba(154,164,191,0.8)'); xt.setAttribute('font-size','11');
      xt.setAttribute('font-family','JetBrains Mono, monospace'); xt.setAttribute('text-anchor','middle');
      xt.textContent = t.toFixed(1);
      g.appendChild(xt);

      const yt = document.createElementNS(svgNS,'text');
      yt.setAttribute('x', PAD.l-10); yt.setAttribute('y', gy+4);
      yt.setAttribute('fill', 'rgba(154,164,191,0.8)'); yt.setAttribute('font-size','11');
      yt.setAttribute('font-family','JetBrains Mono, monospace'); yt.setAttribute('text-anchor','end');
      yt.textContent = t.toFixed(1);
      g.appendChild(yt);
    }
    // axis titles
    const xTitle = document.createElementNS(svgNS,'text');
    xTitle.setAttribute('x', PAD.l + plotW/2); xTitle.setAttribute('y', CH-4);
    xTitle.setAttribute('fill', 'rgba(154,164,191,0.9)'); xTitle.setAttribute('font-size','11.5');
    xTitle.setAttribute('font-family','JetBrains Mono, monospace'); xTitle.setAttribute('text-anchor','middle');
    xTitle.textContent = 'U — Data Uncertainty';
    g.appendChild(xTitle);

    const yTitle = document.createElementNS(svgNS,'text');
    yTitle.setAttribute('x', -CH/2); yTitle.setAttribute('y', 14);
    yTitle.setAttribute('fill', 'rgba(154,164,191,0.9)'); yTitle.setAttribute('font-size','11.5');
    yTitle.setAttribute('font-family','JetBrains Mono, monospace'); yTitle.setAttribute('text-anchor','middle');
    yTitle.setAttribute('transform','rotate(-90)');
    yTitle.textContent = 'H — Hallucination Risk';
    g.appendChild(yTitle);

    return g;
  }

  function curvePathD(z0){
    const steps = 60;
    let d = '';
    for (let i=0; i<=steps; i++){
      const x = i/steps;
      const z = PARAMS.a * x + z0; // z0 already includes bC-cP-dB+k
      const y = sigmoid(z);
      const px = xToPx(x), py = yToPx(y);
      d += (i===0 ? 'M' : 'L') + px.toFixed(2) + ',' + py.toFixed(2) + ' ';
    }
    return d;
  }

  chartSvg.setAttribute('viewBox', `0 0 ${CW} ${CH}`);
  chartSvg.appendChild(buildAxes());

  const pathEls = [];
  scenarios.forEach(sc => {
    const path = document.createElementNS(svgNS,'path');
    path.setAttribute('d', curvePathD(sc.z0));
    path.setAttribute('class', 'curve-path');
    path.setAttribute('stroke', sc.color);
    path.dataset.case = sc.id;
    chartSvg.appendChild(path);
    pathEls.push(path);

    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';
    legendItem.dataset.case = sc.id;
    legendItem.innerHTML = `<span class="legend-swatch" style="background:${sc.color}"></span>
      <div><b>${sc.name}</b><span>${sc.desc}</span></div>`;
    legendWrap.appendChild(legendItem);
  });

  function highlightCase(id){
    pathEls.forEach(p => {
      const match = String(p.dataset.case) === String(id);
      p.classList.toggle('hi', match && id !== null);
      p.classList.toggle('dim', id !== null && !match);
    });
    document.querySelectorAll('.legend-item').forEach(l => {
      l.classList.toggle('hi', String(l.dataset.case) === String(id));
    });
  }
  chartSvg.querySelectorAll('.curve-path').forEach(p => {
    p.addEventListener('mouseenter', () => highlightCase(p.dataset.case));
    p.addEventListener('mouseleave', () => highlightCase(null));
  });
  legendWrap.querySelectorAll('.legend-item').forEach(l => {
    l.addEventListener('mouseenter', () => highlightCase(l.dataset.case));
    l.addEventListener('mouseleave', () => highlightCase(null));
  });

  /* ---------------------------------------------------------
     11. Scenario matrix cards — click to expand
  --------------------------------------------------------- */
  document.querySelectorAll('.scenario-card').forEach(card => {
    card.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');
      document.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('open'));
      if (!isOpen) card.classList.add('open');
    });
  });

  /* ---------------------------------------------------------
     12. Multi-factor systems diagram (SVG, animated flow)
  --------------------------------------------------------- */
  const mfSvg = document.getElementById('multifactor-svg');
  if (mfSvg){
    mfSvg.setAttribute('viewBox', '0 0 900 340');
    const nodes = [
      { x: 90,  y: 60,  label: 'U — Data Uncertainty', sign:'+', color:'#ff6b7a' },
      { x: 90,  y: 150, label: 'C — Question Complexity', sign:'+', color:'#ff6b7a' },
      { x: 90,  y: 240, label: 'P — Prompt Quality', sign:'−', color:'#4fe3d4' },
      { x: 90,  y: 330-40, label: 'B — Context', sign:'−', color:'#4fe3d4' },
    ];
    const hub = { x: 430, y: 150, label: 'Z = aU + bC − cP − dB + k' };
    const out = { x: 760, y: 150, label: 'H — Hallucination Risk' };

    function line(x1,y1,x2,y2,color){
      const l = document.createElementNS(svgNS,'line');
      l.setAttribute('x1',x1); l.setAttribute('y1',y1);
      l.setAttribute('x2',x2); l.setAttribute('y2',y2);
      l.setAttribute('stroke', color || 'rgba(140,160,210,0.4)');
      l.setAttribute('stroke-width','1.6');
      l.setAttribute('class','diagram-flow-line');
      mfSvg.appendChild(l);
    }
    nodes.forEach(n => line(n.x+70, n.y, hub.x-90, hub.y, n.color));
    line(hub.x+90, hub.y, out.x-95, out.y, '#8d7bff');

    function box(x,y,w,h,label,sub,color){
      const g = document.createElementNS(svgNS,'g');
      g.setAttribute('class','diagram-node');
      const r = document.createElementNS(svgNS,'rect');
      r.setAttribute('x', x-w/2); r.setAttribute('y', y-h/2);
      r.setAttribute('width', w); r.setAttribute('height', h);
      r.setAttribute('rx', 10);
      r.setAttribute('fill', 'rgba(18,24,41,0.85)');
      r.setAttribute('stroke', color || 'rgba(140,160,210,0.4)');
      r.setAttribute('stroke-width','1.4');
      g.appendChild(r);
      const t = document.createElementNS(svgNS,'text');
      t.setAttribute('x', x); t.setAttribute('y', y+4);
      t.setAttribute('text-anchor','middle');
      t.setAttribute('fill', '#e9edf7');
      t.setAttribute('font-size','12.5');
      t.setAttribute('font-family','JetBrains Mono, monospace');
      t.textContent = label;
      g.appendChild(t);
      if (sub){
        const s = document.createElementNS(svgNS,'text');
        s.setAttribute('x', x); s.setAttribute('y', y-h/2-8);
        s.setAttribute('text-anchor','middle');
        s.setAttribute('fill', color);
        s.setAttribute('font-size','13');
        s.setAttribute('font-family','Space Grotesk, sans-serif');
        s.textContent = sub;
        g.appendChild(s);
      }
      mfSvg.appendChild(g);
    }
    nodes.forEach(n => box(n.x, n.y, 168, 44, n.label, n.sign, n.color));
    box(hub.x, hub.y, 190, 64, hub.label, null, '#8d7bff');
    box(out.x, out.y, 168, 50, out.label, null, '#8d7bff');
  }

  /* ---------------------------------------------------------
     13. Mobile-friendly nav link click smooth handled by CSS scroll-behavior
  --------------------------------------------------------- */

});
