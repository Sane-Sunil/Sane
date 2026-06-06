import { getChildren, getFilePath, getNode, mountFolder, unmountFolder, isMountedSync, getMountForPath, renameItem, renameMountPoint, deleteItem, deleteMountedFolder, createFolder, createFile, pasteFile, vfsDelete, vfsCreate } from "./vfs.js";
import { apps } from "../registry.js";

function childIcon(child) {
  if (child.isDirectory && child.path.startsWith("/apps/") && child.path !== "/apps/") {
    const app = apps.find(a => a.id === child.name);
    if (app) return app.icon;
  }
  if (child.isDirectory && isMountedSync(child.path)) return "\uD83D\uDDFD";
  return child.isDirectory ? "\uD83D\uDCC1" : "\uD83D\uDCC4";
}

export function renderFileManager() {
  return `
    <div class="fm-container">
      <div class="fm-breadcrumb" id="fm-breadcrumb"></div>
      <div class="fm-split">
        <div class="fm-list" id="fm-list"></div>
        <div class="fm-preview" id="fm-preview">
          <div class="fm-preview-empty">Select a file or folder to preview</div>
        </div>
      </div>
    </div>
  `;
}

function escHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function fileViewerIcon(ext) {
  if (/^(jpg|jpeg|png|gif|webp|ico|bmp|svg)$/.test(ext)) return "\uD83D\uDDBC";
  if (ext === "pdf") return "\uD83D\uDCD5";
  if (/^(mp3|wav|ogg|m4a|flac|wma)$/.test(ext)) return "\uD83C\uDFB5";
  if (/^(mp4|webm|ogv|avi|mov|mkv)$/.test(ext)) return "\uD83C\uDFAC";
  return "\uD83D\uDCC4";
}

function isTextExt(ext) {
  return /^(txt|md|json|js|css|html|xml|yml|yaml|csv|sh|py|rb|php|ts|jsx|tsx|log|env|gitignore|conf|cfg|ini|toml|sql|r|go|rs|java|c|cpp|h|hpp|swift|kt|scala|lua|pl|pm|ps1|bat|diff|patch)$/.test(ext);
}

function isImageExt(ext) {
  return /^(jpg|jpeg|png|gif|webp|ico|bmp|svg)$/.test(ext);
}

function isPdfExt(ext) {
  return ext === "pdf";
}

function isAudioExt(ext) {
  return /^(mp3|wav|ogg|m4a|flac|wma)$/.test(ext);
}

function isVideoExt(ext) {
  return /^(mp4|webm|ogv|avi|mov|mkv)$/.test(ext);
}

let _openUrls = [];
let _clipboard = null;

function buildContextMenu(items, x, y) {
  closeFmContextMenu();
  const menu = document.createElement("div");
  menu.className = "fm-context-menu";
  menu.style.left = x + "px";
  menu.style.top = y + "px";
  items.forEach(item => {
    if (item === null) {
      const sep = document.createElement("div");
      sep.className = "fm-context-sep";
      menu.appendChild(sep);
    } else {
      const el = document.createElement("div");
      el.className = "fm-context-item";
      if (item.danger) el.style.color = "#e57373";
      el.textContent = item.label;
      el.addEventListener("click", async ev => {
        ev.stopPropagation();
        closeFmContextMenu();
        try { await item.action(); } catch (err) { console.error(err); }
      });
      menu.appendChild(el);
    }
  });
  document.body.appendChild(menu);
}

function copyPathToClipboard(path) {
  try { navigator.clipboard.writeText(path); } catch {}
}

async function pasteNode(srcPath, destParentPath, name, isDirectory, node, map) {
  if (isDirectory) {
    const mountDest = await getMountForPath(destParentPath);
    if (mountDest) {
      await createFolder(destParentPath, name);
    } else {
      vfsCreate(destParentPath, name, true);
    }
    const sub = await getChildren(srcPath);
    for (const c of sub) {
      await pasteNode(c.path, destParentPath + name + "/", c.name, c.isDirectory, c.node, c.map);
    }
  } else {
    const mountDest = await getMountForPath(destParentPath);
    if (mountDest) {
      let blob;
      if (node && node.$handle) {
        blob = await node.$handle.getFile();
      } else if (node && node.$overlay !== undefined) {
        blob = new Blob([node.$overlay], { type: "text/plain" });
      } else {
        const fp = getFilePath(node, map);
        if (fp) { const r = await fetch(fp); blob = await r.blob(); }
      }
      if (blob) await pasteFile(destParentPath, name, blob);
    } else {
      if (node && node.$handle) {
        const file = await node.$handle.getFile();
        const text = await file.text();
        vfsCreate(destParentPath, name, false, text);
      } else {
        vfsCreate(destParentPath, name, false, "", srcPath);
      }
    }
  }
}

async function openFileWindow(item) {
  if (item.node && item.node.$ref) {
    const refNode = await getNode(item.node.$ref);
    if (refNode) item = { ...item, node: refNode };
  }
  const ext = (item.name.split(".").pop() || "").toLowerCase();
  const isImg = isImageExt(ext);
  const isPdf = isPdfExt(ext);
  const isAud = isAudioExt(ext);
  const isVid = isVideoExt(ext);
  const isTxt = isTextExt(ext);
  const isMountedFile = item.node && item.node.$handle;
  const isOverlayFile = item.node && item.node.$overlay !== undefined;

  const { openApp } = await import("../view.js");
  openApp({
    id: "file-viewer",
    name: item.name,
    icon: fileViewerIcon(ext),
    color: "#78909c",
    render() { return '<p class="app-loading">Loading file...</p>'; },
    async init(body) {
      let filePath;
      if (isMountedFile) {
        const file = await item.node.$handle.getFile();
        const url = URL.createObjectURL(file);
        _openUrls.push(url);
        filePath = url;
      } else if (isOverlayFile) {
        const blob = new Blob([item.node.$overlay || ""], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        _openUrls.push(url);
        filePath = url;
      } else {
        filePath = getFilePath(item.node, item.map);
      }
      if (!filePath) { body.innerHTML = '<p class="app-error">No file path</p>'; return; }
      if (isImg) {
        body.style.overflow = "auto";
        body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:200px;height:100%"><img src="' + filePath + '" style="max-width:100%;max-height:100%;object-fit:contain" alt="' + item.name + '" /></div>';
      } else if (isPdf) {
        body.style.padding = "0";
        body.innerHTML = '<iframe src="' + filePath + '" style="width:100%;height:100%;border:none;display:block"></iframe>';
      } else if (isAud) {
        body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%"><audio controls src="' + filePath + '" style="width:80%"></audio></div>';
      } else if (isVid) {
        body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%"><video controls src="' + filePath + '" style="max-width:100%;max-height:100%"></video></div>';
      } else if (isTxt) {
        try {
          let text;
          if (isMountedFile) {
            const file = await item.node.$handle.getFile();
            text = await file.text();
          } else if (isOverlayFile) {
            text = item.node.$overlay || "";
          } else {
            const resp = await fetch(filePath);
            if (!resp.ok) throw Error();
            text = await resp.text();
          }
          body.innerHTML = '<pre class="fm-viewer-content">' + escHtml(text) + '</pre>';
          if (isMountedFile || isOverlayFile) {
            const idx = _openUrls.indexOf(filePath);
            if (idx !== -1) { URL.revokeObjectURL(filePath); _openUrls.splice(idx, 1); }
          }
        } catch {
          body.innerHTML = '<p class="app-error">Could not load file content</p>';
        }
      } else {
        body.innerHTML = '<p class="app-error">Cannot preview this file type</p>';
      }
    }
  });
}

function closeFmContextMenu() {
  document.querySelectorAll(".fm-context-menu").forEach(m => m.remove());
}

document.addEventListener("click", closeFmContextMenu, true);

export function initFileManager(body) {
  let currentPath = "/";
  let selectedItem = null;
  let clickTimer = null;
  let clickKey = null;

  function renderBreadcrumb() {
    const el = body.querySelector("#fm-breadcrumb");
    if (!el) return;
    const parts = currentPath.split("/").filter(Boolean);
    let html = '<span class="fm-breadcrumb-item" data-path="/">&#x1F4C1;</span>';
    let cumulative = "/";
    parts.forEach((part, i) => {
      cumulative += part + "/";
      const isLast = i === parts.length - 1;
      html += '<span class="fm-breadcrumb-sep">&#9656;</span>';
      if (isLast) {
        html += `<span class="fm-breadcrumb-item fm-breadcrumb-current">${part}</span>`;
      } else {
        html += `<span class="fm-breadcrumb-item" data-path="${cumulative}">${part}</span>`;
      }
    });
    el.innerHTML = html;
  }

  async function renderList() {
    const el = body.querySelector("#fm-list");
    if (!el) return;
    let children;
    try {
      children = await getChildren(currentPath);
    } catch {
      el.innerHTML = '<div class="fm-empty">Error loading folder</div>';
      return;
    }
    if (!children || children.length === 0) {
      el.innerHTML = '<div class="fm-empty">This folder is empty</div>';
      return;
    }
    el.innerHTML = children
      .map(
        child =>
          `<div class="fm-list-item${selectedItem && selectedItem.key === child.key ? " active" : ""}" data-key="${child.key}">
            <span class="fm-list-icon">${childIcon(child)}</span>
            <span class="fm-list-name">${child.name}</span>
          </div>`
      )
      .join("");
  }

  async function renderPreview(item) {
    const el = body.querySelector("#fm-preview");
    if (!el) return;
    if (!item) {
      el.innerHTML = '<div class="fm-preview-empty">Select a file or folder to preview</div>';
      return;
    }
    if (item.isDirectory) {
      let sub;
      try {
        sub = await getChildren(item.path);
      } catch { sub = []; }
      el.innerHTML = `
        <div class="fm-preview-title">&#x1F4C1; ${item.name}</div>
        <div class="fm-preview-children">
          ${
            sub.length === 0
              ? '<span style="opacity:0.5;font-size:12px;">Empty folder</span>'
              : sub
                  .map(
                    c =>
                      `<div class="fm-preview-child-item">${childIcon(c)} ${c.name}</div>`
                  )
                  .join("")
          }
        </div>
      `;
    } else {
      if (item.node && item.node.$ref) {
        const refNode = await getNode(item.node.$ref);
        if (refNode) item = { ...item, node: refNode };
      }
      const isMountedFile = item.node && item.node.$handle;
      const isOverlayFile = item.node && item.node.$overlay !== undefined;
      el.innerHTML = `
        <div class="fm-preview-title">&#x1F4C4; ${item.name}</div>
        <div class="fm-preview-content">Loading...</div>
      `;
      try {
        let text;
        if (isMountedFile) {
          const file = await item.node.$handle.getFile();
          text = await file.text();
        } else if (isOverlayFile) {
          text = item.node.$overlay || "";
        } else {
          const filePath = getFilePath(item.node, item.map);
          if (!filePath) throw new Error("No file path");
          const resp = await fetch(filePath);
          if (!resp.ok) throw new Error("Failed to load");
          text = await resp.text();
        }
        const contentEl = el.querySelector(".fm-preview-content");
        if (contentEl) contentEl.textContent = text;
      } catch {
        const contentEl = el.querySelector(".fm-preview-content");
        if (contentEl) contentEl.textContent = "Error: Could not load file content";
      }
    }
  }

  async function navigateToInternal(path) {
    currentPath = path;
    selectedItem = null;
    renderBreadcrumb();
    await renderList();
    renderPreview(null);
  }

  async function selectItem(item) {
    selectedItem = item;
    await renderList();
    renderPreview(item);
  }

  body.addEventListener("click", async e => {
    closeFmContextMenu();

    const bcItem = e.target.closest(".fm-breadcrumb-item[data-path]");
    if (bcItem) {
      clickTimer = null;
      clickKey = null;
      await navigateToInternal(bcItem.dataset.path);
      return;
    }

    const listItem = e.target.closest(".fm-list-item");
    if (!listItem) return;

    const key = listItem.dataset.key;
    let children;
    try {
      children = await getChildren(currentPath);
    } catch { return; }
    const child = children.find(c => c.key === key);
    if (!child) return;

    body.querySelectorAll(".fm-list-item").forEach(el => el.classList.remove("active"));
    listItem.classList.add("active");

    if (child.isDirectory) {
      clickTimer = null;
      clickKey = null;
      if (child.path.startsWith("/apps/") && child.path !== "/apps/") {
        const { apps } = await import("../registry.js");
        const { openApp } = await import("../view.js");
        const app = apps.find(a => a.id === child.name);
        if (app) openApp(app);
        return;
      }
      await navigateToInternal(child.path);
    } else {
      if (clickTimer && clickKey === key) {
        clearTimeout(clickTimer);
        clickTimer = null;
        clickKey = null;
        openFileWindow(child);
      } else {
        clearTimeout(clickTimer);
        clickKey = key;
        clickTimer = setTimeout(async () => {
          clickTimer = null;
          clickKey = null;
          await selectItem(child);
        }, 250);
      }
    }
  });

  body.addEventListener("contextmenu", async e => {
    const listItem = e.target.closest(".fm-list-item");

    if (!listItem) {
      e.preventDefault();
      const mountInfo = await getMountForPath(currentPath);
      const items = [];
      if (mountInfo) {
        if (_clipboard) {
          items.push({ label: "Paste", action: async () => {
            let newName = prompt("Paste as:", _clipboard.name);
            if (!newName) return;
            if (_clipboard.isDirectory) {
              await pasteNode(_clipboard.sourcePath, currentPath, newName, true, null, null);
            } else {
              const blob = await _clipboard.getBlob();
              await pasteFile(currentPath, newName, blob);
            }
            await renderList();
          }});
          items.push(null);
        }
        items.push({ label: "New Folder", action: async () => {
          const name = prompt("Folder name:");
          if (!name) return;
          await createFolder(currentPath, name);
          await renderList();
        }});
        items.push({ label: "New File", action: async () => {
          const name = prompt("File name:");
          if (!name) return;
          await createFile(currentPath, name);
          await renderList();
        }});
      } else {
        if (_clipboard) {
          items.push({ label: "Paste", action: async () => {
            let newName = prompt("Paste as:", _clipboard.name);
            if (!newName) return;
            if (_clipboard.isDirectory) {
              await pasteNode(_clipboard.sourcePath, currentPath, newName, true, null, null);
            } else {
              const blob = await _clipboard.getBlob();
              const text = await blob.text();
              vfsCreate(currentPath, newName, false, text);
            }
            await renderList();
          }});
          items.push(null);
        }
        items.push({ label: "New Folder", action: async () => {
          const name = prompt("Folder name:");
          if (!name) return;
          vfsCreate(currentPath, name, true);
          await renderList();
        }});
        items.push({ label: "New File", action: async () => {
          const name = prompt("File name:");
          if (!name) return;
          vfsCreate(currentPath, name, false, "");
          await renderList();
        }});
        const bgChildren = await getChildren(currentPath);
        if (bgChildren.length === 0) {
          items.push(null);
          items.push({ label: "Mount Local Folder", action: async () => {
            try { await mountFolder(currentPath); } catch (err) { alert(err.message); }
            await renderList();
            renderBreadcrumb();
          }});
        }
      }
      if (items.length) buildContextMenu(items, e.clientX, e.clientY);
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const key = listItem.dataset.key;
    let children;
    try {
      children = await getChildren(currentPath);
    } catch { return; }
    const child = children.find(c => c.key === key);
    if (!child) return;

    const mountInfo = await getMountForPath(child.path);
    const isWithinMount = !!mountInfo;
    const subChildren = child.isDirectory ? await getChildren(child.path) : [];
    const empty = subChildren.length === 0;
    const isMountedDir = child.isDirectory && isMountedSync(child.path);

    const items = [];

    items.push({ label: "Copy", action: async () => {
      if (child.isDirectory) {
        _clipboard = { name: child.name, isDirectory: true, sourcePath: child.path, isWithinMount };
      } else if (isWithinMount && child.node && child.node.$handle) {
        const h = child.node.$handle;
        _clipboard = { name: child.name, getBlob: () => h.getFile() };
      } else {
        const fp = getFilePath(child.node, child.map);
        _clipboard = { name: child.name, getBlob: async () => { const r = await fetch(fp); return r.blob(); } };
      }
    }});
    items.push({ label: "Copy Path", action: () => copyPathToClipboard(child.path) });

    if (_clipboard && child.isDirectory && isWithinMount) {
      items.push(null);
      items.push({ label: "Paste", action: async () => {
        let newName = prompt("Paste as:", _clipboard.name);
        if (!newName) return;
        if (_clipboard.isDirectory) {
          await pasteNode(_clipboard.sourcePath, child.path, newName, true, null, null);
        } else {
          const blob = await _clipboard.getBlob();
          await pasteFile(child.path, newName, blob);
        }
        await renderList();
      }});
    }

    if (child.isDirectory) {
      if (isMountedDir) {
        items.push(null);
        items.push({ label: "Unmount Folder", action: async () => {
          await unmountFolder(child.path);
          if (currentPath === child.path) await navigateToInternal(currentPath);
          else { await renderList(); renderBreadcrumb(); }
        }});
        items.push({ label: "Delete", danger: true, action: async () => {
          if (!confirm(`Delete "${child.name}"?`)) return;
          const physical = confirm('Also permanently delete the files from your computer?');
          try { await deleteMountedFolder(child.path, physical); } catch (err) { alert(err.message); return; }
          if (currentPath === child.path) await navigateToInternal(currentPath);
          else { await renderList(); renderBreadcrumb(); }
        }});
      } else if (!isWithinMount && empty) {
        items.push(null);
        items.push({ label: "Mount Local Folder", action: async () => {
          try { await mountFolder(child.path); } catch (err) { alert(err.message); }
          if (currentPath === child.path) await navigateToInternal(currentPath);
          else { await renderList(); renderBreadcrumb(); }
        }});
      }
    }

    if (isWithinMount) {
      items.push(null);
      items.push({ label: "Rename", action: async () => {
        const newName = prompt("Rename:", child.name);
        if (!newName || newName === child.name) return;
        try {
          if (isMountedDir) await renameMountPoint(child.path, newName);
          else await renameItem(child.path, newName);
        } catch (err) { alert(err.message); return; }
        await renderList();
      }});
      if (!isMountedDir) {
        items.push({ label: "Delete", danger: true, action: async () => {
          if (!confirm(`Delete "${child.name}"?`)) return;
          await deleteItem(child.path);
          await renderList();
        }});
      }
      if (child.isDirectory) {
        items.push(null);
        items.push({ label: "New Folder", action: async () => {
          const name = prompt("Folder name:");
          if (!name) return;
          await createFolder(child.path, name);
          await renderList();
        }});
        items.push({ label: "New File", action: async () => {
          const name = prompt("File name:");
          if (!name) return;
          await createFile(child.path, name);
          await renderList();
        }});
      }
    } else {
      if (_clipboard && child.isDirectory) {
        items.push(null);
        items.push({ label: "Paste", action: async () => {
          let newName = prompt("Paste as:", _clipboard.name);
          if (!newName) return;
          if (_clipboard.isDirectory) {
            await pasteNode(_clipboard.sourcePath, child.path, newName, true, null, null);
          } else {
            const blob = await _clipboard.getBlob();
            const text = await blob.text();
            vfsCreate(child.path, newName, false, text);
          }
          await renderList();
        }});
      }
      items.push(null);
      items.push({ label: "Rename", action: async () => {
        const newName = prompt("Rename:", child.name);
        if (!newName || newName === child.name) return;
        if (child.isDirectory) {
          const sub = await getChildren(child.path);
          vfsDelete(child.path);
          vfsCreate(currentPath, newName, true);
          for (const c of sub) {
            await pasteNode(c.path, currentPath + newName + "/", c.name, c.isDirectory, c.node, c.map);
          }
        } else {
          let content = "";
          let ref;
          if (child.node && child.node.$ref) {
            ref = child.node.$ref;
          } else if (child.node && child.node.$overlay !== undefined) {
            content = child.node.$overlay;
          } else {
            const fp = getFilePath(child.node, child.map);
            if (fp) { try { content = await (await fetch(fp)).text(); } catch {} }
          }
          vfsDelete(child.path);
          vfsCreate(currentPath, newName, false, content, ref);
        }
        await renderList();
      }});
      items.push({ label: "Delete", danger: true, action: async () => {
        if (!confirm(`Delete "${child.name}"?`)) return;
        vfsDelete(child.path);
        await renderList();
      }});
      if (child.isDirectory) {
        items.push(null);
        items.push({ label: "New Folder", action: async () => {
          const name = prompt("Folder name:");
          if (!name) return;
          vfsCreate(child.path, name, true);
          await renderList();
        }});
        items.push({ label: "New File", action: async () => {
          const name = prompt("File name:");
          if (!name) return;
          vfsCreate(child.path, name, false, "");
          await renderList();
        }});
      }
    }

    if (items.length) buildContextMenu(items, e.clientX, e.clientY);
  });

  renderBreadcrumb();
  renderList().then(() => renderPreview(null));
}
