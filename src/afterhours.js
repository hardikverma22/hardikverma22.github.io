// AFTER HOURS: side projects, shown as they really are. A numbered list on the left; the picked project's
// real screen on the right (a live screenshot, the terminal output, or the film itself), with what it does,
// the stack and links. Hover, focus or click picks a project. On phones each project is a plain card.
// One list in the DOM for both layouts: each item holds its header and its panel; on wide screens the
// panels share one grid cell on the right and only the picked one shows.

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const asset = (p) => `${import.meta.env.BASE_URL}${p}`;

export function initAfterHours(root, projects, { sfx = () => {}, reduced = false } = {}) {
  root.innerHTML = `<ol class="ah-list">${projects.map((p, i) => {
    const media = p.media
      ? `<video class="ah-media" muted loop playsinline preload="none" poster="${asset(p.poster)}" data-src="${asset(p.media)}" aria-label="${esc(p.name)}: a film it made"></video>`
      : `<img class="ah-media" src="${asset(p.poster)}" alt="${esc(p.name)}: ${esc(p.line)}" loading="lazy" decoding="async" width="1200" height="750">`;
    const links = `${p.live ? `<a class="ah-go" href="${p.live}" target="_blank" rel="noopener">Open it <span aria-hidden="true">↗</span></a>` : ''}${p.code ? `<a class="ah-go${p.live ? ' alt' : ''}" href="${p.code}" target="_blank" rel="noopener">${p.live ? 'Code' : 'See the code'} <span aria-hidden="true">↗</span></a>` : ''}`;
    return `<li class="ah-item${i === 0 ? ' on' : ''}" style="--i:${i + 1}">
      <button class="ah-row" type="button" aria-expanded="${i === 0}" aria-controls="ah-p${i}">
        <span class="ah-n">${String(i + 1).padStart(2, '0')}</span>
        <span class="ah-t"><b>${esc(p.name)}</b><span>${esc(p.line)}</span></span>
        <span class="ah-tag${p.tag === 'New' ? ' new' : ''}">${esc(p.tag)}</span>
      </button>
      <div class="ah-panel" id="ah-p${i}">
        <figure class="ah-frame"><figcaption class="ah-bar"><i></i><i></i><i></i><span>${esc(p.bar)}</span></figcaption><div class="ah-screen">${media}</div></figure>
        <div class="ah-info"><p class="ah-what">${esc(p.what)}</p>
          <p class="ah-stack">${p.stack.split(' · ').map((s) => `<span>${esc(s)}</span>`).join('')}</p>
          <p class="ah-links">${links}</p></div>
      </div></li>`;
  }).join('')}</ol>`;

  const items = [...root.querySelectorAll('.ah-item')];
  const wide = matchMedia('(min-width: 901px)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');

  // the film plays only while it's the one showing and the section is on screen
  let visible = false;
  const syncVideo = () => items.forEach((it) => {
    const v = it.querySelector('video');
    if (!v) return;
    const showing = visible && !reduced && (it.classList.contains('on') || !wide.matches);
    if (showing) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
  });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; syncVideo(); }, { rootMargin: '10% 0px' }).observe(root);

  const pick = (it, { sound } = {}) => {
    if (it.classList.contains('on')) return;
    items.forEach((x) => { const on = x === it; x.classList.toggle('on', on); x.querySelector('.ah-row').setAttribute('aria-expanded', on); });
    if (sound) sfx('tick');
    syncVideo();
  };
  items.forEach((it) => {
    const row = it.querySelector('.ah-row');
    row.addEventListener('click', () => pick(it, { sound: true }));
    row.addEventListener('focus', () => { if (wide.matches) pick(it); });
    row.addEventListener('pointerenter', () => { if (wide.matches && fine.matches) pick(it, { sound: true }); });
    row.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const j = (items.indexOf(it) + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items[j].querySelector('.ah-row').focus();
    });
  });
  wide.addEventListener?.('change', syncVideo);
}
