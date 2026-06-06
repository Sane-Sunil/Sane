const LAYOUT_KEY = 'portfolio:desktop';
const DEFAULT_COLS = 10;

export function defaultLayout() {
  const appIds = ['about', 'skills', 'projects', 'experience', 'contact', 'resume', 'settings', 'filemanager'];
  return {
    cols: DEFAULT_COLS,
    items: appIds.map((id, i) => ({
      id: 'app:' + id,
      type: 'app',
      ref: id,
      gridX: i,
      gridY: 0,
    })),
  };
}

const VALID_APP_IDS = ['about', 'skills', 'projects', 'experience', 'contact', 'resume', 'settings', 'filemanager'];

export function getLayout() {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.items && Array.isArray(parsed.items)) {
        parsed.items = parsed.items.filter(item => {
          if (item.type === 'app' && !VALID_APP_IDS.includes(item.ref)) return false;
          return true;
        });
        parsed.items.forEach(item => {
          if (item.type === 'folder' && item.children) {
            item.children = item.children.filter(c => VALID_APP_IDS.includes(c));
          }
        });
        return parsed;
      }
    }
  } catch {}
  const def = defaultLayout();
  saveLayout(def);
  return def;
}

export function saveLayout(layout) {
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
}

export function moveItem(layout, id, gridX, gridY) {
  const item = layout.items.find(i => i.id === id);
  if (!item) return;
  const occupant = layout.items.find(i => i.id !== id && i.gridX === gridX && i.gridY === gridY);
  if (occupant) {
    [occupant.gridX, occupant.gridY] = [item.gridX, item.gridY];
  }
  item.gridX = gridX;
  item.gridY = gridY;
  saveLayout(layout);
}

export function addFolder(layout, name, gridX, gridY) {
  if (gridX === undefined) {
    const used = new Set(layout.items.map(i => `${i.gridX},${i.gridY}`));
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x < layout.cols; x++) {
        if (!used.has(`${x},${y}`)) { gridX = x; gridY = y; break; }
      }
      if (gridX !== undefined) break;
    }
  }
  const id = 'folder:' + Date.now();
  layout.items.push({ id, type: 'folder', name, ref: null, gridX, gridY, children: [] });
  saveLayout(layout);
  return id;
}

export function removeItem(layout, id) {
  layout.items = layout.items.filter(i => i.id !== id);
  saveLayout(layout);
}

export function addApp(layout, appId, gridX, gridY) {
  layout.items.push({ id: 'app:' + appId, type: 'app', ref: appId, gridX, gridY });
  saveLayout(layout);
}

export function resetLayout() {
  localStorage.removeItem(LAYOUT_KEY);
  return defaultLayout();
}

export function renameFolder(layout, id, name) {
  const f = layout.items.find(i => i.id === id);
  if (f && f.type === 'folder') { f.name = name; saveLayout(layout); }
}

export function addToFolder(layout, folderId, appId) {
  const folder = layout.items.find(i => i.id === folderId && i.type === 'folder');
  if (!folder) return;
  if (!folder.children.includes(appId)) folder.children.push(appId);
  layout.items = layout.items.filter(i => !(i.id === 'app:' + appId && i.type === 'app'));
  saveLayout(layout);
}

export function mergeIntoFolder(layout, draggedId, targetId, gridX, gridY) {
  const dragged = layout.items.find(i => i.id === draggedId);
  const target = layout.items.find(i => i.id === targetId);
  if (!dragged || !target) return;

  if (target.type === 'folder') {
    if (dragged.type === 'app') {
      if (!target.children.includes(dragged.ref)) target.children.push(dragged.ref);
      layout.items = layout.items.filter(i => i.id !== draggedId);
    } else if (dragged.type === 'folder') {
      dragged.children.forEach(c => { if (!target.children.includes(c)) target.children.push(c); });
      layout.items = layout.items.filter(i => i.id !== draggedId);
    }
  } else if (target.type === 'app') {
    const folderId = 'folder:' + Date.now();
    const folder = { id: folderId, type: 'folder', name: 'New Folder', ref: null, gridX, gridY, children: [] };
    if (dragged.type === 'app') {
      folder.children.push(dragged.ref, target.ref);
    } else if (dragged.type === 'folder') {
      dragged.children.forEach(c => folder.children.push(c));
      folder.children.push(target.ref);
    }
    layout.items = layout.items.filter(i => i.id !== targetId && i.id !== draggedId);
    layout.items.push(folder);
  }
  saveLayout(layout);
}

const WALLPAPER_KEY = 'portfolio:wallpaper';

export function getWallpaper() {
  try {
    const raw = localStorage.getItem(WALLPAPER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { type: 'gradient', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' };
}

export function saveWallpaper(wp) {
  localStorage.setItem(WALLPAPER_KEY, JSON.stringify(wp));
}

export function setCols(layout, cols) {
  layout.cols = cols;

  const occupied = new Set();
  const displaced = [];

  layout.items.forEach(item => {
    if (item.gridX < cols && item.gridY < cols) {
      occupied.add(`${item.gridX},${item.gridY}`);
    } else {
      displaced.push(item);
    }
  });

  displaced.forEach(item => {
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x < cols; x++) {
        if (!occupied.has(`${x},${y}`)) {
          item.gridX = x;
          item.gridY = y;
          occupied.add(`${x},${y}`);
          return;
        }
      }
    }
  });

  saveLayout(layout);
}

export function removeFromFolder(layout, folderId, appId) {
  const folder = layout.items.find(i => i.id === folderId && i.type === 'folder');
  if (!folder) return;
  folder.children = folder.children.filter(c => c !== appId);
  const used = new Set(layout.items.map(i => `${i.gridX},${i.gridY}`));
  let gx = folder.gridX + 1, gy = folder.gridY;
  if (used.has(`${gx},${gy}`)) {
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x < layout.cols; x++) {
        if (!used.has(`${x},${y}`)) { gx = x; gy = y; break; }
      }
      if (!used.has(`${gx},${gy}`)) break;
    }
  }
  layout.items.push({ id: 'app:' + appId, type: 'app', ref: appId, gridX: gx, gridY: gy });
  saveLayout(layout);
}

const ACCENT_KEY = 'portfolio:accent';
const THEME_KEY = 'portfolio:theme';
const TASKBAR_KEY = 'portfolio:taskbar';
const ICON_COLOR_KEY = 'portfolio:iconColor';

const ACCENT_PRESETS = [
  '#4fc3f7', '#f44336', '#e91e63', '#9c27b0',
  '#673ab7', '#3f51b5', '#2196f3', '#009688',
  '#4caf50', '#ffeb3b', '#ff9800', '#ff5722',
];

export function getAccentColor() {
  try { return localStorage.getItem(ACCENT_KEY) || '#4fc3f7'; } catch { return '#4fc3f7'; }
}

export function saveAccentColor(color) {
  localStorage.setItem(ACCENT_KEY, color);
}

export function getTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'dark'; } catch { return 'dark'; }
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export { ACCENT_PRESETS };

export function getTaskbarPrefs() {
  try {
    const raw = localStorage.getItem(TASKBAR_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { showClock: true, showSettings: true, showTrayBtn: true };
}

export function saveTaskbarPrefs(prefs) {
  localStorage.setItem(TASKBAR_KEY, JSON.stringify(prefs));
}

export function getIconColor() {
  try { return localStorage.getItem(ICON_COLOR_KEY) || 'auto'; } catch { return 'auto'; }
}

export function saveIconColor(color) {
  localStorage.setItem(ICON_COLOR_KEY, color);
}
