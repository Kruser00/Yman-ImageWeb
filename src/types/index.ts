export interface FileInfo {
  id: string;
  file: File;
  previewUrl: string;
  originalWidth?: number;
  originalHeight?: number;
  processedUrl?: string;
  isProcessing: boolean;
  isCompleted: boolean;
  crop?: { x: number; y: number; width: number; height: number };
}
