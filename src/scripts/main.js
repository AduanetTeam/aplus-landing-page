import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

/* SIMA — landing page: interacciones ligadas al scroll */
(() => {
  'use strict';
  const root = document.getElementById('root');
  const $ = (s) => root.querySelector(s);
  const $$ = (s) => [...root.querySelectorAll(s)];
  const c = (v) => Math.max(0, Math.min(1, v));
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Tema claro/oscuro */
  const themeBtn = $('[data-theme-toggle]');
  const setTheme = (t) => {
    root.dataset.theme = t;
    const label = t === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    themeBtn.setAttribute('aria-label', label);
    themeBtn.title = label;
  };
  themeBtn.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
  setTheme('light');

  /* Menú móvil */
  const menu = $('#mobile-menu'), menuBtn = $('[data-menu-toggle]');
  const setMenu = (open) => {
    menu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  matchMedia('(min-width: 920px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* Header glass */
  const header = $('[data-header]');
  const onHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);

  /* Elementos */
  const bar = $('[data-progress]');
  const heroT = $$('[data-hero-text]');
  const mock = $('[data-hero-mock]');
  const fill = $('[data-fill]');
  const timeline = $('[data-timeline]');
  const steps = $$('[data-timeline] > li');
  const balloon = $('[data-balloon]');
  const tour = balloon && balloon.closest('[role="img"]');
  const spin = $('[data-spin]');
  const band = $('[data-sband]');
  const rows = band ? [...band.querySelectorAll('[data-srow]')] : [];
  const items = band ? [...band.querySelectorAll('[data-sitem]')] : [];
    const apCol = $('[data-apcol]');
  const apEls = apCol ? [...apCol.querySelectorAll('[data-ap]')] : [];
  const bnh = $$('[data-bnh]');
  const bnc = $$('[data-bnc]');
  const bng = $('[data-bng]');
  const bars = $$('[data-bar]');
const faqHead = $('[data-faq-head]');
const faqList = $('[data-faq-list]');
const faqItems = $$('[data-faq-item]');

  if (rm) {
    // Sin animaciones: todo visible y estático.
    if (fill) fill.style.transform = 'scaleX(1)';
    window.addEventListener('scroll', onHeader, { passive: true });
    onHeader();
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });

  window.addEventListener('scroll', onHeader, { passive: true });
  onHeader();

  /* Navbar: entrada escalonada al cargar la página */
  const navItems = [$('.logo'), ...$$('.nav-links a'), ...$$('.nav-actions > *')].filter(Boolean);
  gsap.fromTo(navItems, { y: -16, opacity: 0 }, {
    y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.07, delay: 0.1,
    onComplete: () => {
      // Devuelve el control al CSS (por ejemplo, el hover)
      document.documentElement.classList.add('nav-in');
      gsap.set(navItems, { clearProps: 'opacity,transform' });
    },
  });

  /* Barra de progreso de la página */
  gsap.fromTo(bar, { scaleX: 0 }, {
    scaleX: 1, ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: true },
  });

  /* Secuencia escalonada ligada al scroll: cada elemento entra un poco después del anterior.
     `factor` y `step` conservan el ritmo original (l = p * factor - i * step). */
  const sequence = (els, trigger, start, end, { from, factor, step, ease = 'power2.out' }) => {
    if (!els.length) return;
    const tl = gsap.timeline({
      defaults: { ease },
      scrollTrigger: { trigger, start, end, scrub: 0.6 },
    });
    els.forEach((el, i) => {
      tl.fromTo(el, { opacity: 0, ...from(i) },
        { opacity: 1, x: 0, y: 0, scale: 1, duration: 1 / factor }, (i * step) / factor);
    });
    tl.set({}, {}, 1); // la línea de tiempo dura exactamente el recorrido del scroll
  };

  /* Hero: entrada al cargar + salida suave al hacer scroll */
  const heroScrub = (range) => {
    gsap.fromTo(heroT, { y: 0, opacity: 1 }, {
      y: -36, opacity: 0.15, ease: 'none',
      scrollTrigger: { start: 0, end: () => '+=' + window.innerHeight * range[0], scrub: true, invalidateOnRefresh: true },
    });
  };
  const heroMockScrub = (range) => {
    if (!mock) return;
    gsap.fromTo(mock, { rotateX: 7, scale: 0.96, transformPerspective: 1400 }, {
      rotateX: 0, scale: 1, ease: 'none',
      scrollTrigger: { start: 0, end: () => '+=' + window.innerHeight * range[1], scrub: true, invalidateOnRefresh: true },
    });
  };
  const mm = gsap.matchMedia();
  let heroDone = false;
  mm.add({ phone: '(max-width: 759px)', desk: '(min-width: 760px)' }, (ctx) => {
    // En móvil el hero tarda más en desvanecerse: se deja leer y ver el mockup.
    const range = ctx.conditions.phone ? [1.25, 1.25] : [0.6, 0.7];
    heroMockScrub(range);
    const start = () => heroScrub(range);
    if (heroDone) start();
    else {
      const [h1, ...rest] = heroT;
      const split = h1 ? SplitText.create(h1, { type: 'words' }) : null;
      const intro = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => { heroDone = true; if (split) split.revert(); ctx.add(start); },
      });
      if (split) {
        // Título palabra por palabra: sube, se enfoca y aparece.
        gsap.set(h1, { opacity: 1 });
        intro.fromTo(split.words, { yPercent: 55, opacity: 0, filter: 'blur(10px)' },
          { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, stagger: 0.07, clearProps: 'filter' }, 0.05);
      }
      intro.fromTo(rest, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.12 }, 0.45);
      if (mock) intro.fromTo(mock, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, 0.6);
    }
  });

  /* Recorrido del mockup: queda fijo y se llena solo mientras haces scroll.
     Se crea antes que los demás triggers para que sus posiciones cuenten el espacio del pin. */
  const walk = $('[data-walk]');
  if (walk && mock) {
    mm.add('(min-width: 0px)', () => {
      const blank = ' ';
      const saved = [];
      const typed = [...mock.querySelectorAll('.fld:not(.ro):not(.dim)')];
      const pTotal = mock.querySelector('[data-walk-err]');
      const totalUsd = mock.querySelector('[data-walk-calc]');
      const go = mock.querySelector('.go');
      const toastErr = mock.querySelector('.mock-toast.err');
      const bot = mock.querySelector('.mock-bot');
      const botLabel = mock.querySelector('.bot-label');
      const botN = mock.querySelector('.bot-n');
      const botCheck = mock.querySelector('.bot-check');
      const eyesRun = mock.querySelector('.eyes-run');
      const eyesHappy = mock.querySelector('.eyes-happy');
      const panel = mock.querySelector('.mock-panel');
      const labelW = botLabel ? Math.min(botLabel.scrollWidth, window.innerWidth < 600 ? 112 : 400) : 0;
      const stDraft = mock.querySelector('.st-draft');
      const stOk = mock.querySelector('.st-ok');
      const stepEls = $$('[data-walk-step]');
      const fillBar = $('[data-walk-fill]');
      [...typed, totalUsd].filter(Boolean).forEach((el) => saved.push([el, el.textContent]));

      const tl = gsap.timeline({ defaults: { ease: 'none' } });
      // Escribe `full` letra por letra. `initial` es lo que se ve antes de empezar.
      const type = (el, full, at, dur, initial, setInitial) => {
        if (!el) return;
        if (setInitial) el.textContent = initial;
        const o = { n: 0 };
        tl.to(o, {
          n: full.length, duration: dur,
          onUpdate: () => {
            const k = Math.round(o.n);
            el.textContent = k <= 0 ? initial : full.slice(0, k);
            el.classList.toggle('is-typing', k > 0 && k < full.length);
          },
        }, at);
      };

      // Móvil: el mockup es una ventana más baja que su contenido; el contenido baja solo hasta el campo que se valida
      const mainEl = mock.querySelector('.mock-main');
      const bodyEl = mock.querySelector('.mock-body');
      let dy = 0;
      if (matchMedia('(max-width: 759px)').matches && mainEl && bodyEl && pTotal) {
        dy = pTotal.offsetTop - bodyEl.offsetTop - 78; // deja visible la etiqueta del campo
        // .mock-main se estira hasta la altura de la ventana: el alto real del contenido es scrollHeight
        dy = Math.max(0, Math.min(dy, mainEl.scrollHeight - bodyEl.clientHeight));
      }

      // 1. Captura
      typed.forEach((el, i) => type(el, el.textContent.trim(), i * 0.16, 0.22, blank, true));
      // 2. Valida: error, corrección y cálculo automático
      if (pTotal) tl.fromTo(pTotal, { '--err': 0 }, { '--err': 1, duration: 0.25 }, 2.7);
      if (toastErr) tl.fromTo(toastErr, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 2.75);
      if (pTotal) tl.to(pTotal, { '--err': 0, duration: 0.2 }, 3.6);
      type(pTotal, '1,250.00', 3.65, 0.4, '0', false);
      if (toastErr) tl.to(toastErr, { opacity: 0, y: -14, duration: 0.25, ease: 'power2.in' }, 3.85);
      type(totalUsd, '1,250.00', 4.1, 0.3, '0', true);
      // Móvil: sube de nuevo al encabezado (estatus y botón) antes del clic
      if (dy > 0) {
        tl.fromTo(mainEl, { y: 0 }, { y: -dy, duration: 1.4, ease: 'power1.inOut' }, 1.0);
        tl.to(mainEl, { y: 0, duration: 0.35, ease: 'power2.inOut' }, 4.1);
      }
      // 3. Listo: clic en Generar archivo M. El pedimento solo queda "Validado" cuando el bot termina.
      if (go) {
        tl.fromTo(go, { '--glow': 0 }, { '--glow': 1, duration: 0.25 }, 4.5);
        tl.to(go, { scale: 0.93, duration: 0.08 }, 4.8).to(go, { scale: 1, duration: 0.12 }, 4.88);
      }
      if (bot) {
        // En proceso: etiqueta + contador + ojos redondos que miran de lado a lado
        tl.fromTo(bot, { opacity: 0, scale: 0.7, transformOrigin: '100% 50%' }, { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(1.7)' }, 4.95);
        if (eyesRun) tl.fromTo(eyesRun, { x: -1.2 }, { x: 1.2, duration: 0.3, repeat: 1, yoyo: true, ease: 'sine.inOut' }, 5.15);
        // Terminado: la etiqueta se pliega, aparece la palomita y los ojos sonríen
        if (botLabel) tl.fromTo(botLabel, { maxWidth: labelW, opacity: 1 }, { maxWidth: 0, opacity: 0, duration: 0.25 }, 5.65);
        if (botN) tl.fromTo(botN, { maxWidth: 14, opacity: 1 }, { maxWidth: 0, opacity: 0, duration: 0.25 }, 5.65);
        if (botCheck) tl.fromTo(botCheck, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.25 }, 5.65);
        if (eyesRun) tl.fromTo(eyesRun, { opacity: 1 }, { opacity: 0, duration: 0.2 }, 5.65);
        if (eyesHappy) tl.fromTo(eyesHappy, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 5.65);
      }
      // El estatus cambia a Validado en cuanto el bot termina
      if (stDraft) tl.fromTo(stDraft, { opacity: 1 }, { opacity: 0, duration: 0.25 }, 5.7);
      if (stOk) tl.fromTo(stOk, { opacity: 0 }, { opacity: 1, duration: 0.25 }, 5.7);
      if (panel) tl.fromTo(panel, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 5.95);
      // Pasos del pie: el activo se enciende
      const marks = [0, 2.6, 4.5];
      stepEls.forEach((el, i) => {
        if (i > 0) tl.fromTo(el, { opacity: 0.5 }, { opacity: 1, duration: 0.3 }, marks[i]);
        if (i < stepEls.length - 1) tl.to(el, { opacity: 0.5, duration: 0.3 }, marks[i + 1]);
      });
      if (fillBar) tl.fromTo(fillBar, { scaleX: 0 }, { scaleX: 1, duration: 6.4 }, 0);
      tl.set({}, {}, 6.4);

      const off = () => Math.max(header.offsetHeight + 28, Math.round((window.innerHeight - walk.offsetHeight) / 2));
      const pin = ScrollTrigger.create({
        trigger: walk, pin: true, refreshPriority: 1, invalidateOnRefresh: true,
        start: () => 'top ' + off() + 'px',
        end: () => '+=' + window.innerHeight * 2.5,
      });
      // La escritura arranca con el primer scroll y termina cuando se suelta el pin.
      ScrollTrigger.create({
        animation: tl, trigger: walk, scrub: 0.5, invalidateOnRefresh: true,
        start: 'top 62%', end: () => pin.end,
      });

      return () => saved.forEach(([el, t]) => { el.textContent = t; el.classList.remove('is-typing'); });
    });
  }

  /* Reveal genérico */
  $$('[data-reveal]').forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 28 }, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  /* Línea de tiempo: la línea avanza con el scroll y activa cada paso */
  const setStep = (li, on) => {
    if (li._on === on) return;
    li._on = on;
    gsap.to(li, { opacity: on ? 1 : 0.4, duration: 0.45, overwrite: true });
    gsap.to(li.firstElementChild, { scale: on ? 1.6 : 1, duration: 0.45, ease: 'back.out(2)', overwrite: true });
  };
  if (timeline && fill) {
    mm.add('(min-width: 600px)', () => {
      steps.forEach((li) => { li._on = false; gsap.set(li, { opacity: 0.4 }); });
      const upd = (self) => steps.forEach((li, i) => setStep(li, self.progress >= i * 0.25 + 0.02));
      gsap.fromTo(fill, { scaleX: 0, scaleY: 1 }, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: timeline, start: 'top 80%', end: 'top 35%', scrub: true, onUpdate: upd, onRefresh: upd },
      });
    });
    mm.add('(max-width: 599px)', () => {
      // Móvil: pasos en columna; la línea baja con el scroll y activa cada paso al alcanzarlo.
      steps.forEach((li) => {
        li._on = false; gsap.set(li, { opacity: 0.4 });
        ScrollTrigger.create({
          trigger: li, start: 'top 70%', end: 'max',
          onEnter: () => setStep(li, true), onLeaveBack: () => setStep(li, false),
        });
      });
      gsap.fromTo(fill, { scaleY: 0, scaleX: 1 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: timeline, start: 'top 70%', end: 'bottom 70%', scrub: true },
      });
    });
  }

  /* Banda de módulos (pin): dos filas que cruzan en sentidos opuestos */
  if (band && spin && rows.length) {
    const fade = () => {
      const r = band.getBoundingClientRect(), mid = r.left + r.width / 2;
      items.forEach((it) => {
        const ir = it.getBoundingClientRect();
        const d = Math.abs(ir.left + ir.width / 2 - mid) / (r.width * 0.62);
        it.style.opacity = (0.4 + 0.6 * Math.pow(c(1 - d), 0.7)).toFixed(2);
      });
    };
    const tl = gsap.timeline({
      onUpdate: fade,
      scrollTrigger: {
        trigger: spin, scrub: 0.8, invalidateOnRefresh: true, onRefresh: fade,
        start: () => 'top ' + (window.innerHeight * 0.5 - 55) + 'px',
        end: () => '+=' + Math.max(1, spin.offsetHeight - 110),
      },
    });
    rows.forEach((row) => {
      const dir = +row.dataset.srow;
      tl.fromTo(row,
        { x: () => (dir > 0 ? band.clientWidth : -row.scrollWidth) },
        { x: () => (dir > 0 ? -row.scrollWidth : band.clientWidth), ease: 'none', duration: 1 }, 0);
    });
  }

  /* Aprende mientras trabajas */
  sequence(apEls, apCol, 'top 105%', 'top 50%', {
    factor: 4.2, step: 0.9, from: (i) => ({ x: i > 1 ? -28 : 0, y: 46 }),
  });

  /* Globo del recorrido guiado */
  if (tour && balloon) {
    gsap.timeline({ scrollTrigger: { trigger: tour, start: 'top 80%', end: 'top 40%', scrub: 0.6 } })
      .fromTo(balloon, { opacity: 0, y: 12, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, ease: 'power2.out', duration: 0.6 }, 0.4);
  }

  /* Gráfica de barras de la primera tarjeta (la escala vive en la variable CSS --s) */
  if (bars.length) {
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: bars[0].ownerSVGElement, start: 'top 92%', end: 'top 52%', scrub: 0.6 },
    });
    bars.forEach((el, i) => tl.fromTo(el, { '--s': 0 }, { '--s': 1, duration: 1 / 1.9 }, (i * 0.18) / 1.9));
    tl.set({}, {}, 1);
  }

  /* Beneficios */
  sequence(bnh, bnh[0], 'top 90%', 'top 52%', { factor: 3, step: 0.85, from: () => ({ y: 38 }) });
  if (bng && bnc.length) {
    // Tarjetas apiladas (móvil/tablet): cada una se anima al llegar a su propia posición.
    // En rejilla, las tarjetas entran escalonadas según el avance de la rejilla completa.
    const stacked = () => bnc.some((el) => el.offsetTop - bnc[0].offsetTop > 10);
    const pct = (v) => 'top ' + (v * 100).toFixed(2) + '%';
    bnc.forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 70, scale: 0.94 }, {
        opacity: 1, y: 0, scale: 1, ease: 'power2.out',
        scrollTrigger: {
          trigger: el, scrub: 0.6, invalidateOnRefresh: true,
          start: () => (stacked() ? 'top 95%' : pct(0.96 - i * 0.25 * 0.62)),
          end: () => (stacked() ? 'top 60%' : pct(0.96 - ((i * 0.75 + 1) / 3) * 0.62)),
        },
      });
    });
  }

  /* Preguntas frecuentes */
  sequence([faqHead, ...faqItems].filter(Boolean), faqList, 'top 95%', 'top 40%', {
    factor: 3.6, step: 0.4, from: () => ({ y: 40 }),
  });

  /* Contadores: las cifras de beneficios cuentan hasta su valor al entrar */
  $$('.card .big').forEach((big) => {
    const full = big.textContent.trim();
    const nums = (full.match(/\d+/g) || []).map(Number);
    if (!nums.length || Math.max(...nums) <= 1) return;
    const vis = document.createElement('span');
    vis.setAttribute('aria-hidden', 'true');
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = full;
    big.textContent = '';
    big.append(vis, sr);
    const render = (p) => { vis.textContent = full.replace(/\d+/g, (n) => Math.round(n * p)); };
    render(0);
    const o = { p: 0 };
    gsap.to(o, {
      p: 1, duration: 1.8, ease: 'power2.out', onUpdate: () => render(o.p),
      scrollTrigger: { trigger: big, start: 'top 88%', once: true },
    });
  });

  /* Recalcula posiciones cuando cargan las fuentes y el resto de recursos */
  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener('load', refresh);
})();

/* Recorrido guiado: botones Anterior / Siguiente */
(() => {
  const balloon = document.querySelector('[data-balloon]');
  if (!balloon) return;
  const stepEl = balloon.querySelector('[data-tour-step]');
  const titleEl = balloon.querySelector('[data-tour-title]');
  const bodyEl = balloon.querySelector('[data-tour-body]');
  const segs = [...balloon.querySelectorAll('[data-tour-segs] i')];
  const prev = balloon.querySelector('[data-tour-prev]');
  const next = balloon.querySelector('[data-tour-next]');
  const steps = [
    ['Bienvenido a SIMA', 'Te mostramos en un minuto dónde capturar cada dato de un pedimento.'],
    ['Crea tu primer pedimento', 'Elige el tipo de operación y la clave. Los datos del cliente se llenan desde el catálogo.'],
    ['Captura los datos generales', 'Completa transporte, valores e incrementables; los catálogos sugieren lo que ya usaste.'],
    ['Agrega partidas', 'Reutiliza números de parte y fracciones. Las contribuciones se calculan solas.'],
    ['Valida y deja listo', 'Revisa las alertas, corrige lo pendiente y deja el pedimento listo para pagar.'],
  ];
  let i = 1, timer = 0;
  const render = () => {
    stepEl.textContent = 'Paso ' + (i + 1) + ' de ' + steps.length;
    titleEl.textContent = steps[i][0];
    bodyEl.textContent = steps[i][1];
    segs.forEach((s, k) => s.classList.toggle('on', k === i));
    prev.disabled = i === 0;
    next.textContent = i === steps.length - 1 ? 'Reiniciar' : 'Siguiente';
  };
  const go = (n) => {
    clearTimeout(timer);
    balloon.classList.add('swap');
    timer = setTimeout(() => { i = n; render(); balloon.classList.remove('swap'); }, 160);
  };
  prev.addEventListener('click', () => { if (i > 0) go(i - 1); });
  next.addEventListener('click', () => go(i < steps.length - 1 ? i + 1 : 0));
  render();
})();

/* Formulario de demo: envía los datos por correo con Web3Forms (https://web3forms.com).
   La clave de acceso es pública por diseño; se define en .env como PUBLIC_WEB3FORMS_KEY. */
(() => {
  const form = document.getElementById('demo-form');
  const sent = document.getElementById('demo-sent');
  if (!form || !sent) return;
  const err = form.querySelector('[data-form-error]');
  const btn = form.querySelector('button[type="submit"]');
  const label = btn.textContent;
  const KEY = import.meta.env.PUBLIC_WEB3FORMS_KEY;
  const GENERIC = 'No pudimos enviar tu solicitud. Inténtalo de nuevo o escribe a ventas@aduanet.net.';
  const fail = (msg) => { err.textContent = msg; err.hidden = false; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.hidden = true;
    const d = new FormData(form);
    if (d.get('botcheck')) return; // trampa anti-spam: un bot marcó el campo oculto
    if (!KEY) {
      console.error('Falta PUBLIC_WEB3FORMS_KEY: define la clave de Web3Forms en .env (ver .env.example).');
      return fail(GENERIC);
    }
    btn.disabled = true;
    btn.textContent = 'Enviando…';
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: KEY,
          subject: 'Solicitud de demo SIMA — ' + d.get('empresa'),
          from_name: 'Landing SIMA',
          name: d.get('nombre'),
          email: d.get('correo'),
          Empresa: d.get('empresa'),
          message: d.get('mensaje') || '(sin mensaje)',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || 'HTTP ' + res.status);
      form.hidden = true;
      sent.hidden = false;
      sent.focus();
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      fail(GENERIC);
      btn.disabled = false;
      btn.textContent = label;
    }
  });
})();

/* FAQ: animación de apertura y cierre de cada pregunta */
(() => {
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.faq details').forEach((d) => {
    const summary = d.querySelector('summary');
    const body = d.querySelector('p');
    let anim = null;
    d.addEventListener('toggle', () => d.classList.toggle('is-open', d.open));
    summary.addEventListener('click', (e) => {
      if (rm) return;
      e.preventDefault();
      const opening = !d.open;
      const borders = d.offsetHeight - d.clientHeight;
      const start = d.offsetHeight;
      if (anim) anim.cancel();
      let end;
      if (opening) { d.open = true; end = d.offsetHeight; }
      else { end = summary.offsetHeight + borders; }
      d.classList.toggle('is-open', opening);
      const opts = { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' };
      anim = d.animate({ height: [start + 'px', end + 'px'] }, opts);
      body.animate({ opacity: opening ? [0, 1] : [1, 0] }, { duration: 300, easing: 'ease' });
      const done = () => { d.open = opening; anim = null; };
      anim.onfinish = done;
      anim.oncancel = () => { anim = null; };
    });
  });
})();

/* Enlaces a #contacto: centran el formulario en la pantalla (el ancla sola dejaba el degradado vacío arriba) */
(() => {
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#contacto"]');
    const block = document.querySelector('.contact-in');
    if (!a || !block) return;
    e.preventDefault();
    // Solo la barra (no el menú móvil desplegado, que también vive dentro del header)
    const bar = document.querySelector('[data-header] .nav');
    const top = (bar ? bar.offsetHeight : 64) + 16;
    // getBoundingClientRect incluye el desplazamiento de la animación de entrada: se descuenta
    const lift = Number(gsap.getProperty(block, 'y')) || 0;
    const r = block.getBoundingClientRect();
    const h = r.height;
    const blockTop = window.scrollY + r.top - lift;
    const centered = blockTop + h / 2 - window.innerHeight / 2;
    // Si el bloque es más alto que la pantalla, se alinea bajo el header
    const y = h > window.innerHeight - top * 2 ? blockTop - top : centered;
    window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: rm ? 'auto' : 'smooth' });
    history.pushState(null, '', '#contacto');
  });
})();
