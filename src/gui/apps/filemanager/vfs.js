let tree = null;
let treePromise = null;

async function loadTree() {
  if (tree) return tree;
  if (treePromise) return treePromise;
  treePromise = fetch("./data/vfs.json").then(r => {
    if (!r.ok) throw new Error("Failed to load VFS");
    return r.json();
  });
  tree = await treePromise;
  return tree;
}

export async function getNode(path) {
  const overlay = await getOverlayNode(path);
  if (overlay === "deleted") return null;
  if (overlay) return overlay;
  if (_deletedPaths.has(path)) return null;
  const t = await loadTree();
  const root = t["/"];
  if (path === "/") return root;
  const parts = path.split("/").filter(Boolean);
  let node = root;
  for (const part of parts) {
    if (node && typeof node === "object") {
      const dirKey = part + "/";
      if (dirKey in node) {
        node = node[dirKey];
      } else if (part in node) {
        node = node[part];
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  return node;
}

const MOUNTS_KEY = "portfolio:vfs-mounts";
let mountCache = null;
let mountCachePromise = null;

function getMountMeta() {
  try {
    return JSON.parse(localStorage.getItem(MOUNTS_KEY)) || {};
  } catch { return {}; }
}

function saveMountMeta(meta) {
  localStorage.setItem(MOUNTS_KEY, JSON.stringify(meta));
}

function openMountDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("VFSMounts", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("handles");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadMountsIntoCache(cache) {
  const meta = getMountMeta();
  const paths = Object.keys(meta);
  if (paths.length === 0) return;
  try {
    const db = await openMountDB();
    const tx = db.transaction("handles", "readonly");
    const store = tx.objectStore("handles");
    for (const vfsPath of paths) {
      const handle = await new Promise((res, rej) => {
        const req = store.get(vfsPath);
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
      if (!handle) continue;
      try {
        const perm = await handle.queryPermission({ mode: "read" });
        if (perm === "granted") {
          cache.set(vfsPath, handle);
        } else if (perm === "prompt") {
          const np = await handle.requestPermission({ mode: "read" });
          if (np === "granted") cache.set(vfsPath, handle);
        }
      } catch {}
    }
  } catch {}
}

async function getMounts() {
  if (mountCache) return mountCache;
  if (mountCachePromise) return mountCachePromise;
  mountCachePromise = (async () => {
    const c = new Map();
    await loadMountsIntoCache(c);
    mountCache = c;
    return c;
  })();
  return mountCachePromise;
}

async function putMountHandle(vfsPath, handle) {
  const db = await openMountDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction("handles", "readwrite");
    tx.objectStore("handles").put(handle, vfsPath);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteMountHandle(vfsPath) {
  const db = await openMountDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction("handles", "readwrite");
    tx.objectStore("handles").delete(vfsPath);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function mountFolder(vfsPath) {
  const node = await getNode(vfsPath);
  if (!node || !isFolderEmpty(node)) {
    throw new Error("Can only mount empty folders");
  }
  const handle = await window.showDirectoryPicker({ mode: "readwrite", id: "vfs-mount" });
  await putMountHandle(vfsPath, handle);
  const meta = getMountMeta();
  meta[vfsPath] = { name: handle.name };
  saveMountMeta(meta);
  if (mountCache) mountCache.set(vfsPath, handle);
  else mountCache = new Map([[vfsPath, handle]]);
}

export async function unmountFolder(vfsPath) {
  const meta = getMountMeta();
  delete meta[vfsPath];
  saveMountMeta(meta);
  try { await deleteMountHandle(vfsPath); } catch {}
  if (mountCache) mountCache.delete(vfsPath);
}

export async function isMounted(vfsPath) {
  const mounts = await getMounts();
  return mounts.has(vfsPath);
}

export function isMountedSync(vfsPath) {
  const meta = getMountMeta();
  return vfsPath in meta;
}

export function isFolderEmpty(node) {
  if (!node || typeof node !== "object") return true;
  return Object.keys(node).filter(k => k !== "$path" && k !== "$map").length === 0;
}

async function getLocalChildren(dirHandle, mountPath, currentPath) {
  let handle = dirHandle;
  const rel = currentPath.slice(mountPath.length);
  if (rel) {
    const parts = rel.split("/").filter(Boolean);
    for (const part of parts) {
      handle = await handle.getDirectoryHandle(part);
    }
  }
  const result = [];
  for await (const [name, entry] of handle.entries()) {
    const isDir = entry.kind === "directory";
    result.push({
      name,
      key: isDir ? name + "/" : name,
      isDirectory: isDir,
      node: { $handle: entry },
      path: currentPath === "/"
        ? "/" + name + (isDir ? "/" : "")
        : currentPath + name + (isDir ? "/" : ""),
      map: null,
    });
  }
  return result;
}

export async function getChildren(path) {
  const mounts = await getMounts();
  for (const [mountPath, handle] of mounts) {
    if (path === mountPath || path.startsWith(mountPath)) {
      return getLocalChildren(handle, mountPath, path);
    }
  }
  const node = await getNode(path);
  if (!node || typeof node !== "object") return [];
  const vfsChildren = Object.keys(node)
    .filter(k => k !== "$path" && k !== "$map")
    .map(key => {
      const isDir = key.endsWith("/");
      return {
        name: isDir ? key.slice(0, -1) : key,
        key,
        isDirectory: isDir,
        node: node[key],
        path: path === "/" ? "/" + key : path + key,
        map: node.$map || null,
      };
    });
  return applyOverlay(vfsChildren.filter(c => !_deletedPaths.has(c.path)), path);
}

export function getFilePath(node, mapPath) {
  const p = node && node["$path"];
  if (!p) return null;
  if (mapPath) return mapPath + "/" + p;
  return p;
}

export async function getFileUrl(node) {
  if (node && node.$ref) {
    const refNode = await getNode(node.$ref);
    return refNode ? getFileUrl(refNode) : null;
  }
  if (node && node.$handle) {
    const file = await node.$handle.getFile();
    return URL.createObjectURL(file);
  }
  if (node && node.$overlay !== undefined) {
    return URL.createObjectURL(new Blob([node.$overlay], { type: "text/plain" }));
  }
  const p = node && node["$path"];
  return p || null;
}

export async function getMountForPath(path) {
  const mounts = await getMounts();
  for (const [mountPath, handle] of mounts) {
    if (path === mountPath || path.startsWith(mountPath)) {
      return { handle, mountPath };
    }
  }
  return null;
}

async function navigateHandle(mountHandle, mountPath, path) {
  const rel = path.slice(mountPath.length);
  if (!rel) return mountHandle;
  const parts = rel.split("/").filter(Boolean);
  let h = mountHandle;
  for (const part of parts) {
    h = await h.getDirectoryHandle(part);
  }
  return h;
}

function splitLast(path) {
  const parts = path.split("/").filter(Boolean);
  const name = parts.pop() || "";
  const parent = "/" + parts.join("/") + (parts.length ? "/" : "");
  return { parent, name };
}

// === VFS Overlay (writable layer on top of static VFS) ===

const _deletedPaths = new Set();

const DELETED_KEY = "portfolio:vfs-deleted";

function loadDeleted() {
  try {
    const arr = JSON.parse(localStorage.getItem(DELETED_KEY));
    if (Array.isArray(arr)) for (const p of arr) _deletedPaths.add(p);
  } catch {}
}

function saveDeleted() {
  try { localStorage.setItem(DELETED_KEY, JSON.stringify([..._deletedPaths])); } catch {}
}

loadDeleted();

const OVERLAY_KEY = "portfolio:vfs-overlay";

function loadOverlay() {
  let o;
  try { o = JSON.parse(localStorage.getItem(OVERLAY_KEY)) || {}; } catch { return {}; }
  let migrated = false;
  for (const k of Object.keys(o)) {
    const deleted = o[k].deleted;
    if (deleted != null) {
      delete o[k].deleted;
      for (const name of deleted) {
        const p1 = k + name + (k === "/" ? "" : "/");
        const p2 = k + name + (k === "/" ? "" : "/") + "/";
        _deletedPaths.add(p1);
        _deletedPaths.add(p2);
      }
      migrated = true;
    }
  }
  if (migrated) { saveOverlay(o); saveDeleted(); }
  return o;
}

function saveOverlay(o) {
  for (const k of Object.keys(o)) {
    if (!o[k].children) o[k].children = {};
    if (!Object.keys(o[k].children).length) delete o[k];
  }
  try { localStorage.setItem(OVERLAY_KEY, JSON.stringify(o)); } catch {}
}

function getOverlayFor(path) {
  const o = loadOverlay();
  return o[path] || null;
}

function ensureOverlayEntry(o, path) {
  if (!o[path]) o[path] = { children: {} };
  return o[path];
}

export function vfsDelete(path) {
  _deletedPaths.add(path);
  saveDeleted();
  const { parent, name } = splitLast(path);
  const o = loadOverlay();
  const entry = o[parent];
  if (entry && entry.children && entry.children[name]) {
    delete entry.children[name];
  }
  const dirPrefix = path.endsWith("/") ? path : path + "/";
  for (const k of Object.keys(o)) {
    if (k === dirPrefix || k.startsWith(dirPrefix)) delete o[k];
  }
  saveOverlay(o);

  const meta = getMountMeta();
  for (const mp of Object.keys(meta)) {
    if (mp === path || mp.startsWith(dirPrefix)) {
      delete meta[mp];
      deleteMountHandle(mp).catch(() => {});
      if (mountCache) mountCache.delete(mp);
    }
  }
  saveMountMeta(meta);
}

export function vfsCreate(parentPath, name, isDirectory, content, ref) {
  const o = loadOverlay();
  const entry = ensureOverlayEntry(o, parentPath);
  delete entry.children[name];
  entry.children[name] = ref ? { isDirectory, ref } : { isDirectory, content: content || null };
  saveOverlay(o);
  const fullPath = parentPath + name + (isDirectory ? "/" : "");
  _deletedPaths.delete(fullPath);
  _deletedPaths.delete(parentPath + name + (isDirectory ? "" : "/"));
  saveDeleted();
}

function applyOverlay(children, path) {
  const mod = getOverlayFor(path);
  if (!mod) return children;
  if (mod.children) {
    Object.entries(mod.children).forEach(([name, data]) => {
      const idx = children.findIndex(c => c.name === name);
      if (idx !== -1) children.splice(idx, 1);
      const isDir = data.isDirectory;
      let node;
      if (isDir) {
        node = {};
      } else if (data.ref) {
        node = { $ref: data.ref };
      } else {
        node = { $overlay: data.content };
      }
      children.push({
        name,
        key: isDir ? name + "/" : name,
        isDirectory: isDir,
        node,
        path: path + (isDir ? name + "/" : name),
        map: null,
      });
    });
  }
  return children;
}

export async function getOverlayNode(path) {
  const { parent, name } = splitLast(path);
  const mod = getOverlayFor(parent);
  if (mod && mod.children && mod.children[name]) {
    const data = mod.children[name];
    if (data.isDirectory) return {};
    if (data.ref) return { $ref: data.ref };
    return { $overlay: data.content };
  }
  return null;
}

export async function renameItem(path, newName) {
  const m = await getMountForPath(path);
  if (!m) throw new Error("Not a mounted path");
  const { parent, name } = splitLast(path);
  const parentHandle = await navigateHandle(m.handle, m.mountPath, parent);
  let h;
  try { h = await parentHandle.getDirectoryHandle(name); }
  catch { h = await parentHandle.getFileHandle(name); }
  await h.move(newName);
}

export async function renameMountPoint(oldPath, newName) {
  const mounts = await getMounts();
  const handle = mounts.get(oldPath);
  if (!handle) throw new Error("Mount handle not found");
  const { parent } = splitLast(oldPath);
  const newPath = parent + newName + "/";
  _deletedPaths.add(oldPath);
  saveDeleted();
  const oldName = oldPath.split("/").filter(Boolean).pop();
  const o = loadOverlay();
  if (o[parent] && o[parent].children && o[parent].children[oldName]) {
    delete o[parent].children[oldName];
    saveOverlay(o);
  }
  vfsCreate(parent, newName, true);
  const meta = getMountMeta();
  delete meta[oldPath];
  meta[newPath] = { name: handle.name };
  saveMountMeta(meta);
  await deleteMountHandle(oldPath);
  await putMountHandle(newPath, handle);
  if (mountCache) { mountCache.delete(oldPath); mountCache.set(newPath, handle); }
}

export async function deleteMountedFolder(vfsPath, physical) {
  const mounts = await getMounts();
  const handle = mounts.get(vfsPath);
  if (!handle) throw new Error("Mount handle not found");
  if (physical) {
    try { await handle.remove({ recursive: true }); } catch (err) { throw new Error("Failed to delete files: " + err.message); }
  }
  await unmountFolder(vfsPath);
  vfsDelete(vfsPath);
}

export async function deleteItem(path) {
  const m = await getMountForPath(path);
  if (!m) throw new Error("Not a mounted path");
  const { parent, name } = splitLast(path);
  const parentHandle = await navigateHandle(m.handle, m.mountPath, parent);
  await parentHandle.removeEntry(name, { recursive: true });
}

export async function createFolder(parentPath, name) {
  const m = await getMountForPath(parentPath);
  if (!m) throw new Error("Not a mounted path");
  const h = await navigateHandle(m.handle, m.mountPath, parentPath);
  await h.getDirectoryHandle(name, { create: true });
}

export async function createFile(parentPath, name) {
  const m = await getMountForPath(parentPath);
  if (!m) throw new Error("Not a mounted path");
  const h = await navigateHandle(m.handle, m.mountPath, parentPath);
  const fh = await h.getFileHandle(name, { create: true });
  const w = await fh.createWritable();
  await w.close();
}

export async function pasteFile(parentPath, name, blob) {
  const m = await getMountForPath(parentPath);
  if (!m) throw new Error("Not a mounted path");
  const h = await navigateHandle(m.handle, m.mountPath, parentPath);
  const fh = await h.getFileHandle(name, { create: true });
  const w = await fh.createWritable();
  await w.write(blob);
  await w.close();
}
