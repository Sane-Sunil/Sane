export function imgToAscii(url, width = 60) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const height = Math.round(width * (img.height / img.width) * 0.5);
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      const data = ctx.getImageData(0, 0, width, height).data;
      const rows = [];
      for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          row.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
        }
        rows.push(row);
      }
      resolve(rows);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

export function renderAsciiHtml(rows, indent = 2) {
  const pad = ' '.repeat(indent);
  return rows.map(row => {
    const chars = row.map(({ r, g, b }) =>
      `<span style="color:rgb(${r},${g},${b})">█</span>`
    ).join('');
    return pad + chars;
  });
}
