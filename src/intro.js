// The intro: the town builds itself. Once the ticket is torn, the far skyline rises out of the haze, then
// each building springs up from the ground, left to right, landing with a little bounce, while the street and the trees slide in underneath. "hey, I'm Hardik Verma" writes
// itself on, the headline comes into focus, the strike-through gag plays, and the tags pop up last.
//
// Smoothness: only transforms, opacity and (once, on the headline) a blur animate. Each building and its
// night lights scale from the same point at the foot of the building, so they stay in step.
//
// On every load, reloads included; never for reduced motion. Any click, key or scroll while it plays
// fast-forwards it: it should welcome people, never hold them up.
// index.html adds .intro and .intro-hide to <html> before the first paint.
import { gsap } from 'gsap';

const CAP = 450; // the most we wait for the page to settle before starting anyway (ms)
const ORDER = ['tcs', 'fidelity', 'lab', 'tower', 'press', 'home']; // left to right along the street

// Resolves once the intro is over (straight away when it doesn't run), so heavy page work can wait for it.
export function runIntro({ reduced, onDone, onSwap, gate = Promise.resolve(), boot = Promise.resolve() }) {
  let done;
  const over = new Promise((ok) => { done = ok; });
  const root = document.documentElement;
  let active = null, hurry = false, hurried;
  const skipped = new Promise((ok) => { hurried = ok; });
  const SKIP = ['pointerdown', 'keydown', 'wheel', 'touchmove'];
  const skip = () => { hurry = true; active?.timeScale(4); hurried(); };
  const finish = () => {
    SKIP.forEach((ev) => removeEventListener(ev, skip));
    root.classList.remove('intro', 'intro-hide');
    onDone?.();
    done();
  };
  const stage = document.getElementById('stage'), scene = document.getElementById('scene');
  if (reduced || !root.classList.contains('intro') || !stage || !scene) { finish(); return over; }

  // dev only: record frame gaps through the whole intro, to check it stays smooth
  if (import.meta.env.DEV) window.__gsap = gsap; // dev only: slow the intro down to look at it
  if (import.meta.env.DEV) { const g = (window.__introFrames = []); window.__introT0 = performance.now(); let last = performance.now(); const tick = (t) => { g.push([t - window.__introT0, t - last]); last = t; if (root.classList.contains('intro')) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }

  // Start only once the page has settled: loaded, fonts in, and a few steady frames in a row, so the boot
  // work never lands in the middle of the motion. A slow image can't hold it past CAP.
  const loaded = new Promise((ok) => (document.readyState === 'complete' ? ok() : addEventListener('load', ok, { once: true })));
  const fonts = document.fonts?.ready ?? Promise.resolve();
  const steady = () => new Promise((ok) => {
    let calm = 0, last = performance.now();
    const f = (t) => { calm = t - last < 24 ? calm + 1 : 0; last = t; if (calm >= 4) ok(); else requestAnimationFrame(f); };
    requestAnimationFrame(f);
  });
  // on a first visit the entry ticket (prefs.js) comes first: the town waits until it's torn, and only
  // then can a click fast-forward it (choosing on the ticket mustn't skip it)
  let started = false;
  const leaving = new Promise((ok) => addEventListener('tix-leaving', ok, { once: true }));
  Promise.race([gate, leaving]).then(() => {
    SKIP.forEach((ev) => addEventListener(ev, skip, { passive: true }));
    const cap = new Promise((ok) => setTimeout(ok, CAP));
    Promise.race([Promise.all([loaded, fonts, boot]).then(steady), cap, skipped]).then(() => { if (!started) { started = true; build(); } });
  });

  function build() {
    const $ = (s) => scene.querySelector(s), $$ = (s) => [...scene.querySelectorAll(s)];
    const far = $('.ly-far > svg'), street = $('.ly-street > svg'), fg = $('.ly-fg > svg');
    const midArt = $('.ly-mid .art');
    // the mid layer's backdrop (the dark skyline behind the six buildings, shadows, the sun's wash)
    const backdrop = midArt ? [...midArt.children].filter((el) => el.tagName !== 'defs' && !el.classList.contains('bld')) : [];
    const hello = document.querySelector('.hello'), h1 = document.querySelector('.h1');
    const rest = [...document.querySelectorAll('.hero-copy > *:not(.hello):not(.h1)')];
    const pins = [...document.querySelectorAll('.pin')], tags = pins.map((p) => p.querySelector('.pin-tag')).filter(Boolean);
    const extras = [...document.querySelectorAll('.town-dir, .balloon-lane, .fly-cue, .tap-hint')];
    const bar = document.getElementById('top-bar');

    // where each building stands, measured before anything is squashed
    // Each building and its night lights spring inside a wrapper group of their own, so the motion never
    // touches the building itself (its hover lift is a CSS transform with a transition; sharing that
    // property made the town shift when the intro let go). The wrappers stay: at rest they do nothing.
    const wrap = (el) => {
      if (el.parentNode.classList?.contains('intro-wrap')) return el.parentNode;
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'intro-wrap');
      el.parentNode.insertBefore(g, el); g.append(el);
      return g;
    };
    const blds = ORDER.map((id) => {
      const el = $(`.ly-mid .bld[data-id="${id}"]`);
      if (!el) return null;
      const b = el.getBBox();
      return { id, els: [el, ...$$(`.ly-mid .bl[data-b="${id}"]`)].map(wrap), origin: `${b.x + b.width / 2} ${b.y + b.height}` };
    }).filter(Boolean);

    // a soft burst of light behind the town as it lands
    const glow = document.createElement('div');
    glow.className = 'intro-glow';
    stage.insertBefore(glow, stage.firstChild.nextSibling);

    // starting positions, all set in one go, then the page is let out of hiding in the same frame
    gsap.set(scene, { scale: 1.07, transformOrigin: '50% 100%', force3D: true });
    gsap.set(far, { y: 90, autoAlpha: 0 });
    gsap.set(backdrop, { autoAlpha: 0 }); // some of these carry their own position: fade only
    blds.forEach((b) => gsap.set(b.els, { scaleY: 0, scaleX: 0.86, svgOrigin: b.origin }));
    gsap.set(street, { y: 60, autoAlpha: 0 });
    gsap.set(fg, { y: 140, autoAlpha: 0 });
    gsap.set(glow, { autoAlpha: 0, scale: 0.35 });
    if (hello) gsap.set(hello, { clipPath: 'inset(-20% 100% -40% 0)' });
    if (h1) gsap.set(h1, { y: 34, autoAlpha: 0, filter: 'blur(14px)' });
    gsap.set(rest, { y: 28, autoAlpha: 0 });
    // the tag's position comes from a CSS translate on .pin, so only its opacity animates; the pop is on the tag inside
    gsap.set(pins, { autoAlpha: 0 }); gsap.set(tags, { scale: 0.4, y: 14, transformOrigin: '50% 100%' });
    gsap.set(extras, { autoAlpha: 0 }); // some carry CSS translate/rotate of their own: fade only
    if (bar) gsap.set(bar, { autoAlpha: 0, y: -18 });
    root.classList.remove('intro-hide');

    const tl = active = gsap.timeline({ paused: true, onComplete: cleanup });
    if (hurry) tl.timeScale(4);
    const BLD_AT = 0.32, BLD_GAP = 0.1;

    tl.to(scene, { scale: 1, duration: 2.6, ease: 'power2.out' }, 0)
      .to(glow, { autoAlpha: 1, scale: 1, duration: 1.3, ease: 'power2.out' }, 0.15)
      .to(glow, { autoAlpha: 0, duration: 1.4, ease: 'power1.inOut' }, 1.7)
      .to(far, { y: 0, autoAlpha: 1, duration: 1.2, ease: 'power3.out' }, 0)
      .to(backdrop, { autoAlpha: 1, duration: 0.9, ease: 'power2.out' }, 0.1)
      .to(street, { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out' }, 0.18);

    // each building springs up from its foot, left to right
    blds.forEach((b, i) => {
      const at = BLD_AT + i * BLD_GAP;
      tl.to(b.els, { scaleY: 1, duration: 1.15, ease: 'elastic.out(1, 0.5)' }, at)
        .to(b.els, { scaleX: 1, duration: 0.9, ease: 'back.out(2)' }, at + 0.05);
    });

    tl.to(fg, { y: 0, autoAlpha: 1, duration: 1.1, ease: 'back.out(1.3)' }, 0.6);

    // the words: the hello writes on, the headline pulls into focus, the gag plays, the rest follows
    if (hello) tl.to(hello, { clipPath: 'inset(-20% 0% -40% 0)', duration: 0.9, ease: 'power1.inOut' }, 0.3);
    if (h1) tl.to(h1, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 1.05, ease: 'power3.out' }, 0.5);
    tl.call(() => onSwap?.(), null, 1.45)
      .to(rest, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.8, ease: 'power3.out' }, 0.85);
    if (bar) tl.to(bar, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out' }, 1);
    tl.to(pins, { autoAlpha: 1, stagger: 0.07, duration: 0.3, ease: 'power1.out' }, 1.3)
      .to(tags, { scale: 1, y: 0, stagger: 0.07, duration: 0.7, ease: 'back.out(2.4)' }, 1.3)
      .to(extras, { autoAlpha: 1, stagger: 0.06, duration: 0.6, ease: 'power2.out' }, 1.5)
      .to({}, { duration: 0.2 });

    function cleanup() {
      if (import.meta.env.DEV) window.__introSnap?.('before'); // dev only: check nothing moves at the hand-off
      glow.remove();
      gsap.set([scene, far, street, fg, ...blds.flatMap((b) => b.els)], { clearProps: 'transform,opacity,visibility' });
      gsap.set(backdrop, { clearProps: 'opacity,visibility' });
      gsap.set([hello, h1, ...rest, ...pins, ...tags, ...extras, bar].filter(Boolean), { clearProps: 'transform,opacity,visibility,filter,clipPath' });
      if (import.meta.env.DEV) window.__introSnap?.('after');
      finish();
    }

    // two frames for the starting styles to settle, then go
    requestAnimationFrame(() => requestAnimationFrame(() => tl.play()));
  }
  return over;
}
