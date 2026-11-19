// The welcome. Before the town builds, the guide bot floats in the open sky and asks two things, like a
// chat: how it should sound (music and sounds, just sounds, or silent) and what light to see it in (day,
// night, or the visitor's own time). Every choice previews straight away, right behind the bot: pick
// night and the sky turns to stars; pick music and it fades in. The bot hops and grins at each answer.
// Then "Let's go": the bubble folds back into the bot, it does a little hop and dives down to the street,
// and the town builds up where it lands (intro.js starts on the 'tix-leaving' event).
//
// Enter or Escape goes in too. The choice is remembered; the welcome comes back on every visit with the
// last choices already picked (and the chat already typed out), and the footer can reopen it.
import { gsap } from 'gsap';
import { sfx, setSoundMode, unlockSound } from './sfx.js';
import { buddySvg } from './town.js';

const KEY = 'hv-prefs';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } };
const I = {
  all: '<svg viewBox="0 0 20 20"><path d="M8 14.5V4.5l8-2v10"/><circle cx="5.8" cy="14.6" r="2.2"/><circle cx="13.8" cy="12.6" r="2.2"/></svg>',
  fx: '<svg viewBox="0 0 20 20"><path d="M3 8h3l4-3.5v11L6 12H3z"/><path d="M13 7.5a3.5 3.5 0 0 1 0 5"/></svg>',
  off: '<svg viewBox="0 0 20 20"><path d="M3 8h3l4-3.5v11L6 12H3z"/><path d="M13.5 8l4 4m0-4l-4 4"/></svg>',
  day: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="3.6"/><path d="M10 1.8v2.2M10 16v2.2M1.8 10H4M16 10h2.2M4.2 4.2l1.6 1.6M14.2 14.2l1.6 1.6M4.2 15.8l1.6-1.6M14.2 5.8l1.6-1.6"/></svg>',
  night: '<svg viewBox="0 0 20 20"><path d="M16.5 12.2A7 7 0 0 1 7.8 3.5a7 7 0 1 0 8.7 8.7z"/></svg>',
  auto: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.4"/><path d="M10 5.6V10l3 2"/></svg>',
};
const SOUND = [['all', 'Music & sounds'], ['fx', 'Just sounds'], ['off', 'Silent']];
const LIGHT = [['day', 'Day'], ['night', 'Night'], ['auto', 'My time']];
export const SOUND_LABEL = Object.fromEntries(SOUND);
export const SOUND_ICON = I;

// what "my time" means: evening and night by the visitor's own clock
export const nightByClock = () => { const h = new Date().getHours(); return h >= 19 || h < 6; };

export function initPrefs({ reduced, lenis, music, setNight }) {
  const root = document.documentElement;
  const saved = read();
  const prefs = { sound: saved?.sound || 'fx', light: saved?.light || 'auto' };
  setSoundMode(prefs.sound);
  root.dataset.sound = prefs.sound;

  // "music and sounds": music needs a gesture, so it starts on the first tap anywhere after a return visit
  if (saved?.sound === 'all') addEventListener('pointerdown', () => { if (prefs.sound === 'all') music.play(); }, { once: true, capture: true });
  addEventListener('pointerdown', () => unlockSound(), { once: true, capture: true });

  function applySound(s, { preview } = {}) {
    prefs.sound = s;
    setSoundMode(s);
    root.dataset.sound = s;
    if (s === 'all') music.play(); else music.pause();
    if (preview) { unlockSound(); sfx('select'); }
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
      if (prefs.light === 'auto') localStorage.removeItem('hv-mode'); else localStorage.setItem('hv-mode', prefs.light);
    } catch { /* private mode: it just won't be remembered */ }
  }

  let open = false, done = () => {};
  function show({ first } = {}) {
    if (open) return Promise.resolve();
    open = true;
    const returning = !!saved || !first; // they've been here: no typing, the chat is already there
    const scene = document.createElement('div');
    scene.className = `tix-scene gw${first ? ' first' : ''}`;
    scene.setAttribute('role', 'dialog');
    scene.setAttribute('aria-modal', 'true');
    scene.setAttribute('aria-labelledby', 'gw-h');
    const group = (name, q, opts, cur) => `<fieldset class="gw-row"><legend class="gw-q">${q}</legend><div class="gw-opts">${opts.map(([v, l]) =>
      `<label class="gw-opt"><input type="radio" name="gw-${name}" value="${v}"${v === cur ? ' checked' : ''}><span>${I[v]}${l}</span></label>`).join('')}</div></fieldset>`;
    scene.innerHTML = `<div class="gw-wrap">
      <div class="gw-bot" aria-hidden="true"><div class="gw-bot-in"><div class="gw-float">${buddySvg()}<svg class="gw-happy" viewBox="-40 -80 80 96"><path d="M-10.6 -45.5 q3.3 -5.6 6.6 0 M4 -45.5 q3.3 -5.6 6.6 0"/></svg></div></div></div>
      <div class="gw-card">
        <p class="gw-hi hand">${first ? (saved ? 'Welcome back!' : 'Hey, welcome!') : 'Change of plan?'}</p>
        <h2 class="gw-h" id="gw-h">${first ? 'I’m the guide in Hardik’s town. Two quick things before we go in.' : 'Pick again, then back to the town.'}</h2>
        ${group('sound', 'How should it sound?', SOUND, prefs.sound)}
        ${group('light', 'Day or night?', LIGHT, prefs.light)}
        <div class="gw-go-row"><button class="gw-go" type="button">${first ? 'Let’s go' : 'Back to town'} <span aria-hidden="true">→</span></button><span class="gw-fine">You can change these any time from the top bar.</span></div>
      </div>
    </div>`;
    document.body.append(scene);
    root.classList.add('tix-open');
    lenis?.stop();
    const bot = scene.querySelector('.gw-bot'), botIn = scene.querySelector('.gw-bot-in'), card = scene.querySelector('.gw-card');
    const go = scene.querySelector('.gw-go');
    const steps = [...scene.querySelectorAll('.gw-hi, .gw-h, .gw-row, .gw-go-row')];

    // the bot is happy about every answer: a hop, a squash on landing, a grin
    let grin = 0, arrive = null;
    function cheer() {
      if (reduced) return;
      bot.classList.add('happy'); clearTimeout(grin); grin = setTimeout(() => bot.classList.remove('happy'), 900);
      gsap.timeline()
        .to(botIn, { y: -18, scaleY: 1.06, scaleX: 0.96, duration: 0.2, ease: 'power2.out' })
        .to(botIn, { y: 0, scaleY: 0.9, scaleX: 1.08, duration: 0.18, ease: 'power2.in' })
        .to(botIn, { scaleY: 1, scaleX: 1, duration: 0.5, ease: 'elastic.out(1.1, 0.4)' });
    }

    // choices preview live
    scene.addEventListener('change', (e) => {
      const { name, value } = e.target;
      if (name === 'gw-sound') applySound(value, { preview: true });
      if (name === 'gw-light') {
        prefs.light = value;
        setNight(value === 'night' || (value === 'auto' && nightByClock()));
        sfx('tick');
      }
      cheer();
    });

    // arrive: the bot floats up into view and waves; the lines come in one by one (all at once for returning visitors)
    if (!reduced) {
      gsap.set(botIn, { transformOrigin: '50% 100%' });
      const tl = arrive = gsap.timeline({ delay: first ? 0.15 : 0 });
      tl.fromTo(bot, { y: 60, autoAlpha: 0, scale: 0.6 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.6)' }, 0)
        .call(() => sfx('pop'), null, 0.15)
        .fromTo(card, { y: 24, autoAlpha: 0, scale: 0.92, transformOrigin: '50% 0%' }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }, 0.25);
      if (returning) {
        tl.from(steps, { y: 10, autoAlpha: 0, stagger: 0.05, duration: 0.4, ease: 'power2.out' }, 0.35);
      } else {
        // the lines arrive one by one, like messages
        tl.from(steps, { y: 14, autoAlpha: 0, stagger: 0.12, duration: 0.5, ease: 'back.out(1.6)' }, 0.4)
          .call(() => sfx('tick'), null, 0.4);
      }
    }
    requestAnimationFrame(() => scene.querySelector('input:checked')?.focus({ preventScroll: true }));

    // keep focus inside; Enter (anywhere) and Escape go in
    scene.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || (e.key === 'Enter' && e.target !== go)) { e.preventDefault(); enter(); return; }
      if (e.key !== 'Tab') return;
      const f = [...scene.querySelectorAll('input:checked, button')];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    });
    go.addEventListener('click', () => enter());

    // dev only: a handle for stepping through it
    if (import.meta.env.DEV) window.__gw = { enter: () => enter() };

    let entered = false;
    function enter() {
      if (entered) return;
      entered = true;
      save();
      unlockSound();
      const finish = () => {
        scene.remove();
        root.classList.remove('tix-open');
        if (!root.classList.contains('intro')) lenis?.start(); // the intro lets go of the page itself
        open = false;
        done();
      };
      const leave = () => dispatchEvent(new Event('tix-leaving'));
      if (reduced) { leave(); gsap.to(scene, { autoAlpha: 0, duration: 0.25, onComplete: finish }); return; }
      arrive?.progress(1).kill(); // a quick Enter lands everything where it belongs first
      bot.classList.add('happy');
      const b = bot.getBoundingClientRect();
      const dive = innerHeight - b.top + 40; // down past the bottom of the screen, where the street will be
      const tl = gsap.timeline({ onComplete: finish });
      if (import.meta.env.DEV) window.__gw.tl = tl;
      tl
        // the button gives a satisfying press
        .to(go, { scale: 0.94, duration: 0.08, ease: 'power2.out' })
        .to(go, { scale: 1, duration: 0.4, ease: 'elastic.out(1.2, 0.4)' })
        // the chat folds back up into the bot
        .to(card, { scale: 0.2, y: -40, autoAlpha: 0, transformOrigin: '50% 0%', duration: 0.38, ease: 'back.in(1.6)' }, 0.06)
        .call(() => sfx('whoosh'), null, 0.2)
        // the bot crouches, springs up with a spin of joy...
        .to(botIn, { scaleY: 0.78, scaleX: 1.14, duration: 0.14, ease: 'power2.out' }, 0.3)
        .to(bot, { y: -70, rotation: 360, duration: 0.46, ease: 'power2.out' }, 0.44)
        .to(botIn, { scaleY: 1.1, scaleX: 0.92, duration: 0.2, ease: 'power2.out' }, 0.44)
        // ...and dives down to the street; the town starts building as it goes
        .call(leave, null, 0.72)
        .to(bot, { y: dive, scale: 0.55, duration: 0.55, ease: 'power3.in' }, 0.9)
        .to(botIn, { scaleY: 1.25, scaleX: 0.85, duration: 0.4, ease: 'power2.in' }, 0.9)
        .call(() => trail(), null, 0.95)
        .to(scene, { '--gw-veil': 0, duration: 0.6, ease: 'power1.out' }, 0.7)
        .to(bot, { autoAlpha: 0, duration: 0.15 }, 1.32);
    }
    // a few sparkles left hanging where the bot dived through
    function trail() {
      const b = bot.getBoundingClientRect();
      for (let k = 0; k < 10; k++) {
        const s = document.createElement('i');
        s.className = 'gw-spark';
        s.style.cssText = `left:${b.left + b.width / 2}px;top:${b.top + b.height * 0.4}px`;
        scene.append(s);
        gsap.fromTo(s, { x: 0, y: 0, scale: gsap.utils.random(0.5, 1.2), autoAlpha: 1 }, {
          x: gsap.utils.random(-50, 50), y: gsap.utils.random(-60, 40), scale: 0, autoAlpha: 0,
          duration: gsap.utils.random(0.6, 1.1), delay: k * 0.03, ease: 'power2.out', onComplete: () => s.remove(),
        });
      }
    }
    return new Promise((ok) => { done = ok; });
  }

  // every visit opens with the welcome (with the last choices already picked); the intro waits on it
  const gate = show({ first: true });

  // the top-bar sound button cycles music & sounds → just sounds → silent
  function cycle() {
    const order = ['all', 'fx', 'off'];
    applySound(order[(order.indexOf(prefs.sound) + 1) % 3]);
    if (prefs.sound !== 'off') { unlockSound(); sfx('select'); }
    save();
    return prefs.sound;
  }
  // the balloon's radio: music on or off, sounds stay as they are
  function setMusic(on) {
    applySound(on ? 'all' : (prefs.sound === 'all' ? 'fx' : prefs.sound));
    save();
  }
  return { gate, reopen: () => show(), cycle, setMusic, get sound() { return prefs.sound; } };
}
