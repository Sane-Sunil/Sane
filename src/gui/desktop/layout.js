import { switchToCli } from '../state.js';
import { apps } from '../apps/registry.js';
import { openApp, initViewShortcuts, toggleTray } from '../apps/view.js';
import * as ds from './desktopState.js';

let layout = null;
let contextEl = null;
let folderWin = null;
let resizeObs = null;
let appsGrid = null;

function getEmbedUrl(url) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}&controls=0`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1&muted=1&loop=1&controls=0&badge=0`;
  return null;
}

export function applyWallpaper() {
  const el = document.getElementById('desktop-wallpaper');
  const video = document.getElementById('desktop-video');
  const embed = document.getElementById('desktop-embed');
  if (!el) return;
  const wp = ds.getWallpaper();
  if (wp.type === 'gradient') {
    el.style.backgroundImage = wp.value;
    el.style.backgroundColor = 'transparent';
    el.style.backgroundSize = 'auto';
    if (video) { video.style.display = 'none'; video.pause(); }
    if (embed) { embed.style.display = 'none'; embed.src = ''; }
  } else if (wp.type === 'solid') {
    el.style.backgroundImage = 'none';
    el.style.backgroundColor = wp.value;
    el.style.backgroundSize = 'auto';
    if (video) { video.style.display = 'none'; video.pause(); }
    if (embed) { embed.style.display = 'none'; embed.src = ''; }
  } else if (wp.type === 'image') {
    el.style.backgroundImage = `url(${wp.value})`;
    el.style.backgroundColor = 'transparent';
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    if (video) { video.style.display = 'none'; video.pause(); }
    if (embed) { embed.style.display = 'none'; embed.src = ''; }
  } else if (wp.type === 'live') {
    el.style.backgroundImage = 'none';
    el.style.backgroundColor = 'transparent';
    const embedUrl = getEmbedUrl(wp.value);
    if (embedUrl) {
      if (video) { video.style.display = 'none'; video.pause(); }
      if (embed) {
        embed.src = embedUrl;
        embed.style.display = 'block';
      }
    } else {
      if (embed) { embed.style.display = 'none'; embed.src = ''; }
      if (video) {
        video.src = wp.value;
        video.load();
        video.style.display = 'block';
        video.addEventListener('canplay', () => {
          video.play().catch(() => {});
        }, { once: true });
      }
    }
  }
  applyWallpaperThemeMatch(el, wp);
}

function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length === 8) h = h.slice(0, 6);
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  return '#' +
    Math.round(r).toString(16).padStart(2, '0') +
    Math.round(g).toString(16).padStart(2, '0') +
    Math.round(b).toString(16).padStart(2, '0');
}

function lightenHex(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  );
}

function lightenGradient(gradient, amount) {
  return gradient.replace(/#[0-9a-fA-F]{3,8}\b/g, (match) => lightenHex(match, amount));
}

function darkenHex(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    r * (1 - amount),
    g * (1 - amount),
    b * (1 - amount),
  );
}

function darkenGradient(gradient, amount) {
  return gradient.replace(/#[0-9a-fA-F]{3,8}\b/g, (match) => darkenHex(match, amount));
}

function applyWallpaperThemeMatch(el, wp) {
  const match = ds.getWallpaperMatchTheme();
  if (!match) return;
  if (wp.type === 'solid') {
    const adjusted = ds.getTheme() === 'light'
      ? lightenHex(wp.value, 0.50)
      : darkenHex(wp.value, 0.50);
    el.style.backgroundImage = 'none';
    el.style.backgroundColor = adjusted;
    el.style.backgroundSize = 'auto';
  } else if (wp.type === 'gradient') {
    const adjusted = ds.getTheme() === 'light'
      ? lightenGradient(wp.value, 0.50)
      : darkenGradient(wp.value, 0.50);
    el.style.backgroundImage = adjusted;
    el.style.backgroundColor = 'transparent';
    el.style.backgroundSize = 'auto';
  }
}

export function refreshDesktop() {
  layout = ds.getLayout();
  if (appsGrid) renderIcons(appsGrid);
}

export function initDesktop() {
  const terminal = document.getElementById('terminal');
  if (terminal) terminal.style.display = 'none';

  let desktop = document.getElementById('desktop');
  if (desktop) return;

  layout = ds.getLayout();

  desktop = document.createElement('div');
  desktop.id = 'desktop';

  const wallpaper = document.createElement('div');
  wallpaper.id = 'desktop-wallpaper';
  desktop.appendChild(wallpaper);

  const video = document.createElement('video');
  video.id = 'desktop-video';
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.style.display = 'none';
  desktop.appendChild(video);

  const embed = document.createElement('iframe');
  embed.id = 'desktop-embed';
  embed.allow = 'autoplay; encrypted-media';
  embed.style.display = 'none';
  desktop.appendChild(embed);

  appsGrid = document.createElement('div');
  appsGrid.id = 'desktop-apps';
  desktop.appendChild(appsGrid);

  const taskbar = document.createElement('div');
  taskbar.id = 'taskbar';

  const clock = document.createElement('span');
  clock.id = 'taskbar-clock';
  taskbar.appendChild(clock);

  const trayBtn = document.createElement('button');
  trayBtn.id = 'taskbar-tray';
  trayBtn.textContent = '⊞';
  trayBtn.title = 'Show minimized apps';
  trayBtn.addEventListener('click', toggleTray);
  taskbar.appendChild(trayBtn);

  const settingsBtn = document.createElement('button');
  settingsBtn.id = 'taskbar-settings';
  settingsBtn.textContent = '⚙ Settings';
  settingsBtn.addEventListener('click', () => {
    const app = apps.find(a => a.id === 'settings');
    if (app) openApp(app);
  });
  taskbar.appendChild(settingsBtn);

  const helpBtn = document.createElement('button');
  helpBtn.id = 'taskbar-help';
  helpBtn.textContent = '?';
  helpBtn.title = 'How to use';
  helpBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const existing = document.getElementById('help-popup');
    if (existing) { existing.remove(); return; }
    const popup = document.createElement('div');
    popup.id = 'help-popup';
    popup.innerHTML = `
      <div class="hp-item">Double tap icon to open</div>
      <div class="hp-item">Right click for options on PC</div>
      <div class="hp-item">Long press for options on mobile</div>
      <div class="hp-item">Press and drag for changing placement</div>
      <div class="hp-item">Go to Settings for more options</div>
    `;
    document.body.appendChild(popup);
    requestAnimationFrame(() => {
      const r = helpBtn.getBoundingClientRect();
      popup.style.bottom = (window.innerHeight - r.top + 8) + 'px';
      popup.style.right = (window.innerWidth - r.right) + 'px';
    });
    setTimeout(() => document.addEventListener('click', closeHelp, true), 0);
  });
  const switchBtn = document.createElement('button');
  switchBtn.id = 'switch-to-cli';
  switchBtn.textContent = 'Open Terminal';
  switchBtn.addEventListener('click', switchToCli);
  taskbar.appendChild(switchBtn);

  taskbar.appendChild(helpBtn);

  desktop.appendChild(taskbar);
  document.body.appendChild(desktop);

  applyWallpaper();
  applyTheme();
  applyTaskbarPrefs();
  applyIconColor();

  appsGrid.addEventListener('contextmenu', e => {
    if (e.target === appsGrid) { e.preventDefault(); showMenu(e.clientX, e.clientY, appsGrid); }
  });

  document.addEventListener('click', closeMenu, true);

  renderIcons(appsGrid);
  updateClock();
  setInterval(updateClock, 1000);
  desktop.classList.add('fade-in');

  resizeObs = new ResizeObserver(() => renderIcons(appsGrid));
  resizeObs.observe(appsGrid);

  initViewShortcuts();
}

export function applyTheme() {
  const desktop = document.getElementById('desktop');
  if (!desktop) return;
  const theme = ds.getTheme();
  desktop.classList.toggle('theme-light', theme === 'light');
  desktop.classList.toggle('theme-dark', theme === 'dark');
  const accent = ds.getAccentColor();
  desktop.style.setProperty('--accent', accent);
  document.documentElement.style.setProperty('--accent', accent);
  applyIconColor();
  applyWallpaper();
}

export function applyTaskbarPrefs() {
  const prefs = ds.getTaskbarPrefs();
  const clock = document.getElementById('taskbar-clock');
  if (clock) clock.style.display = prefs.showClock ? '' : 'none';
  const settingsBtn = document.getElementById('taskbar-settings');
  if (settingsBtn) settingsBtn.style.display = prefs.showSettings ? '' : 'none';
  const trayBtn = document.getElementById('taskbar-tray');
  if (trayBtn) trayBtn.style.display = prefs.showTrayBtn ? '' : 'none';
}

export function applyIconColor() {
  const container = document.getElementById('desktop-apps');
  if (!container) return;
  const color = ds.getIconColor();
  if (color && color !== 'auto') {
    const accent = ds.getAccentColor();
    container.style.setProperty('--icon-color', accent);
  } else {
    container.style.removeProperty('--icon-color');
  }
}

function gridDim(container) {
  const style = getComputedStyle(container);
  const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const rect = container.getBoundingClientRect();
  const n = layout.cols;
  const availW = rect.width - padX;
  const availH = rect.height - padY;
  return { cols: n, rows: n, cellW: Math.floor(availW / n), cellH: Math.floor(availH / n) };
}

function renderIcons(container) {
  const { cols, rows, cellW, cellH } = gridDim(container);

  container.style.gridTemplateColumns = `repeat(${cols}, ${cellW}px)`;
  container.style.gridTemplateRows = `repeat(${rows}, ${cellH}px)`;

  const cell = Math.min(cellW, cellH);
  const boxSize = Math.round(cell * 0.52);
  const iconFont = Math.round(boxSize * 0.42);
  const labelFont = Math.max(9, Math.round(boxSize * 0.2));
  container.style.setProperty('--box-size', boxSize + 'px');
  container.style.setProperty('--icon-font', iconFont + 'px');
  container.style.setProperty('--label-font', labelFont + 'px');

  container.innerHTML = '';

  layout.items.forEach(item => {
    const gx = Math.min(item.gridX, cols - 1);
    const gy = Math.min(item.gridY, rows - 1);

    const meta = item.type === 'app' ? apps.find(a => a.id === item.ref) : null;
    const el = document.createElement('div');
    el.className = 'desk-icon';
    el.dataset.id = item.id;
    el.style.gridColumn = (gx + 1) + ' / span 1';
    el.style.gridRow = (gy + 1) + ' / span 1';

    if (item.type === 'folder') {
      const previews = item.children.slice(0, 4).map(appId => {
        const a = apps.find(x => x.id === appId);
        return a ? `<span class="fp-icon" style="background:${a.color}33">${a.icon}</span>` : '';
      }).join('');
      el.innerHTML = `
        <div class="desk-icon-box folder-box">
          <div class="fp-grid ${item.children.length === 0 ? 'fp-empty' : ''}">${previews || '<span class="folder-emoji">📁</span>'}</div>
        </div>
        <span class="desk-icon-label">${item.name}</span>
      `;
      el.addEventListener('dblclick', () => openFolder(item, container));
    } else if (meta) {
      el.innerHTML = `
        <div class="desk-icon-box" style="background:${meta.color}22;border-color:${meta.color}44">${meta.icon}</div>
        <span class="desk-icon-label">${meta.name}</span>
      `;
      el.addEventListener('dblclick', () => openApp(meta));
    }

    el.addEventListener('contextmenu', e => {
      e.preventDefault();
      e.stopPropagation();
      showMenu(e.clientX, e.clientY, container, item);
    });

    el.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      startDrag(e, el, container);
    });
    el.addEventListener('touchstart', e => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      startDrag({ clientX: t.clientX, clientY: t.clientY }, el, container);
    });

    container.appendChild(el);
  });
}

function startDrag(e, el, container) {
  const THRESHOLD = 5;
  const startX = e.clientX;
  const startY = e.clientY;
  let dragging = false;
  let grid, highlight;
  let hoveredTarget = null;

  const { cols, rows, cellW, cellH } = gridDim(container);
  const rect = container.getBoundingClientRect();
  const origRect = el.getBoundingClientRect();
  const origX = origRect.left - rect.left;
  const origY = origRect.top - rect.top;
  const ox = e.clientX - origRect.left;
  const oy = e.clientY - origRect.top;
  const draggedId = el.dataset.id;

  function pos(ev) {
    const rawX = Math.floor((ev.clientX - rect.left) / cellW);
    const rawY = Math.floor((ev.clientY - rect.top) / cellH);
    return {
      gx: Math.max(0, Math.min(cols - 1, rawX)),
      gy: Math.max(0, Math.min(rows - 1, rawY)),
    };
  }

  function updateHover(gx, gy) {
    if (hoveredTarget) {
      const prev = container.querySelector(`[data-id="${hoveredTarget.id}"]`);
      if (prev) prev.classList.remove('drag-merge-target');
      hoveredTarget = null;
    }
    const occupant = layout.items.find(i => i.id !== draggedId && i.gridX === gx && i.gridY === gy);
    if (occupant) {
      const occEl = container.querySelector(`[data-id="${occupant.id}"]`);
      if (occEl) {
        occEl.classList.add('drag-merge-target');
        hoveredTarget = occupant;
      }
    }
  }

  function onMove(ev) {
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    if (!dragging && dx * dx + dy * dy < THRESHOLD * THRESHOLD) return;

    if (!dragging) {
      dragging = true;
      el.classList.add('dragging');
      el.style.zIndex = 1000;

      grid = document.createElement('div');
      grid.className = 'drag-grid';
      grid.style.backgroundSize = cellW + 'px ' + cellH + 'px';
      grid.style.left = parseFloat(getComputedStyle(container).paddingLeft) + 'px';
      grid.style.top = parseFloat(getComputedStyle(container).paddingTop) + 'px';
      grid.style.width = (cellW * cols) + 'px';
      grid.style.height = (cellH * rows) + 'px';
      container.appendChild(grid);

      highlight = document.createElement('div');
      highlight.className = 'drag-highlight';
      container.appendChild(highlight);
    }

    const tx = ev.clientX - rect.left - ox - origX;
    const ty = ev.clientY - rect.top - oy - origY;
    el.style.transform = `translate(${tx}px, ${ty}px)`;

    const { gx, gy } = pos(ev);
    highlight.style.gridColumn = (gx + 1) + ' / span 1';
    highlight.style.gridRow = (gy + 1) + ' / span 1';
    updateHover(gx, gy);
  }

  function onMoveTouch(ev) {
    const t = ev.touches[0];
    onMove({ clientX: t.clientX, clientY: t.clientY });
    if (dragging) ev.preventDefault();
  }

  function onUpTouch(ev) {
    const t = ev.changedTouches[0];
    onUp({ clientX: t.clientX, clientY: t.clientY });
  }

  function onUp(ev) {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.removeEventListener('touchmove', onMoveTouch);
    document.removeEventListener('touchend', onUpTouch);

    if (hoveredTarget) {
      const prev = container.querySelector(`[data-id="${hoveredTarget.id}"]`);
      if (prev) prev.classList.remove('drag-merge-target');
    }

    if (dragging) {
      el.classList.remove('dragging');
      el.style.transform = '';
      el.style.zIndex = '';
      grid.remove();
      highlight.remove();

      const { gx, gy } = pos(ev);
      const occupant = layout.items.find(i => i.id !== draggedId && i.gridX === gx && i.gridY === gy);
      if (occupant) {
        ds.mergeIntoFolder(layout, draggedId, occupant.id, gx, gy);
      } else {
        ds.moveItem(layout, draggedId, gx, gy);
      }
      renderIcons(container);
    }
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
  document.addEventListener('touchmove', onMoveTouch, { passive: false });
  document.addEventListener('touchend', onUpTouch);
}

function showMenu(x, y, container, item) {
  closeMenu();
  contextEl = document.createElement('div');
  contextEl.className = 'desk-menu';
  contextEl.style.left = x + 'px';
  contextEl.style.top = y + 'px';

  if (item) {
    if (item.type === 'folder') {
      addItem('Rename', () => {
        const n = prompt('Folder name:', item.name);
        if (n && n.trim()) { ds.renameFolder(layout, item.id, n.trim()); renderIcons(container); }
        closeMenu();
      });
      addItem('Remove Folder', () => {
        if (confirm('Remove this folder?')) { ds.removeItem(layout, item.id); renderIcons(container); }
        closeMenu();
      });
    } else if (item.type === 'app') {
      const folders = layout.items.filter(i => i.type === 'folder');
      if (folders.length > 0) {
        const sub = addItem('Move to Folder ›');
        const sm = document.createElement('div');
        sm.className = 'desk-menu-sub';
        folders.forEach(f => {
          const s = document.createElement('div');
          s.className = 'desk-menu-item';
          s.textContent = f.name;
          s.addEventListener('click', () => {
            ds.addToFolder(layout, f.id, item.ref);
            renderIcons(container);
            closeMenu();
          });
          sm.appendChild(s);
        });
        sub.appendChild(sm);
        sub.addEventListener('mouseenter', () => sm.style.display = 'block');
        sub.addEventListener('mouseleave', () => sm.style.display = 'none');
      }
      addItem('Remove from Desktop', () => {
        ds.removeItem(layout, item.id);
        renderIcons(container);
        closeMenu();
      });
    }
  } else {
    addItem('New Folder', () => {
      const n = prompt('Folder name:');
      if (n && n.trim()) {
        const p = clickPos(x, y, container);
        ds.addFolder(layout, n.trim(), p.gx, p.gy);
        renderIcons(container);
      }
      closeMenu();
    });

    const onDesktop = new Set(layout.items.filter(i => i.type === 'app').map(i => i.ref));
    layout.items.filter(i => i.type === 'folder').forEach(f => f.children.forEach(c => onDesktop.add(c)));
    const available = apps.filter(a => !onDesktop.has(a.id));

    if (available.length > 0) {
      const sub = addItem('Add App ›');
      const sm = document.createElement('div');
      sm.className = 'desk-menu-sub';
      available.forEach(a => {
        const s = document.createElement('div');
        s.className = 'desk-menu-item';
        s.innerHTML = `${a.icon} ${a.name}`;
        s.addEventListener('click', () => {
          const p = clickPos(x, y, container);
          ds.addApp(layout, a.id, p.gx, p.gy);
          renderIcons(container);
          closeMenu();
        });
        sm.appendChild(s);
      });
      sub.appendChild(sm);
      sub.addEventListener('mouseenter', () => sm.style.display = 'block');
      sub.addEventListener('mouseleave', () => sm.style.display = 'none');
    }

    addItem('Reset Layout', () => {
      if (confirm('Reset desktop layout to default?')) {
        layout = ds.resetLayout();
        renderIcons(container);
      }
      closeMenu();
    });
  }

  const desktop = document.getElementById('desktop');
  (desktop || document.body).appendChild(contextEl);
}

function addItem(label, onClick) {
  const div = document.createElement('div');
  div.className = 'desk-menu-item';
  div.textContent = label;
  if (onClick) div.addEventListener('click', onClick);
  contextEl.appendChild(div);
  return div;
}

function closeMenu() {
  if (contextEl) { contextEl.remove(); contextEl = null; }
}

function clickPos(x, y, container) {
  const { cellW, cellH } = gridDim(container);
  const rect = container.getBoundingClientRect();
  return {
    gx: Math.max(0, Math.min(layout.cols - 1, Math.floor((x - rect.left) / cellW))),
    gy: Math.max(0, Math.floor((y - rect.top) / cellH)),
  };
}

function openFolder(item) {
  closeFolder();
  folderWin = document.createElement('div');
  folderWin.className = 'folder-overlay';
  folderWin.addEventListener('click', e => { if (e.target === folderWin) closeFolder(); });

  const win = document.createElement('div');
  win.className = 'folder-win';

  const hdr = document.createElement('div');
  hdr.className = 'folder-win-header';
  const titleSpan = document.createElement('span');
  titleSpan.textContent = '📁 ' + item.name;
  titleSpan.style.cursor = 'pointer';
  titleSpan.title = 'Rename folder';
  titleSpan.addEventListener('click', () => {
    const n = prompt('Folder name:', item.name);
    if (n && n.trim()) {
      ds.renameFolder(layout, item.id, n.trim());
      titleSpan.textContent = '📁 ' + n.trim();
      const deskIcon = document.querySelector(`.desk-icon[data-id="${item.id}"] .desk-icon-label`);
      if (deskIcon) deskIcon.textContent = n.trim();
    }
  });
  hdr.appendChild(titleSpan);
  const closeBtn = document.createElement('button');
  closeBtn.className = 'folder-win-close';
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', closeFolder);
  hdr.appendChild(closeBtn);
  win.appendChild(hdr);

  const body = document.createElement('div');
  body.className = 'folder-win-body';

  if (item.children.length === 0) {
    body.innerHTML = '<p class="empty-state" style="text-align:center;padding:32px;opacity:0.5">This folder is empty.</p>';
  } else {
    const grid = document.createElement('div');
    grid.className = 'folder-win-grid';
    item.children.forEach(appId => {
      const app = apps.find(a => a.id === appId);
      if (!app) return;
      const ic = document.createElement('div');
      ic.className = 'folder-app-icon';
      ic.innerHTML = `
        <div class="desk-icon-box" style="background:${app.color}22;border-color:${app.color}44">${app.icon}</div>
        <span class="desk-icon-label">${app.name}</span>
      `;
      ic.style.cursor = 'grab';
      ic.addEventListener('dblclick', () => { openApp(app); closeFolder(); });
      makeFolderAppDraggable(ic, item, app, appId);
      grid.appendChild(ic);
    });
    body.appendChild(grid);
  }

  win.appendChild(body);
  folderWin.appendChild(win);
  const desktop = document.getElementById('desktop');
  (desktop || document.body).appendChild(folderWin);
}

function closeFolder() {
  if (folderWin) { folderWin.remove(); folderWin = null; }
}

function makeFolderAppDraggable(el, folder, app, appId) {
  const container = document.getElementById('desktop-apps');
  let startX, startY, dragging = false;
  let ghost;

  function onMove(e) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!dragging && dx * dx + dy * dy < 25) return;

    if (!dragging) {
      dragging = true;
      el.style.opacity = '0.3';
      ghost = el.cloneNode(true);
      ghost.style.position = 'fixed';
      ghost.style.pointerEvents = 'none';
      ghost.style.zIndex = 9999;
      ghost.style.width = el.offsetWidth + 'px';
      ghost.style.opacity = '0.8';
      ghost.style.transform = 'scale(1.1)';
      document.body.appendChild(ghost);
    }

    ghost.style.left = (e.clientX - ghost.offsetWidth / 2) + 'px';
    ghost.style.top = (e.clientY - ghost.offsetHeight / 2) + 'px';
  }

  function onMoveTouch(ev) {
    const t = ev.touches[0];
    onMove({ clientX: t.clientX, clientY: t.clientY });
    if (dragging) ev.preventDefault();
  }

  function onUpTouch(ev) {
    const t = ev.changedTouches[0];
    onUp({ clientX: t.clientX, clientY: t.clientY });
  }

  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.removeEventListener('touchmove', onMoveTouch);
    document.removeEventListener('touchend', onUpTouch);
    if (ghost) ghost.remove();
    el.style.opacity = '';

    if (dragging) {
      ds.removeFromFolder(layout, folder.id, appId);
      closeFolder();
      renderIcons(container);
    }
  }

  el.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    startX = e.clientX;
    startY = e.clientY;
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
  el.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    document.addEventListener('touchmove', onMoveTouch, { passive: false });
    document.addEventListener('touchend', onUpTouch);
  }, { passive: true });
}

function closeHelp() {
  const popup = document.getElementById('help-popup');
  if (popup) popup.remove();
  document.removeEventListener('click', closeHelp, true);
}

function updateClock() {
  const el = document.getElementById('taskbar-clock');
  if (!el) return;
  const d = new Date();
  el.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
