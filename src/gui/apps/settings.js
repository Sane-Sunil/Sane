import * as ds from '../desktop/desktopState.js';
import { refreshDesktop, applyWallpaper, applyTaskbarPrefs, applyTheme, applyIconColor } from '../desktop/layout.js';

const GRID_OPTIONS = [4, 5, 6, 8, 10, 12];

const GRADIENT_PRESETS = [
  { label: 'Deep Space', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { label: 'Ocean', value: 'linear-gradient(135deg, #0a1628 0%, #1a3a5c 50%, #0d2137 100%)' },
  { label: 'Sunset', value: 'linear-gradient(135deg, #1a0a0a 0%, #5c2a1a 50%, #370d0d 100%)' },
  { label: 'Forest', value: 'linear-gradient(135deg, #0a1a0a 0%, #1a3a1a 50%, #0d210d 100%)' },
  { label: 'Midnight', value: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #0d0d21 100%)' },
  { label: 'Nord', value: 'linear-gradient(135deg, #1a1c2a 0%, #2e3440 50%, #1a1c2a 100%)' },
];

const LIVE_PRESETS = [
  { label: 'Big Buck Bunny', value: 'https://lorem.video/bunny_720p_h264_30fps_20s_25crf_aac_128kbps.mp4' },
  { label: 'Nature', value: 'https://lorem.media/video/seed/nature/16x9?category=nature' },
  { label: 'Cityscape', value: 'https://lorem.media/video/seed/urban/16x9?category=urban' },
  { label: 'Abstract', value: 'https://lorem.media/video/seed/abstract/16x9?category=abstract' },
];

const IMAGE_PRESETS = [
  { label: 'Mountain', value: 'https://lorem.media/photo/id/v_pxeymjck_p/1920/1080' },
  { label: 'Lake', value: 'https://lorem.media/photo/id/v_px5e7q78_p/1920/1080' },
  { label: 'Coast', value: 'https://lorem.media/photo/id/v_pxx47cx5_p/1920/1080' },
  { label: 'Waterfall', value: 'https://lorem.media/photo/id/v_pxwxwv3q_p/1920/1080' },
];

const TABS = [
  { id: 'desktop', label: 'Desktop' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'taskbar', label: 'Taskbar' },
  { id: 'shortcuts', label: 'Shortcuts' },
];

const SHORTCUTS = [
  { keys: 'Esc', desc: 'Close topmost app or tray' },
  { keys: 'Ctrl + Alt + Shift + M', desc: 'Toggle minimized apps tray' },
  { keys: '↑ ↓ ← →', desc: 'Navigate minimized apps tray' },
  { keys: 'Enter', desc: 'Restore selected app from tray' },
];

const WP_TYPES = ['gradient', 'image', 'solid', 'live'];

export function renderSettings() {
  const col = ds.getLayout().cols;
  const wp = ds.getWallpaper();
  const accent = ds.getAccentColor();
  const taskbarPrefs = ds.getTaskbarPrefs();
  const currentType = WP_TYPES.includes(wp.type) ? wp.type : 'gradient';
  const theme = ds.getTheme();
  const iconAuto = ds.getIconColor() === 'auto';
  const wpMatch = ds.getWallpaperMatchTheme();

  const gridHtml = GRID_OPTIONS.map(c =>
    `<button class="st-grid-btn${col === c ? ' active' : ''}" data-cols="${c}">${c}×${c}</button>`
  ).join('');

  const tabsHtml = TABS.map(t =>
    `<button class="st-tab${t.id === 'desktop' ? ' active' : ''}" data-tab="${t.id}">${t.label}</button>`
  ).join('');

  const wpBarHtml = WP_TYPES.map(t =>
    `<button class="st-wp-tab${t === currentType ? ' active' : ''}" data-wp="${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</button>`
  ).join('');

  const gradPresetsHtml = GRADIENT_PRESETS.map(p =>
    `<button class="st-preset-btn${wp.type === 'gradient' && wp.value === p.value ? ' active' : ''}" data-type="gradient" data-value="${p.value}">${p.label}</button>`
  ).join('');

  const livePresetsHtml = LIVE_PRESETS.map(p =>
    `<button class="st-preset-btn${wp.type === 'live' && wp.value === p.value ? ' active' : ''}" data-type="live" data-value="${p.value}">${p.label}</button>`
  ).join('');

  const imgPresetsHtml = IMAGE_PRESETS.map(p => {
    const thumb = p.value.replace('/1920/1080', '/120/75');
    return `<button class="st-img-preset${wp.type === 'image' && wp.value === p.value ? ' active' : ''}" data-type="image" data-value="${p.value}">
      <img class="st-img-thumb" src="${thumb}" alt="${p.label}" loading="lazy">
      <span class="st-img-label">${p.label}</span>
    </button>`;
  }).join('');

  return `
    <div class="st-layout">
      <div class="st-bar">${tabsHtml}</div>
      <div class="st-pane active" id="st-pane-desktop">
        <div class="st-section">
          <div class="st-sh">Layout</div>
          <div class="st-row">
            <div class="st-label">Grid size</div>
            <div class="st-grid-opts">${gridHtml}</div>
          </div>
        </div>
        <div class="st-section">
          <div class="st-sh">Icon Text Color</div>
          <div class="st-row">
            <label class="st-toggle-row">
              <input type="checkbox" id="st-icon-auto"${iconAuto ? ' checked' : ''}>
              <span class="st-label">Auto (match theme)</span>
            </label>
          </div>
        </div>
        <div class="st-section">
          <div class="st-sh">Wallpaper</div>
          <div class="st-wp-bar">${wpBarHtml}</div>

          <div class="st-wp-pane${currentType === 'gradient' ? ' active' : ''}" data-wp="gradient">
            <div class="st-row">
              <div class="st-label">Presets</div>
              <div class="st-presets">${gradPresetsHtml}</div>
            </div>
            <div class="st-row">
              <div class="st-label">Custom</div>
              <div class="st-custom">
                <input class="st-input st-grad-input" type="text" value="${wp.type === 'gradient' ? wp.value.replace(/"/g, '&quot;') : ''}" placeholder="linear-gradient(...)">
                <button class="st-apply st-apply-grad">Apply</button>
              </div>
            </div>
          </div>

          <div class="st-wp-pane${currentType === 'image' ? ' active' : ''}" data-wp="image">
            <div class="st-row">
              <div class="st-label">Wallpapers</div>
              <div class="st-img-grid">${imgPresetsHtml}</div>
            </div>
            <div class="st-row">
              <div class="st-label">Upload from PC</div>
              <input type="file" id="st-file-input" accept="image/*" hidden>
              <button class="st-apply" id="st-choose-file">Choose Image</button>
            </div>
            <div class="st-row">
              <div class="st-label">Image URL</div>
              <div class="st-custom">
                <input class="st-input st-url-input" type="text" value="${wp.type === 'image' ? wp.value.replace(/"/g, '&quot;') : ''}" placeholder="https://example.com/wallpaper.jpg">
                <button class="st-apply st-apply-url">Apply</button>
              </div>
            </div>
          </div>

          <div class="st-wp-pane${currentType === 'solid' ? ' active' : ''}" data-wp="solid">
            <div class="st-row">
              <div class="st-label">Color</div>
              <div class="st-custom">
                <input class="st-colorpicker st-solid-picker" type="color" value="${wp.type === 'solid' ? wp.value : '#000000'}">
                <input class="st-input st-solid-input" type="text" value="${wp.type === 'solid' ? wp.value : ''}" placeholder="#000000">
                <button class="st-apply st-apply-solid">Apply</button>
              </div>
            </div>
          </div>

          <div class="st-wp-pane${currentType === 'live' ? ' active' : ''}" data-wp="live">
            <div class="st-row">
              <div class="st-label">Videos</div>
              <div class="st-presets">${livePresetsHtml}</div>
            </div>
            <div class="st-row">
              <div class="st-label">Upload from PC</div>
              <input type="file" id="st-video-input" accept="video/*" hidden>
              <button class="st-apply" id="st-choose-video">Choose Video</button>
            </div>
            <div class="st-row">
              <div class="st-label">Video URL</div>
              <div class="st-custom">
                <input class="st-input st-live-input" type="text" value="${wp.type === 'live' ? wp.value.replace(/"/g, '&quot;') : ''}" placeholder="Video URL, YouTube, or Vimeo link">
                <button class="st-apply st-apply-live">Apply</button>
              </div>
            </div>
          </div>
          <div class="st-row" style="margin-top:8px;padding-top:10px;border-top:1px solid color-mix(in srgb, var(--text) 6%, transparent)">
            <label class="st-toggle-row">
              <input type="checkbox" id="st-wp-match"${wpMatch ? ' checked' : ''}>
              <span class="st-label">Match theme (solid/gradient)</span>
            </label>
          </div>
        </div>
      </div>
      <div class="st-pane" id="st-pane-appearance">
        <div class="st-section">
          <div class="st-sh">Theme</div>
          <div class="st-row">
            <div class="st-label">Color scheme</div>
            <div class="st-custom" style="gap:6px">
              <button class="st-apply st-theme-btn${theme === 'dark' ? ' active' : ''}" data-theme="dark">Dark</button>
              <button class="st-apply st-theme-btn${theme === 'light' ? ' active' : ''}" data-theme="light">Light</button>
            </div>
          </div>
        </div>
        <div class="st-section">
          <div class="st-sh">Accent Color</div>
          <div class="st-row">
            <div class="st-label">Presets</div>
            <div class="st-presets" style="display:flex;flex-wrap:wrap;gap:6px">
              ${ds.ACCENT_PRESETS.map(c =>
                `<button class="st-accent-preset${accent === c ? ' active' : ''}" data-color="${c}" style="width:28px;height:28px;border-radius:50%;border:2px solid transparent;background:${c};cursor:pointer;transition:transform 0.12s, border-color 0.12s" title="${c}"></button>`
              ).join('')}
            </div>
          </div>
          <div class="st-row">
            <div class="st-label">Custom</div>
            <div class="st-custom">
              <input class="st-input" id="st-accent-val" type="text" value="${accent}" placeholder="#4fc3f7">
              <input class="st-colorpicker" id="st-accent-picker" type="color" value="${accent}">
              <button class="st-apply" id="st-apply-accent">Apply</button>
            </div>
          </div>
        </div>
        <div class="st-section">
          <div class="st-sh">Preview</div>
          <div class="st-row" style="gap:8px">
            <button class="st-grid-btn" style="background:color-mix(in srgb, ${accent} 12%, transparent);color:${accent};border-color:color-mix(in srgb, ${accent} 20%, transparent)">Button</button>
            <span class="st-label" style="color:${accent}">Colored text</span>
            <span style="display:inline-block;width:20px;height:20px;border-radius:4px;background:${accent}"></span>
          </div>
        </div>
      </div>
      <div class="st-pane" id="st-pane-taskbar">
        <div class="st-section">
          <div class="st-sh">Visibility</div>
          <div class="st-row">
            <label class="st-toggle-row">
              <input type="checkbox" id="st-show-clock"${taskbarPrefs.showClock ? ' checked' : ''}>
              <span class="st-label">Show clock</span>
            </label>
          </div>
          <div class="st-row">
            <label class="st-toggle-row">
              <input type="checkbox" id="st-show-settings"${taskbarPrefs.showSettings ? ' checked' : ''}>
              <span class="st-label">Show settings button</span>
            </label>
          </div>
          <div class="st-row">
            <label class="st-toggle-row">
              <input type="checkbox" id="st-show-tray-btn"${taskbarPrefs.showTrayBtn ? ' checked' : ''}>
              <span class="st-label">Show minimized apps button</span>
            </label>
          </div>
        </div>
      </div>
      <div class="st-pane" id="st-pane-shortcuts">
        <div class="st-section">
          <div class="st-sh">Keyboard Shortcuts</div>
          ${SHORTCUTS.map(s => `
            <div class="st-shortcut-row">
              <span class="st-shortcut-keys">${s.keys}</span>
              <span class="st-label">${s.desc}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export function initSettings(body) {
  const accentVal = body.querySelector('#st-accent-val');
  const accentPicker = body.querySelector('#st-accent-picker');
  if (accentVal && accentPicker) {
    const syncAccent = () => {
      const hex = accentVal.value.trim();
      if (/^#[0-9a-f]{6}$/i.test(hex)) accentPicker.value = hex;
    };
    accentPicker.addEventListener('input', () => { accentVal.value = accentPicker.value; });
    accentVal.addEventListener('input', syncAccent);
  }

  const solidPicker = body.querySelector('.st-solid-picker');
  const solidInput = body.querySelector('.st-solid-input');
  if (solidPicker && solidInput) {
    solidPicker.addEventListener('input', () => {
      solidInput.value = solidPicker.value;
      ds.saveWallpaper({ type: 'solid', value: solidPicker.value });
      applyWallpaper();
    });
    solidInput.addEventListener('input', () => {
      const hex = solidInput.value.trim();
      if (/^#[0-9a-f]{6}$/i.test(hex)) solidPicker.value = hex;
    });
  }

  function refreshPreview(el, color) {
    const preview = el.querySelector('.st-pane#st-pane-appearance .st-section:last-child');
    if (!preview) return;
    const btn = preview.querySelector('.st-grid-btn');
    if (btn) { btn.style.background = `color-mix(in srgb, ${color} 12%, transparent)`; btn.style.color = color; btn.style.borderColor = `color-mix(in srgb, ${color} 20%, transparent)`; }
    const text = preview.querySelector('.st-label');
    if (text) text.style.color = color;
    const swatch = preview.querySelector('span:last-child');
    if (swatch) swatch.style.background = color;
  }

  const fileInput = body.querySelector('#st-file-input');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        ds.saveWallpaper({ type: 'image', value: ev.target.result });
        applyWallpaper();
        body.querySelectorAll('.st-preset-btn, .st-img-preset').forEach(b => b.classList.remove('active'));
        body.querySelectorAll('.st-wp-tab').forEach(t => t.classList.remove('active'));
        body.querySelector('.st-wp-tab[data-wp="image"]').classList.add('active');
        body.querySelectorAll('.st-wp-pane').forEach(p => p.classList.remove('active'));
        body.querySelector('.st-wp-pane[data-wp="image"]').classList.add('active');
      };
      reader.readAsDataURL(file);
    });
  }

  const videoInput = body.querySelector('#st-video-input');
  if (videoInput) {
    videoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        ds.saveWallpaper({ type: 'live', value: ev.target.result });
        applyWallpaper();
        body.querySelectorAll('.st-preset-btn, .st-img-preset').forEach(b => b.classList.remove('active'));
        body.querySelectorAll('.st-wp-tab').forEach(t => t.classList.remove('active'));
        body.querySelector('.st-wp-tab[data-wp="live"]').classList.add('active');
        body.querySelectorAll('.st-wp-pane').forEach(p => p.classList.remove('active'));
        body.querySelector('.st-wp-pane[data-wp="live"]').classList.add('active');
      };
      reader.readAsDataURL(file);
    });
  }

  body.addEventListener('click', e => {
    const tab = e.target.closest('.st-tab');
    if (tab) {
      const pane = body.querySelector(`#st-pane-${tab.dataset.tab}`);
      if (pane && pane.classList.contains('active')) return;
      body.querySelectorAll('.st-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      body.querySelectorAll('.st-pane').forEach(p => p.classList.add('pane-leave'));
      setTimeout(() => {
        body.querySelectorAll('.st-pane').forEach(p => p.classList.remove('active', 'pane-leave'));
        if (pane) pane.classList.add('active');
      }, 120);
      return;
    }

    const wpTab = e.target.closest('.st-wp-tab');
    if (wpTab) {
      const pane = body.querySelector(`.st-wp-pane[data-wp="${wpTab.dataset.wp}"]`);
      if (pane && pane.classList.contains('active')) return;
      body.querySelectorAll('.st-wp-tab').forEach(t => t.classList.remove('active'));
      wpTab.classList.add('active');
      body.querySelectorAll('.st-wp-pane').forEach(p => p.classList.add('pane-leave'));
      setTimeout(() => {
        body.querySelectorAll('.st-wp-pane').forEach(p => p.classList.remove('active', 'pane-leave'));
        if (pane) pane.classList.add('active');
      }, 120);
      if (wpTab.dataset.wp === 'solid') {
        const value = solidInput ? solidInput.value.trim() || solidPicker.value : '#000000';
        ds.saveWallpaper({ type: 'solid', value });
        applyWallpaper();
      }
      return;
    }

    const gridBtn = e.target.closest('.st-grid-btn');
    if (gridBtn) {
      const cols = parseInt(gridBtn.dataset.cols, 10);
      const layout = ds.getLayout();
      ds.setCols(layout, cols);
      refreshDesktop();
      body.querySelectorAll('.st-grid-btn').forEach(b => b.classList.remove('active'));
      gridBtn.classList.add('active');
      return;
    }

    const preset = e.target.closest('.st-preset-btn');
    if (preset) {
      const type = preset.dataset.type;
      const value = preset.dataset.value;
      ds.saveWallpaper({ type, value });
      applyWallpaper();
      body.querySelectorAll('.st-preset-btn').forEach(b => b.classList.remove('active'));
      preset.classList.add('active');
      return;
    }

    const imgPreset = e.target.closest('.st-img-preset');
    if (imgPreset) {
      const type = imgPreset.dataset.type;
      const value = imgPreset.dataset.value;
      ds.saveWallpaper({ type, value });
      applyWallpaper();
      body.querySelectorAll('.st-img-preset').forEach(b => b.classList.remove('active'));
      imgPreset.classList.add('active');
      return;
    }

    const applyGrad = e.target.closest('.st-apply-grad');
    if (applyGrad) {
      const input = body.querySelector('.st-grad-input');
      const value = input ? input.value.trim() : '';
      if (!value) return;
      ds.saveWallpaper({ type: 'gradient', value });
      applyWallpaper();
      body.querySelectorAll('.st-preset-btn').forEach(b => b.classList.remove('active'));
      return;
    }

    const applyUrl = e.target.closest('.st-apply-url');
    if (applyUrl) {
      const input = body.querySelector('.st-url-input');
      const value = input ? input.value.trim() : '';
      if (!value) return;
      ds.saveWallpaper({ type: 'image', value });
      applyWallpaper();
      body.querySelectorAll('.st-img-preset').forEach(b => b.classList.remove('active'));
      return;
    }

    const applySolid = e.target.closest('.st-apply-solid');
    if (applySolid) {
      const value = solidInput ? solidInput.value.trim() : (solidPicker ? solidPicker.value : '#000000');
      if (!value) return;
      ds.saveWallpaper({ type: 'solid', value });
      applyWallpaper();
      body.querySelectorAll('.st-preset-btn').forEach(b => b.classList.remove('active'));
      return;
    }

    const chooseFile = e.target.closest('#st-choose-file');
    if (chooseFile && fileInput) {
      fileInput.click();
      return;
    }

    const chooseVideo = e.target.closest('#st-choose-video');
    if (chooseVideo && videoInput) {
      videoInput.click();
      return;
    }

    const applyLive = e.target.closest('.st-apply-live');
    if (applyLive) {
      const input = body.querySelector('.st-live-input');
      const value = input ? input.value.trim() : '';
      if (!value) return;
      ds.saveWallpaper({ type: 'live', value });
      applyWallpaper();
      body.querySelectorAll('.st-preset-btn').forEach(b => b.classList.remove('active'));
      return;
    }

    const accentPreset = e.target.closest('.st-accent-preset');
    if (accentPreset) {
      const color = accentPreset.dataset.color;
      body.querySelectorAll('.st-accent-preset').forEach(b => b.classList.remove('active'));
      accentPreset.classList.add('active');
      const valInput = document.getElementById('st-accent-val');
      const picker = document.getElementById('st-accent-picker');
      if (valInput) valInput.value = color;
      if (picker) picker.value = color;
      ds.saveAccentColor(color);
      applyTheme();
      refreshPreview(body, color);
      return;
    }

    const themeBtn = e.target.closest('.st-theme-btn');
    if (themeBtn) {
      const theme = themeBtn.dataset.theme;
      body.querySelectorAll('.st-theme-btn').forEach(b => b.classList.remove('active'));
      themeBtn.classList.add('active');
      ds.saveTheme(theme);
      applyTheme();
      return;
    }

    const applyAccent = e.target.closest('#st-apply-accent');
    if (applyAccent) {
      const valInput = document.getElementById('st-accent-val');
      const picker = document.getElementById('st-accent-picker');
      const color = valInput ? valInput.value.trim() : (picker ? picker.value : '#4fc3f7');
      if (!color) return;
      ds.saveAccentColor(color);
      applyTheme();
      body.querySelectorAll('.st-accent-preset').forEach(b => b.classList.remove('active'));
      const match = body.querySelector(`.st-accent-preset[data-color="${color}"]`);
      if (match) match.classList.add('active');
      refreshPreview(body, color);
      return;
    }

    const toggleRow = e.target.closest('.st-toggle-row');
    if (toggleRow) {
      const chk = toggleRow.querySelector('input[type="checkbox"]');
      if (!chk) return;
      if (chk.id === 'st-icon-auto') {
        ds.saveIconColor(chk.checked ? 'auto' : 'custom');
        applyIconColor();
      } else if (chk.id === 'st-wp-match') {
        ds.saveWallpaperMatchTheme(chk.checked);
        applyWallpaper();
      } else {
        const showClock = document.getElementById('st-show-clock').checked;
        const showSettings = document.getElementById('st-show-settings').checked;
        const showTrayBtn = document.getElementById('st-show-tray-btn').checked;
        ds.saveTaskbarPrefs({ showClock, showSettings, showTrayBtn });
        applyTaskbarPrefs();
      }
      return;
    }
  });
}