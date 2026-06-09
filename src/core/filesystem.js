const STORAGE_KEY = 'terminal:fs';

function convertVfs(vfsData) {
  const root = vfsData['/'];
  if (!root) return { type: 'dir', children: {} };

  function walk(node) {
    const children = {};
    for (const key of Object.keys(node)) {
      if (key === '$path' || key === '$map') continue;
      if (key.endsWith('/')) {
        children[key.slice(0, -1)] = { type: 'dir', children: walk(node[key]) };
      } else {
        children[key] = { type: 'file', content: '', $path: node[key].$path || null };
      }
    }
    return children;
  }

  return { type: 'dir', children: walk(root) };
}

export async function createFilesystem() {
  const HOME = '/home';
  let root;
  let cwd = '/';

  async function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { root = JSON.parse(saved); return; }
    } catch {}
    try {
      const res = await fetch('./data/vfs.json');
      const data = await res.json();
      root = convertVfs(data);
    } catch {
      root = { type: 'dir', children: {} };
    }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(root)); } catch {}
  }

  function normalize(path) {
    if (!path || path === '~') return HOME;
    const parts = (path.startsWith('/') ? [] : cwd.split('/').filter(Boolean)).concat(path.split('/').filter(Boolean));
    const result = [];
    for (const p of parts) {
      if (p === '.') continue;
      if (p === '..') { result.pop(); continue; }
      result.push(p);
    }
    return '/' + result.join('/');
  }

  function navigate(path) {
    const normalized = normalize(path);
    if (normalized === '/') return root;
    const parts = normalized.split('/').filter(Boolean);
    let node = root;
    for (const p of parts) {
      if (!node || node.type !== 'dir' || !node.children[p]) return null;
      node = node.children[p];
    }
    return node;
  }

  function parentInfo(path) {
    const normalized = normalize(path);
    if (normalized === '/') return null;
    const parts = normalized.split('/').filter(Boolean);
    const name = parts.pop();
    const parent = navigate('/' + parts.join('/'));
    if (!parent || parent.type !== 'dir') return null;
    return { parent, name };
  }

  await load();

  return {
    pwd() { return cwd; },

    cd(path) {
      if (!path) { cwd = HOME; return true; }
      const node = navigate(path);
      if (!node || node.type !== 'dir') return false;
      cwd = normalize(path);
      return true;
    },

    ls(path) {
      const node = navigate(path || '.');
      if (!node || node.type !== 'dir') return null;
      const entries = Object.keys(node.children).sort();
      const dirs = entries.filter(e => node.children[e].type === 'dir');
      const files = entries.filter(e => node.children[e].type !== 'dir');
      return dirs.map(d => d + '/').concat(files);
    },

    mkdir(path) {
      const info = parentInfo(path);
      if (!info || info.parent.children[info.name]) return false;
      info.parent.children[info.name] = { type: 'dir', children: {} };
      save();
      return true;
    },

    rmdir(path) {
      const node = navigate(path);
      if (!node || node.type !== 'dir') return false;
      if (Object.keys(node.children).length > 0) return false;
      const info = parentInfo(path);
      if (!info) return false;
      delete info.parent.children[info.name];
      if (normalize(path) === cwd) cwd = '/';
      save();
      return true;
    },

    newFile(path) {
      const info = parentInfo(path);
      if (!info) return false;
      if (info.parent.children[info.name]) return false;
      info.parent.children[info.name] = { type: 'file', content: '' };
      save();
      return true;
    },

    rm(path) {
      const info = parentInfo(path);
      if (!info || !info.parent.children[info.name]) return false;
      if (info.parent.children[info.name].type === 'dir') return false;
      delete info.parent.children[info.name];
      save();
      return true;
    },

    rmtree(path) {
      const info = parentInfo(path);
      if (!info || !info.parent.children[info.name]) return false;
      if (info.parent.children[info.name].type !== 'dir') return false;
      delete info.parent.children[info.name];
      if (normalize(path) === cwd) cwd = '/';
      save();
      return true;
    },

    cp(src, dest) {
      const srcNode = navigate(src);
      if (!srcNode) return false;
      let target = dest;
      const destNode = navigate(dest);
      if (destNode && destNode.type === 'dir') {
        const parts = normalize(src).split('/').filter(Boolean);
        target = normalize(dest) + '/' + parts[parts.length - 1];
      }
      const info = parentInfo(target);
      if (!info || info.parent.children[info.name]) return false;
      info.parent.children[info.name] = JSON.parse(JSON.stringify(srcNode));
      save();
      return true;
    },

    mv(src, dest) {
      const srcNode = navigate(src);
      if (!srcNode) return false;
      const srcInfo = parentInfo(src);
      if (!srcInfo) return false;
      let target = dest;
      const destNode = navigate(dest);
      if (destNode && destNode.type === 'dir') {
        const parts = normalize(src).split('/').filter(Boolean);
        target = normalize(dest) + '/' + parts[parts.length - 1];
      }
      const destInfo = parentInfo(target);
      if (!destInfo || destInfo.parent.children[destInfo.name]) return false;
      destInfo.parent.children[destInfo.name] = srcNode;
      delete srcInfo.parent.children[srcInfo.name];
      if (normalize(src) === cwd) cwd = normalize(target);
      save();
      return true;
    },

    async cat(path) {
      const node = navigate(path);
      if (!node || node.type !== 'file') return null;
      if (node.$path && !node.content) {
        try {
          const base = new URL('./data/', window.location.href);
          const url = new URL(node.$path, base).href;
          const res = await fetch(url);
          node.content = await res.text();
          save();
        } catch {
          return null;
        }
      }
      return node.content;
    },

    write(path, content) {
      const info = parentInfo(path);
      if (!info) return false;
      if (info.parent.children[info.name] && info.parent.children[info.name].type !== 'file') return false;
      info.parent.children[info.name] = { type: 'file', content: String(content) };
      save();
      return true;
    },

    tree(path) {
      const node = navigate(path || '.');
      if (!node || node.type !== 'dir') return null;
      const lines = [];
      function walk(n, prefix) {
        const entries = Object.keys(n.children).sort();
        entries.forEach((name, i) => {
          const last = i === entries.length - 1;
          const child = n.children[name];
          lines.push(prefix + (last ? '└── ' : '├── ') + name);
          if (child.type === 'dir') walk(child, prefix + (last ? '    ' : '│   '));
        });
      }
      lines.push(normalize(path || '.'));
      walk(node, '');
      return lines;
    },

    exists(path) { return navigate(path) !== null; },
    isDir(path) { const n = navigate(path); return n && n.type === 'dir'; },
    isFile(path) { const n = navigate(path); return n && n.type === 'file'; },

    getPrompt() {
      if (cwd === HOME) return '~';
      if (cwd.startsWith(HOME + '/')) return '~' + cwd.slice(HOME.length);
      return cwd;
    },

    reset() {
      root = { type: 'dir', children: {} };
      cwd = '/';
      save();
    }
  };
}
