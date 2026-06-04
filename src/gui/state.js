const MODE_KEY = 'portfolio:mode';
const MODES = { GUI: 'gui', CLI: 'cli' };

export function getMode() {
  return localStorage.getItem(MODE_KEY) || MODES.GUI;
}

export function setMode(mode) {
  localStorage.setItem(MODE_KEY, mode);
}

export function isGui() {
  return getMode() === MODES.GUI;
}

export function isCli() {
  return getMode() === MODES.CLI;
}

export function switchToGui() {
  setMode(MODES.GUI);
  location.reload();
}

export function switchToCli() {
  setMode(MODES.CLI);
  location.reload();
}
