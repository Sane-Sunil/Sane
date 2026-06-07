import { getData } from '../../shared/dataAdapter.js';
import { apps } from './registry.js';

function desktopEl() { return document.getElementById('desktop'); }

const STORED = {};
const MINIMIZED = [];
let topZ = 100;
let trayEl = null;
let trayIndex = -1;
let nextInstId = 1;

const APP_STATE_KEY = "portfolio:app-state";

function getAppStates() {
  try { return JSON.parse(localStorage.getItem(APP_STATE_KEY)) || {}; } catch { return {}; }
}

function setAppState(appId, state) {
  const states = getAppStates();
  if (state == null) delete states[appId];
  else states[appId] = state;
  try { localStorage.setItem(APP_STATE_KEY, JSON.stringify(states)); } catch {}
}

function instanceAppId(instId) { return instId.split(':')[0]; }

function handleEscape() {
  if (trayEl && trayEl.classList.contains('active')) {
    trayEl.classList.remove('active');
    trayIndex = -1;
    return true;
  }
  const overlays = Object.values(STORED).filter(o => o.style.display !== 'none');
  if (overlays.length > 0) {
    let top = null;
    let topZVal = -1;
    overlays.forEach(o => {
      const z = parseInt(o.style.zIndex) || 0;
      if (z > topZVal) { top = o; topZVal = z; }
    });
    if (top) { minimizeApp(top.dataset.app); return true; }
  }
  return false;
}

function focusApp(id) {
  const win = STORED[id];
  if (!win) return;
  topZ++;
  win.style.zIndex = topZ;
  win.classList.remove('scale-in');
}

export async function openApp(app) {
  const instId = app.id + ':' + (nextInstId++);

  const win = document.createElement('div');
  const saved = getAppStates()[app.id];
  const isMaximized = saved?.maximized === true;
  win.className = 'app-window scale-in' + (isMaximized ? ' maximized' : '');
  win.dataset.app = instId;

  const header = document.createElement('div');
  header.className = 'app-window-header';

  const count = Object.values(STORED).filter(o => instanceAppId(o.dataset.app) === app.id).length;
  const title = document.createElement('span');
  title.className = 'app-window-title';
  title.innerHTML = `<span class="app-window-icon">${app.icon}</span> ${app.name}${count > 0 ? ' #' + (count + 1) : ''}`;
  header.appendChild(title);

  const controls = document.createElement('div');
  controls.className = 'app-window-controls';

  const minBtn = document.createElement('button');
  minBtn.className = 'app-window-btn';
  minBtn.textContent = '─';
  minBtn.title = 'Minimize';
  minBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    minimizeApp(instId);
  });
  controls.appendChild(minBtn);

  const maxBtn = document.createElement('button');
  maxBtn.className = 'app-window-btn';
  maxBtn.textContent = isMaximized ? '⊠' : '□';
  maxBtn.title = isMaximized ? 'Restore' : 'Maximize';
  let prevRect = null;
  maxBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const nowMax = !win.classList.contains('maximized');
    if (nowMax) {
      prevRect = win.getBoundingClientRect();
      win.style.left = prevRect.left + 'px';
      win.style.top = prevRect.top + 'px';
      win.style.width = prevRect.width + 'px';
      win.style.height = prevRect.height + 'px';
      void win.offsetHeight;
      win.classList.add('maximized');
      win.style.left = '';
      win.style.top = '';
      win.style.width = '';
      win.style.height = '';
    } else {
      win.style.left = '0px';
      win.style.top = '0px';
      const curRect = win.getBoundingClientRect();
      win.style.width = curRect.width + 'px';
      win.style.height = curRect.height + 'px';
      void win.offsetHeight;
      win.classList.remove('maximized');
      if (prevRect) {
        win.style.left = prevRect.left + 'px';
        win.style.top = prevRect.top + 'px';
      }
      win.style.width = '';
      win.style.height = '';
    }
    maxBtn.textContent = nowMax ? '⊠' : '□';
    maxBtn.title = nowMax ? 'Restore' : 'Maximize';
    setAppState(app.id, { maximized: nowMax });
  });
  controls.appendChild(maxBtn);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'app-window-close';
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', () => closeApp(instId));
  controls.appendChild(closeBtn);

  header.appendChild(controls);

  makeAppDraggable(win, header, instId);

  win.appendChild(header);

  const body = document.createElement('div');
  body.className = 'app-window-body';
  body.id = `app-body-${instId.replace(':', '-')}`;
  win.appendChild(body);

  (desktopEl() || document.body).appendChild(win);

  if (isMaximized) {
    win.style.left = '0px';
    win.style.top = '0px';
  } else {
    const winRect = win.getBoundingClientRect();
    win.style.left = Math.max(0, (window.innerWidth - winRect.width) / 2) + 'px';
    win.style.top = Math.max(0, (window.innerHeight - winRect.height) / 2) + 'px';
  }

  topZ++;
  win.style.zIndex = topZ;

  STORED[instId] = win;

  function onWinPointer() { focusApp(instId); }
  win.addEventListener('mousedown', onWinPointer);
  win.addEventListener('touchstart', onWinPointer, { passive: true });

  history.pushState({desktop: true}, '');

  if (app.render) {
    body.innerHTML = '<p class="app-loading">Loading...</p>';
    try {
      const data = await getData();
      body.innerHTML = app.render(data);
      if (app.init) app.init(body, data);
    } catch {
      body.innerHTML = '<p class="app-error">Failed to load data.</p>';
    }
  }
}

function minimizeApp(id) {
  const overlay = STORED[id];
  if (!overlay) return;
  if (!MINIMIZED.includes(id)) MINIMIZED.push(id);
  overlay.classList.add('anim-exit');
  overlay.addEventListener('transitionend', function handler(e) {
    if (e.propertyName !== 'opacity') return;
    overlay.removeEventListener('transitionend', handler);
    overlay.classList.add('minimized');
  });
}

export function closeApp(id) {
  const win = STORED[id];
  if (!win) return;
  const appId = instanceAppId(id);
  setAppState(appId, { maximized: win.classList.contains('maximized') });
  win.classList.add('anim-exit');
  win.addEventListener('transitionend', function handler(e) {
    if (e.propertyName !== 'opacity') return;
    win.removeEventListener('transitionend', handler);
    win.remove();
    delete STORED[id];
    const idx = MINIMIZED.indexOf(id);
    if (idx !== -1) MINIMIZED.splice(idx, 1);
  });
}

export function closeAll() {
  Object.keys(STORED).forEach(closeApp);
}

function renderTray() {
  if (!trayEl) {
    trayEl = document.createElement('div');
    trayEl.className = 'min-tray';
    (desktopEl() || document.body).appendChild(trayEl);
  }

  const visible = MINIMIZED.filter(id => STORED[id]);

  if (visible.length === 0) {
    trayEl.classList.remove('active');
    trayIndex = -1;
    return;
  }

  trayEl.classList.add('active');
  trayIndex = Math.max(0, Math.min(trayIndex, visible.length - 1));

  trayEl.innerHTML = visible.map((id, i) => {
    const appId = instanceAppId(id);
    const app = apps.find(a => a.id === appId);
    const num = id.split(':')[1];
    return `<button class="min-tray-item${i === trayIndex ? ' focused' : ''}" data-app="${id}">${app ? app.icon + ' ' + app.name + ' #' + num : id}</button>`;
  }).join('');
}

function restoreFromTray(id) {
  const overlay = STORED[id];
  if (!overlay) return;
  const idx = MINIMIZED.indexOf(id);
  if (idx !== -1) MINIMIZED.splice(idx, 1);
  overlay.classList.remove('minimized', 'anim-exit');
  overlay.style.display = '';
  overlay.classList.add('anim-enter');
  overlay.addEventListener('animationend', function handler() {
    overlay.removeEventListener('animationend', handler);
    overlay.classList.remove('anim-enter');
  });
  focusApp(id);
  trayEl.classList.remove('active');
  trayIndex = -1;
}

export function toggleTray() {
  if (trayEl && trayEl.classList.contains('active')) {
    trayEl.classList.remove('active');
    trayIndex = -1;
  } else {
    if (!trayEl) {
      trayEl = document.createElement('div');
      trayEl.className = 'min-tray';
      trayEl.setAttribute('tabindex', '-1');
      (desktopEl() || document.body).appendChild(trayEl);
    }
    const visible = MINIMIZED.filter(id => STORED[id]);
    if (visible.length === 0) {
      trayEl.innerHTML = '<div class="min-tray-empty">No minimized apps</div>';
    } else {
      renderTray();
    }
    trayEl.classList.add('active');
    trayEl.focus();
    history.pushState({desktop: true}, '');
  }
}

function makeAppDraggable(win, header, appId) {
  let startX, startY, origLeft, origTop, dragging = false;

  function onStart(e) {
    if (win.classList.contains('maximized')) return;
    const rect = win.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    origLeft = rect.left;
    origTop = rect.top;
    dragging = true;
    win.style.transition = 'none';
    focusApp(appId);
  }

  function onMove(e) {
    if (!dragging) return;
    win.style.left = (origLeft + e.clientX - startX) + 'px';
    win.style.top = (origTop + e.clientY - startY) + 'px';
  }

  function onEnd() {
    if (!dragging) return;
    dragging = false;
    win.style.transition = '';
  }

  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    onStart({ clientX: t.clientX, clientY: t.clientY });
  }

  function onTouchMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const t = e.touches[0];
    onMove({ clientX: t.clientX, clientY: t.clientY });
  }

  function onTouchEnd() {
    onEnd();
  }

  header.addEventListener('mousedown', onStart);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);
  header.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd);
}

export function initViewShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      handleEscape();
      return;
    }

    if (e.ctrlKey && e.altKey && e.shiftKey && (e.code === 'KeyM' || e.key === 'm' || e.key === 'M')) {
      e.preventDefault();
      toggleTray();
      return;
    }

    if (trayEl && trayEl.classList.contains('active')) {
      const visible = MINIMIZED.filter(id => STORED[id]);
      if (visible.length === 0) { trayEl.classList.remove('active'); return; }

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        trayIndex = (trayIndex + 1) % visible.length;
        renderTray();
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        trayIndex = (trayIndex - 1 + visible.length) % visible.length;
        renderTray();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const id = visible[trayIndex];
        if (id) restoreFromTray(id);
        return;
      }
    }
  }, { capture: true });
}

window.addEventListener('popstate', handleEscape);

document.addEventListener('click', (e) => {
  if (trayEl && trayEl.classList.contains('active') && !trayEl.contains(e.target)) {
    const item = e.target.closest('.min-tray-item');
    const trayBtn = e.target.closest('#taskbar-tray');
    if (!item && !trayBtn) {
      trayEl.classList.remove('active');
      trayIndex = -1;
    }
  }

  const item = e.target.closest('.min-tray-item');
  if (item) {
    const id = item.dataset.app;
    if (id) restoreFromTray(id);
  }
});
