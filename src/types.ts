export type DateFormat = 'DD-MM-YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

export interface StampDetails {
  name: string;
  date: string;
  dateFormat: DateFormat;
  isUppercase: boolean;
  barHeight: number; // typically 38-42px on 200px image
}

export interface PhotoTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number; // 0, 90, 180, 270
}

export interface RenderResult {
  blob: Blob;
  dataUrl: string;
  fileSizeBytes: number;
  fileSizeKB: number;
  width: number;
  height: number;
  qualityUsed: number;
  isUnder30KB: boolean;
}
