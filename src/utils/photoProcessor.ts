import { DateFormat, PhotoTransform, RenderResult, StampDetails } from '../types';

export const TARGET_WIDTH = 150;
export const TARGET_HEIGHT = 200;
export const MAX_SIZE_BYTES = 30 * 1024; // 30,720 bytes (30 KB)
export const SAFE_MAX_BYTES = 30000; // 30,000 bytes safe ceiling for strict portals

/**
 * Formats a Date object or YYYY-MM-DD string into the required display format.
 */
export function formatDate(dateString: string, format: DateFormat): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  switch (format) {
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return `${day}-${month}-${year}`;
  }
}

/**
 * Gets today's date in YYYY-MM-DD format for input value.
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Dynamically fits text to a maximum pixel width by decreasing font size.
 */
function getFittedFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize: number = 7
): { font: string; size: number } {
  let size = startSize;
  ctx.font = `bold ${size}px Arial, "Segoe UI", sans-serif`;
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 0.5;
    ctx.font = `bold ${size}px Arial, "Segoe UI", sans-serif`;
  }
  return { font: `bold ${size}px Arial, "Segoe UI", sans-serif`, size };
}

/**
 * Renders the photo and stamp onto an offscreen 150x200 canvas.
 */
export function renderToCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  transform: PhotoTransform,
  stamp: StampDetails
): void {
  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  // 1. Fill solid light background (standard for passport photos)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

  // 2. Enable smooth image rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 3. Draw the user photo transformed
  ctx.save();

  // Bottom stamp bar height (e.g. 40px)
  const barHeight = Math.max(32, Math.min(50, stamp.barHeight || 40));
  const photoAreaHeight = TARGET_HEIGHT - barHeight;

  // Clip to the photo area so image doesn't bleed behind translucent elements
  ctx.beginPath();
  ctx.rect(0, 0, TARGET_WIDTH, photoAreaHeight);
  ctx.clip();

  // Center of photo area
  const centerX = TARGET_WIDTH / 2 + transform.offsetX;
  const centerY = photoAreaHeight / 2 + transform.offsetY;

  ctx.translate(centerX, centerY);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.scale(transform.scale, transform.scale);

  // Compute aspect ratio fit
  const imgW = image.naturalWidth || image.width;
  const imgH = image.naturalHeight || image.height;
  const imgAspect = imgW / imgH;
  const targetAspect = TARGET_WIDTH / photoAreaHeight;

  let drawW: number;
  let drawH: number;

  if (imgAspect > targetAspect) {
    // Image is wider than target area
    drawH = photoAreaHeight;
    drawW = photoAreaHeight * imgAspect;
  } else {
    // Image is taller than target area
    drawW = TARGET_WIDTH;
    drawH = TARGET_WIDTH / imgAspect;
  }

  ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  // 4. Draw the Bottom White Name & Date Portion
  const barY = TARGET_HEIGHT - barHeight;

  // Crisp White Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, barY, TARGET_WIDTH, barHeight);

  // Crisp top border line to separate photo from text
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, barY + 0.5);
  ctx.lineTo(TARGET_WIDTH, barY + 0.5);
  ctx.stroke();

  // Outer border frame for the entire 150x200 photo
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, TARGET_WIDTH - 1, TARGET_HEIGHT - 1);

  // 5. Draw Name and Date
  const rawName = (stamp.name || 'YOUR FULL NAME').trim();
  const displayName = stamp.isUppercase ? rawName.toUpperCase() : rawName;
  const displayDate = formatDate(stamp.date || getTodayDateString(), stamp.dateFormat);

  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxTextWidth = TARGET_WIDTH - 8; // 4px padding on each side

  // Calculate vertical centerlines for Name (line 1) and Date (line 2)
  const line1Y = barY + barHeight * 0.32;
  const line2Y = barY + barHeight * 0.74;

  // Name (Line 1) - Bold & dynamically fitted
  const { font: nameFont } = getFittedFont(ctx, displayName, maxTextWidth, 11, 7.5);
  ctx.font = nameFont;
  ctx.fillText(displayName, TARGET_WIDTH / 2, line1Y);

  // Date (Line 2) - Bold and clear
  const { font: dateFont } = getFittedFont(ctx, displayDate, maxTextWidth, 10, 8);
  ctx.font = dateFont;
  ctx.fillText(displayDate, TARGET_WIDTH / 2, line2Y);
}

/**
 * Iteratively compresses the canvas to a JPEG Blob strictly under 30 KB.
 */
export async function exportStrictJpg(
  canvas: HTMLCanvasElement,
  maxSizeBytes: number = SAFE_MAX_BYTES
): Promise<RenderResult> {
  // Try qualities starting from high to ensure maximum clarity,
  // stepping down if needed to ensure file size <= 30 KB.
  const qualitySteps = [0.95, 0.92, 0.88, 0.84, 0.80, 0.75, 0.70, 0.65, 0.60];

  for (const q of qualitySteps) {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', q);
    });

    if (blob && blob.size <= maxSizeBytes) {
      const dataUrl = canvas.toDataURL('image/jpeg', q);
      return {
        blob,
        dataUrl,
        fileSizeBytes: blob.size,
        fileSizeKB: Number((blob.size / 1024).toFixed(1)),
        width: TARGET_WIDTH,
        height: TARGET_HEIGHT,
        qualityUsed: q,
        isUnder30KB: true,
      };
    }
  }

  // Fallback if extreme noise: lowest quality
  const lowestQ = 0.55;
  const finalBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', lowestQ);
  });

  const blobToUse = finalBlob || new Blob([], { type: 'image/jpeg' });
  const dataUrl = canvas.toDataURL('image/jpeg', lowestQ);

  return {
    blob: blobToUse,
    dataUrl,
    fileSizeBytes: blobToUse.size,
    fileSizeKB: Number((blobToUse.size / 1024).toFixed(1)),
    width: TARGET_WIDTH,
    height: TARGET_HEIGHT,
    qualityUsed: lowestQ,
    isUnder30KB: blobToUse.size <= MAX_SIZE_BYTES,
  };
}

/**
 * Creates a clean portrait silhouette template for immediate preview.
 */
export function createSamplePortraitImage(): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 300;
    sampleCanvas.height = 400;
    const ctx = sampleCanvas.getContext('2d');
    if (!ctx) {
      const img = new Image();
      resolve(img);
      return;
    }

    // Clean neutral studio background
    ctx.fillStyle = '#f5f5f7';
    ctx.fillRect(0, 0, 300, 400);

    // Subtle alignment grid
    ctx.strokeStyle = '#e5e5ea';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(150, 30);
    ctx.lineTo(150, 370);
    ctx.moveTo(40, 200);
    ctx.lineTo(260, 200);
    ctx.stroke();

    // Torso / Shoulders
    ctx.fillStyle = '#636366';
    ctx.beginPath();
    ctx.moveTo(35, 400);
    ctx.bezierCurveTo(45, 295, 90, 255, 150, 255);
    ctx.bezierCurveTo(210, 255, 255, 295, 265, 400);
    ctx.closePath();
    ctx.fill();

    // Neck
    ctx.fillStyle = '#8e8e93';
    ctx.beginPath();
    ctx.rect(133, 195, 34, 62);
    ctx.fill();

    // Head Silhouette
    ctx.fillStyle = '#636366';
    ctx.beginPath();
    ctx.ellipse(150, 148, 50, 64, 0, 0, Math.PI * 2);
    ctx.fill();

    // Guide oval
    ctx.strokeStyle = '#0071e3';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.ellipse(150, 148, 60, 76, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Studio guide typography
    ctx.fillStyle = '#1d1d1f';
    ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SAMPLE TEMPLATE', 150, 144);

    ctx.font = '400 10px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
    ctx.fillStyle = '#86868b';
    ctx.fillText('Select or take photo to replace', 150, 162);

    const img = new Image();
    img.onload = () => resolve(img);
    img.src = sampleCanvas.toDataURL('image/png');
  });
}
