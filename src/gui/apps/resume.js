export function renderResume(data) {
  const url = data.resumeUrl;
  const enc = url.replace(/ /g, '%20');
  const filename = url.split('/').pop();
  return `
    <div class="rs-layout">
      <div class="rs-bar">
        <a class="rs-dl" href="${enc}" download="${filename}">⬇ Download</a>
      </div>
      <iframe class="rs-frame" src="${enc}#toolbar=0" title="Resume"></iframe>
    </div>
  `;
}
