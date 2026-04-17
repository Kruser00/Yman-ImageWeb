import React, { useState, useEffect, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropProps {
  imageSrc: string;
  onCropChange: (crop: { x: number; y: number; width: number; height: number } | undefined) => void;
  initialCrop?: { x: number; y: number; width: number; height: number };
}

export const ImageCropTool: React.FC<ImageCropProps> = ({ imageSrc, onCropChange, initialCrop }) => {
  const [crop, setCrop] = useState<Crop>();
  
  useEffect(() => {
    if (initialCrop && initialCrop.width > 0) {
      setCrop({
        unit: '%',
        x: initialCrop.x,
        y: initialCrop.y,
        width: initialCrop.width,
        height: initialCrop.height
      });
    }
  }, [initialCrop]);

  const handleComplete = (c: PixelCrop, percentCrop: Crop) => {
    if (percentCrop.width > 0 && percentCrop.height > 0) {
      onCropChange(percentCrop as any);
    } else {
      onCropChange(undefined);
    }
  };

  return (
    <div className="flex justify-center items-center h-full w-full bg-black/20 rounded-xl overflow-hidden cool-scrollbar p-2 border border-white/5">
      <ReactCrop
        crop={crop}
        onChange={(_, percentCrop) => setCrop(percentCrop)}
        onComplete={handleComplete}
        className="max-h-full max-w-full"
      >
        <img
          src={imageSrc}
          className="max-w-full max-h-[60vh] object-contain rounded-lg"
          alt="Preview"
        />
      </ReactCrop>
    </div>
  );
};
