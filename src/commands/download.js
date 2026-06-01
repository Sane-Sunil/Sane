const PROXY = 'https://api.allorigins.win/raw?url=';

function showHelp(print) {
  print('\n');
  print('download -- Download a file from a URL');
  print('');
  print('Usage:');
  print('  <command> | download           Download piped URL');
  print('  download <url>                 Download from URL');
  print('\n');
}

function getFilename(url) {
  return url.split('/').pop().split('?')[0] || 'download';
}

async function tryFetch(url) {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.blob();
}

function triggerDownload(blobUrl, filename) {
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default async function download({ args, flags, print, pipe }) {
  if (flags.includes('help')) {
    showHelp(print);
    return;
  }

  const url = pipe || args[0];

  if (!url) {
    print('download: no URL provided.');
    print('Pipe a URL or specify one as an argument.');
    return;
  }

  print(`Downloading ${getFilename(url)}...`);

  try {
    const blob = await tryFetch(url);
    triggerDownload(URL.createObjectURL(blob), getFilename(url));
    return;
  } catch {
    // CORS or network error — retry through proxy
  }

  try {
    const res = await fetch(PROXY + encodeURIComponent(url));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    triggerDownload(URL.createObjectURL(blob), getFilename(url));
  } catch (err) {
    print(`download: failed — ${err.message}`);
  }
}
