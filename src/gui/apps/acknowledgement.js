export function showAcknowledgement() {
  const win = document.createElement('div');
  win.className = 'app-window';
  win.style.zIndex = 100000;
  win.style.width = 'min(65vw, 400px)';
  win.style.height = 'auto';

  const header = document.createElement('div');
  header.className = 'app-window-header';

  const title = document.createElement('span');
  title.className = 'app-window-title';
  title.innerHTML = `<span class="app-window-icon">👋</span> About This Page`;
  header.appendChild(title);

  const controls = document.createElement('div');
  controls.className = 'app-window-controls';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'app-window-close';
  closeBtn.textContent = '✕';
  controls.appendChild(closeBtn);

  header.appendChild(controls);
  win.appendChild(header);

  const body = document.createElement('div');
  body.className = 'app-window-body';
  body.style.display = 'flex';
  body.style.flexDirection = 'column';
  body.style.alignItems = 'center';
  body.style.justifyContent = 'center';
  body.style.textAlign = 'center';
  body.style.gap = '12px';
  body.style.padding = '32px 24px';
  body.style.overflow = 'visible';
  body.innerHTML = `
    <img alt="Profile Picture" src="./assets/profile.jpg" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid color-mix(in srgb, var(--text) 10%, transparent);display:block">
    <div style="font-size:15px;font-weight:600;color:var(--text-bright)">I'm Sane Sunil</div>
    <div style="font-size:13px;color:var(--text);line-height:1.6;max-width:280px">Welcome to my portfolio. Feel free to explore my projects and other interesting things. Something is hidden!</div>
    <button class="ack-ok" style="margin-top:8px">OK</button>
  `;
  win.appendChild(body);

  const desktop = document.getElementById('desktop');
  (desktop || document.body).appendChild(win);

  requestAnimationFrame(() => {
    const rect = win.getBoundingClientRect();
    win.style.setProperty('left', Math.max(0, (window.innerWidth - rect.width) / 2) + 'px', 'important');
    win.style.setProperty('top', Math.max(0, (window.innerHeight - rect.height) / 2) + 'px', 'important');
    win.classList.add('anim-enter');
  });

  const close = () => {
    win.classList.add('anim-exit');
    win.addEventListener('transitionend', function handler(e) {
      if (e.propertyName !== 'opacity') return;
      win.removeEventListener('transitionend', handler);
      win.remove();
    });
  };
  closeBtn.addEventListener('click', close);
  body.querySelector('.ack-ok').addEventListener('click', close);
}
