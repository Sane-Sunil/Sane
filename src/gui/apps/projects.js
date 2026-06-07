export function renderProjects(data) {
  const projects = data.projects || [];
  if (projects.length === 0) return '<p class="empty-state">No projects yet.</p>';

  const allTech = [...new Set(projects.flatMap(p => p['skills/tech'] || []))].sort();
  const techBtns = allTech.map(t =>
    `<button class="pj-btn" data-tech="${t}"
      onclick="
        (function(btn){
          var parent = btn.parentNode;
          parent.querySelectorAll('.pj-btn').forEach(function(b){b.classList.remove('active')});
          btn.classList.add('active');
          var grid = btn.closest('.pj-layout').querySelector('.pj-grid');
          var tech = btn.dataset.tech;
          var count = 0;
          grid.querySelectorAll('.pj-card').forEach(function(card){
            var show = !tech || JSON.parse(card.dataset.pj).tech.indexOf(tech) !== -1;
            card.style.display = show ? '' : 'none';
            if(show) count++;
          });
          btn.closest('.pj-layout').querySelector('.pj-stat').textContent = count + ' project' + (count!==1 ? 's' : '');
        })(this)
      "
    >${t}</button>`
  ).join('');

  const cards = projects.map((p, i) => {
    const tech = (p['skills/tech'] || []).map(t => `<span class="pj-tag">${t}</span>`).join('');
    const live = p.hostedUrl ? `<a href="${p.hostedUrl}" target="_blank" class="pj-act pj-live">🌐 Live</a>` : '';
    const repo = p.repoUrl ? `<a href="${p.repoUrl}" target="_blank" class="pj-act pj-repo">📂 Repo</a>` : '';
    const dataAttr = JSON.stringify({ name: p.name, tech: p['skills/tech'] || [] }).replace(/'/g, "&#39;").replace(/"/g, '&quot;');

    return `
      <div class="pj-card" data-pj='${dataAttr}' style="--i:${i}">
        <div class="pj-card-top">
          <h3 class="pj-name">${p.name}</h3>
          <span class="pj-num">#${i + 1}</span>
        </div>
        <p class="pj-desc">${p.description || ''}</p>
        ${tech ? `<div class="pj-tech">${tech}</div>` : ''}
        ${live || repo ? `<div class="pj-acts">${live}${repo}</div>` : ''}
      </div>
    `;
  }).join('');

  return `
    <div class="pj-layout">
      <div class="pj-bar">
        <div class="pj-search-wrap">
          <span class="pj-sicon">🔍</span>
          <input class="pj-input" type="text" placeholder="Search projects..." oninput="
            (function(inp){
              var q = inp.value.toLowerCase().trim();
              var grid = inp.closest('.pj-layout').querySelector('.pj-grid');
              var count = 0;
              grid.querySelectorAll('.pj-card').forEach(function(card){
                var show = !q || card.textContent.toLowerCase().includes(q);
                card.style.display = show ? '' : 'none';
                if(show) count++;
              });
              inp.closest('.pj-layout').querySelector('.pj-stat').textContent = count + ' project' + (count!==1 ? 's' : '');
              inp.closest('.pj-bar').querySelectorAll('.pj-btn').forEach(function(b){b.classList.remove('active')});
            })(this)
          ">
        </div>
        <div class="pj-filters">
          <button class="pj-btn active" data-tech=""
            onclick="
              (function(btn){
                btn.parentNode.querySelectorAll('.pj-btn').forEach(function(b){b.classList.remove('active')});
                btn.classList.add('active');
                var grid = btn.closest('.pj-layout').querySelector('.pj-grid');
                var count = 0;
                grid.querySelectorAll('.pj-card').forEach(function(c){c.style.display='';count++});
                btn.closest('.pj-layout').querySelector('.pj-stat').textContent = count + ' project' + (count!==1 ? 's' : '');
              })(this)
            "
          >All</button>
          ${techBtns}
        </div>
      </div>
      <div class="pj-stat">${projects.length} projects</div>
      <div class="pj-grid">${cards}</div>
    </div>
  `;
}
