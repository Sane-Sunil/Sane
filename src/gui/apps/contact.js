export function renderContact(data) {
  const c = data.contact || {};
  const items = [];

  for (const [key, val] of Object.entries(c)) {
    if (!key || !val) continue;
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    const kl = key.toLowerCase();

    if (kl === 'email') {
      const esc = val.replace(/'/g, "\\'");
      items.push(`
        <div class="ct-card">
          <div class="ct-ico" style="background:rgba(79,195,247,0.1)">📧</div>
          <div class="ct-body">
            <span class="ct-label">${label}</span>
            <span class="ct-val">${val}</span>
          </div>
          <button class="ct-copy"
            onclick="var t=this;navigator.clipboard.writeText('${esc}').then(function(){t.textContent='\u2713';setTimeout(function(){t.textContent='\uD83D\uDCCB'},1500)})"
          >📋</button>
        </div>
      `);
    } else if (kl === 'github') {
      items.push(`
        <a href="${val}" target="_blank" class="ct-card ct-link">
          <div class="ct-ico" style="background:rgba(51,51,51,0.15)">🐙</div>
          <div class="ct-body">
            <span class="ct-label">${label}</span>
            <span class="ct-val ct-url">${val.replace('https://', '')}</span>
          </div>
          <span class="ct-arr">↗</span>
        </a>
      `);
    } else if (kl === 'linkedin') {
      items.push(`
        <a href="${val}" target="_blank" class="ct-card ct-link">
          <div class="ct-ico" style="background:rgba(10,102,194,0.12)">🔗</div>
          <div class="ct-body">
            <span class="ct-label">${label}</span>
            <span class="ct-val ct-url">${val.replace('https://', '')}</span>
          </div>
          <span class="ct-arr">↗</span>
        </a>
      `);
    } else {
      const display = (typeof val === 'string' && val.startsWith('http'))
        ? `<a href="${val}" target="_blank" class="ct-inline">${val}</a>`
        : val;
      items.push(`
        <div class="ct-card">
          <div class="ct-ico" style="background:rgba(255,255,255,0.04)">📄</div>
          <div class="ct-body">
            <span class="ct-label">${label}</span>
            <span class="ct-val">${display}</span>
          </div>
        </div>
      `);
    }
  }

  return `
    <div class="ct-layout">
      <div class="ct-head">
        <span class="ct-hico">📇</span>
        <div>
          <div class="ct-htitle">Contacts</div>
          <div class="ct-hsub">${items.length} contact method${items.length !== 1 ? 's' : ''}</div>
        </div>
      </div>
      <div class="ct-list">${items.join('')}</div>
    </div>
  `;
}
