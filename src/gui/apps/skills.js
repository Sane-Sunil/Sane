export function renderSkills(data) {
  const s = data.skills || {};
  const cats = Object.keys(s);
  if (cats.length === 0) return '<p class="empty-state">No skills data.</p>';

  const allItems = [];
  cats.forEach(cat => s[cat].forEach(item => allItems.push({ item, cat })));

  const catBtns = `<button class="sk-btn active" data-cat=""
    onclick="
      (function(btn){
        btn.parentNode.querySelectorAll('.sk-btn').forEach(function(b){b.classList.remove('active')});
        btn.classList.add('active');
        var grid = btn.closest('.sk-layout').querySelector('.sk-grid');
        var count = 0;
        grid.querySelectorAll('.sk-item').forEach(function(item){item.style.display='';count++});
        btn.closest('.sk-layout').querySelector('.sk-stat').textContent = count + ' skill' + (count!==1 ? 's' : '');
      })(this)
    "
  >All</button>` +
  cats.map((cat, i) =>
    `<button class="sk-btn" data-cat="${cat}"
      onclick="
        (function(btn){
          btn.parentNode.querySelectorAll('.sk-btn').forEach(function(b){b.classList.remove('active')});
          btn.classList.add('active');
          var grid = btn.closest('.sk-layout').querySelector('.sk-grid');
          var active = btn.dataset.cat;
          var count = 0;
          grid.querySelectorAll('.sk-item').forEach(function(item){
            var show = !active || item.dataset.cat === active;
            item.style.display = show ? '' : 'none';
            if(show) count++;
          });
          btn.closest('.sk-layout').querySelector('.sk-stat').textContent = count + ' skill' + (count!==1 ? 's' : '');
        })(this)
      "
    >${cat.charAt(0).toUpperCase() + cat.slice(1)}</button>`
  ).join('');

  const gridItems = allItems.map((entry, i) => {
    const colorIndex = cats.indexOf(entry.cat);
    const hue = colorIndex * 36;
    return `<div class="sk-item" data-cat="${entry.cat}" style="--sk-h:${hue}">${entry.item}</div>`;
  }).join('');

  return `
    <div class="sk-layout">
      <div class="sk-bar">
        <div class="sk-search-wrap">
          <span class="sk-sicon">🔍</span>
          <input class="sk-input" type="text" placeholder="Search skills..." oninput="
            (function(inp){
              var q = inp.value.toLowerCase().trim();
              var grid = inp.closest('.sk-layout').querySelector('.sk-grid');
              var count = 0;
              grid.querySelectorAll('.sk-item').forEach(function(item){
                var show = !q || item.textContent.toLowerCase().includes(q);
                item.style.display = show ? '' : 'none';
                if(show) count++;
              });
              inp.closest('.sk-layout').querySelector('.sk-stat').textContent = count + ' skill' + (count!==1 ? 's' : '');
              inp.closest('.sk-bar').querySelectorAll('.sk-btn').forEach(function(b){b.classList.remove('active')});
            })(this)
          ">
        </div>
        <div class="sk-filters">${catBtns}</div>
      </div>
      <div class="sk-stat">${allItems.length} skills</div>
      <div class="sk-grid">${gridItems}</div>
    </div>
  `;
}
