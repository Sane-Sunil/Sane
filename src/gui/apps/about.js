export function renderAbout(data) {
  const a = data.about || {};
  const img = a.imageUrl
    ? `<div class="ab-avatar"><img src="${a.imageUrl}" alt="${a.name}" loading="lazy"></div>`
    : '<div class="ab-avatar ab-avatar-none">👤</div>';

  const contactHtml = Object.entries(data.contact || {})
    .filter(([k, v]) => k && v)
    .map(([k, v]) => {
      const label = k.charAt(0).toUpperCase() + k.slice(1);
      const isUrl = typeof v === 'string' && v.startsWith('http');
      const val = isUrl ? `<a href="${v}" target="_blank" class="ab-link">${v}</a>` : v;
      return `<div class="ab-row"><span class="ab-rlabel">${label}</span><span class="ab-rval">${val}</span></div>`;
    }).join('');

  return `
    <div class="ab-layout">
      <div class="ab-sidebar">
        ${img}
        <h2 class="ab-name">${a.name || ''}</h2>
        <p class="ab-title">${(a.title || '').replace(/\n/g, '<br>')}</p>
        <p class="ab-location">📍 ${a.location || ''}</p>
      </div>
      <div class="ab-main">
        <div class="ab-bar">
          <button class="ab-tab active" onclick="
            (function(btn){
              var b=btn.closest('.ab-main').querySelector('.ab-body');
              var old=b.querySelector('.ab-pane.active');
              btn.parentNode.querySelectorAll('.ab-tab').forEach(function(t){t.classList.remove('active')});
              btn.classList.add('active');
              if(old&&old!==b.querySelector('#ab-pane-'+btn.dataset.tab)){old.classList.add('pane-leave');}
              setTimeout(function(){
                b.querySelectorAll('.ab-pane').forEach(function(p){p.classList.remove('active','pane-leave')});
                b.querySelector('#ab-pane-'+btn.dataset.tab).classList.add('active');
              },120);
            })(this)
          " data-tab="bio">Profile</button>
          <button class="ab-tab" onclick="
            (function(btn){
              var b=btn.closest('.ab-main').querySelector('.ab-body');
              var old=b.querySelector('.ab-pane.active');
              btn.parentNode.querySelectorAll('.ab-tab').forEach(function(t){t.classList.remove('active')});
              btn.classList.add('active');
              if(old&&old!==b.querySelector('#ab-pane-'+btn.dataset.tab)){old.classList.add('pane-leave');}
              setTimeout(function(){
                b.querySelectorAll('.ab-pane').forEach(function(p){p.classList.remove('active','pane-leave')});
                b.querySelector('#ab-pane-'+btn.dataset.tab).classList.add('active');
              },120);
            })(this)
          " data-tab="contact">Contact</button>
        </div>
        <div class="ab-body">
          <div class="ab-pane active" id="ab-pane-bio">
            <div class="ab-heading">About</div>
            <p class="ab-bio">${a.bio || ''}</p>
          </div>
          <div class="ab-pane" id="ab-pane-contact">
            <div class="ab-heading">Contact Information</div>
            ${contactHtml || '<p class="ab-empty">No contact info.</p>'}
          </div>
        </div>
      </div>
    </div>
  `;
}
