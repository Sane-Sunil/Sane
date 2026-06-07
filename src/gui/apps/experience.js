export function renderExperience(data) {
  const exp = data.experience || [];
  const edu = data.education || [];

  const expItems = exp.map((e, i) => `
    <div class="ex-item" style="--i:${i}">
      <div class="ex-dot"></div>
      <div class="ex-card">
        <div class="ex-ch">
          <div>
            <div class="ex-role">${e.role}</div>
            <div class="ex-org">${e.organization || e.company || ''}</div>
          </div>
          <span class="ex-period">${e.period || ''}</span>
        </div>
        ${e.description ? `<p class="ex-desc">${e.description}</p>` : ''}
      </div>
    </div>
  `).join('');

  const eduItems = edu.map((e, i) => `
    <div class="ex-item" style="--i:${i}">
      <div class="ex-dot"></div>
      <div class="ex-card">
        <div class="ex-ch">
          <div>
            <div class="ex-role">${e.degree}</div>
            <div class="ex-org">${e.school || ''}</div>
          </div>
          <span class="ex-period">${e.year || ''}</span>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <div class="ex-layout">
      <div class="ex-bar">
        <button class="ex-tab active"
          onclick="
            (function(btn){
              var body = btn.closest('.ex-layout').querySelector('.ex-body');
              var old = body.querySelector('.ex-pane.active');
              btn.parentNode.querySelectorAll('.ex-tab').forEach(function(t){t.classList.remove('active')});
              btn.classList.add('active');
              if(old&&old!==body.querySelector(btn.dataset.paneId?('#ex-pane-'+btn.dataset.paneId):'#ex-pane-exp')){old.classList.add('pane-leave');}
              setTimeout(function(){
                body.querySelectorAll('.ex-pane').forEach(function(p){p.classList.remove('active','pane-leave')});
                (body.querySelector(btn.dataset.paneId?'#ex-pane-'+btn.dataset.paneId:'#ex-pane-exp')).classList.add('active');
              },120);
            })(this)
          "
          data-pane-id="exp"
        >💼 Experience</button>
        <button class="ex-tab"
          onclick="
            (function(btn){
              var body = btn.closest('.ex-layout').querySelector('.ex-body');
              var old = body.querySelector('.ex-pane.active');
              btn.parentNode.querySelectorAll('.ex-tab').forEach(function(t){t.classList.remove('active')});
              btn.classList.add('active');
              if(old&&old!==body.querySelector('#ex-pane-'+btn.dataset.paneId)){old.classList.add('pane-leave');}
              setTimeout(function(){
                body.querySelectorAll('.ex-pane').forEach(function(p){p.classList.remove('active','pane-leave')});
                body.querySelector('#ex-pane-'+btn.dataset.paneId).classList.add('active');
              },120);
            })(this)
          "
          data-pane-id="edu"
        >🎓 Education</button>
      </div>
      <div class="ex-body">
        <div class="ex-pane active" id="ex-pane-exp">
          ${expItems ? `<div class="ex-timeline">${expItems}</div>` : '<p class="empty-state">No experience yet.</p>'}
        </div>
        <div class="ex-pane" id="ex-pane-edu">
          ${eduItems ? `<div class="ex-timeline">${eduItems}</div>` : '<p class="empty-state">No education data.</p>'}
        </div>
      </div>
    </div>
  `;
}
