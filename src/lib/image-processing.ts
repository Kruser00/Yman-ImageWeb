import heic2any from 'heic2any';

export type FilterSettings = {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
};

export type ResizeSettings = {
  width: number | null;
  height: number | null;
  maintainAspectRatio: boolean;
};

export type CVKernel = 'none' | 'edge' | 'sharpen' | 'emboss';

export type ImageSettings = {
  filters: FilterSettings;
  resize: ResizeSettings;
  cvKernel: CVKernel;
  format: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif' | 'image/bmp' | 'image/gif' | 'image/tiff';
  quality: number; // For webp, jpeg, avif
  crop?: { x: number; y: number; width: number; height: number };
};

export const defaultSettings: ImageSettings = {
  filters: {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
  },
  resize: {
    width: null,
    height: null,
    maintainAspectRatio: true,
  },
  cvKernel: 'none',
  format: 'image/jpeg',
  quality: 0.9,
};

const kernels = {
  edge: [
    -1, -1, -1,
    -1,  8, -1,
    -1, -1, -1
  ],
  sharpen: [
     0, -1,  0,
    -1,  5, -1,
     0, -1,  0
  ],
  emboss: [
    -2, -1,  0,
    -1,  1,  1,
     0,  1,  2
  ]
};

function applyConvolution(imageData: ImageData, kernelType: keyof typeof kernels): ImageData {
  const kernel = kernels[kernelType];
  const side = Math.round(Math.sqrt(kernel.length));
  const halfSide = Math.floor(side / 2);
  const src = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  
  const output = new ImageData(w, h);
  const dst = output.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dstOff = (y * w + x) * 4;
      let r = 0, g = 0, b = 0;
      
      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = Math.min(Math.max(y + cy - halfSide, 0), h - 1);
          const scx = Math.min(Math.max(x + cx - halfSide, 0), w - 1);
          const srcOff = (scy * w + scx) * 4;
          const wt = kernel[cy * side + cx];
          r += src[srcOff] * wt;
          g += src[srcOff + 1] * wt;
          b += src[srcOff + 2] * wt;
        }
      }
      
      dst[dstOff]     = r;
      dst[dstOff + 1] = g;
      dst[dstOff + 2] = b;
      dst[dstOff + 3] = src[dstOff + 3];
    }
  }
  return output;
}

export async function processImageSource(
  imageSource: HTMLImageElement,
  settings: ImageSettings
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context not available');

  let sX = 0, sY = 0, sW = imageSource.width, sH = imageSource.height;
  if (settings.crop && settings.crop.width > 0 && settings.crop.height > 0) {
     sX = (settings.crop.x / 100) * imageSource.width;
     sY = (settings.crop.y / 100) * imageSource.height;
     sW = (settings.crop.width / 100) * imageSource.width;
     sH = (settings.crop.height / 100) * imageSource.height;
  }

  // Guard against invalid crop dimensions
  if (sW <= 0 || sH <= 0) {
    sW = imageSource.width;
    sH = imageSource.height;
    sX = 0;
    sY = 0;
  }

  let dW = sW;
  let dH = sH;
  if (settings.resize.width && !settings.resize.height && settings.resize.maintainAspectRatio) {
    dW = settings.resize.width;
    dH = sH * (settings.resize.width / sW);
  } else if (!settings.resize.width && settings.resize.height && settings.resize.maintainAspectRatio) {
    dH = settings.resize.height;
    dW = sW * (settings.resize.height / sH);
  } else if (settings.resize.width || settings.resize.height) {
    dW = settings.resize.width || sW;
    dH = settings.resize.height || sH;
  }

  // Guard against extreme resize values (0 or negative)
  if (dW <= 0) dW = 1;
  if (dH <= 0) dH = 1;

  canvas.width = dW;
  canvas.height = dH;

  const { brightness, contrast, saturation, blur, grayscale } = settings.filters;
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) grayscale(${grayscale}%)`;

  ctx.drawImage(imageSource, sX, sY, sW, sH, 0, 0, dW, dH);
  ctx.filter = 'none';

  if (settings.cvKernel !== 'none' && settings.cvKernel in kernels) {
    const imageData = ctx.getImageData(0, 0, dW, dH);
    const newImageData = applyConvolution(imageData, settings.cvKernel as keyof typeof kernels);
    ctx.putImageData(newImageData, 0, 0);
  }

  // Browser security constraint logic/fallback.
  let exportMime = settings.format;
  try {
     const data = canvas.toDataURL(exportMime, settings.quality);
     return data;
  } catch(e) {
     console.warn('Export format failed, falling back to PNG', e);
     return canvas.toDataURL('image/png');
  }
}

export async function loadImage(file: File): Promise<HTMLImageElement> {
  let fileToLoad = file;

  // Handle HEIC natively if possible
  if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
    try {
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9
      }) as Blob;
      fileToLoad = new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
        type: 'image/jpeg'
      });
    } catch (err) {
      console.warn('HEIC Conversion Failed:', err);
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const url = URL.createObjectURL(fileToLoad);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}
