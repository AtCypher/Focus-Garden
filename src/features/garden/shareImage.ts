/**
 * Render the garden to a PNG for sharing: serialise the scene SVG, draw it on a canvas with a
 * caption, then hand it to the Web Share API (files) or download it.
 */
export interface ShareOptions {
  svg: SVGSVGElement;
  caption: string;
  subcaption?: string;
  width?: number;
  dark?: boolean;
}

export function svgToDataUrl(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  // Interactive attributes mean nothing in an image.
  clone.querySelectorAll('[tabindex]').forEach((el) => el.removeAttribute('tabindex'));
  const text = new XMLSerializer().serializeToString(clone);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not render the garden image'));
    img.src = url;
  });
}

export async function renderGardenPng({
  svg,
  caption,
  subcaption,
  width = 1200,
  dark = false,
}: ShareOptions): Promise<Blob> {
  const vb = svg.viewBox.baseVal;
  const aspect = vb.height / vb.width;
  const sceneH = Math.round(width * aspect);
  const pad = 48;
  const footer = 150;
  const canvas = document.createElement('canvas');
  canvas.width = width + pad * 2;
  canvas.height = sceneH + pad + footer;
  const c = canvas.getContext('2d');
  if (!c) throw new Error('Canvas not available');
  c.fillStyle = dark ? '#14231b' : '#f4f7f1';
  c.fillRect(0, 0, canvas.width, canvas.height);
  const img = await loadImage(svgToDataUrl(svg));
  c.drawImage(img, pad, pad, width, sceneH);
  c.fillStyle = dark ? '#e8efe6' : '#1f2a22';
  c.font = '600 44px Georgia, "Times New Roman", serif';
  c.textBaseline = 'top';
  c.fillText(caption, pad, sceneH + pad + 36);
  if (subcaption) {
    c.font = '26px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    c.fillStyle = dark ? '#a3b3a6' : '#5b6b5e';
    c.fillText(subcaption, pad, sceneH + pad + 92);
  }
  c.font = '24px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  c.fillStyle = dark ? '#7ca866' : '#2f6b4f';
  c.textAlign = 'right';
  c.fillText('Grown with Grove', canvas.width - pad, sceneH + pad + 100);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode PNG'))), 'image/png'),
  );
}

/** Share through the OS sheet when files are supported, otherwise download. Returns what happened. */
export async function shareOrDownload(
  blob: Blob,
  filename: string,
  title: string,
): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], filename, { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title });
      return 'shared';
    } catch {
      /* user cancelled or share failed: fall back to download */
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return 'downloaded';
}
