/*eslint-disable*/  

/**
 * Image Compression Utility
 * Uses native browser Canvas API for zero-dependency image compression
 * Optimized for mobile devices with low memory (2GB RAM)
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxSizeKB?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
}

/**
 * Get EXIF orientation from image
 */
function getOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const view = new DataView(e.target?.result as ArrayBuffer);
      if (view.getUint16(0, false) !== 0xFFD8) {
        resolve(1);
        return;
      }
      const length = view.byteLength;
      let offset = 2;
      while (offset < length) {
        if (view.getUint16(offset, false) !== 0xFFE1) {
          offset += 2;
          continue;
        }
        const marker = view.getUint16(offset + 2, false);
        if (marker !== 0xE1) {
          offset += 2;
          continue;
        }
        if (view.getUint32(offset + 4, false) !== 0x45786966) {
          offset += 2;
          continue;
        }
        const little = view.getUint16(offset + 10, false) === 0x4949;
        const count = little
          ? view.getUint16(offset + 18, false)
          : view.getUint16(offset + 18, false);
        for (let i = 0; i < count; i++) {
          const entryOffset = offset + 20 + i * 12;
          const tag = little
            ? view.getUint16(entryOffset, true)
            : view.getUint16(entryOffset, false);
          if (tag === 0x0112) {
            const orientation = little
              ? view.getUint16(entryOffset + 8, true)
              : view.getUint16(entryOffset + 8, false);
            resolve(orientation);
            return;
          }
        }
      }
      resolve(1);
    };
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  });
}

/**
 * Apply EXIF orientation to canvas
 */
function applyOrientation(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  orientation: number,
  width: number,
  height: number
): { width: number; height: number } {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, width, 0);
      break;
    case 3:
      ctx.transform(-1, 0, 0, -1, width, height);
      break;
    case 4:
      ctx.transform(1, 0, 0, -1, 0, height);
      break;
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0);
      canvas.width = height;
      canvas.height = width;
      return { width: height, height: width };
    case 6:
      ctx.transform(0, 1, -1, 0, height, 0);
      canvas.width = height;
      canvas.height = width;
      return { width: height, height: width };
    case 7:
      ctx.transform(0, -1, -1, 0, height, width);
      canvas.width = height;
      canvas.height = width;
      return { width: height, height: width };
    case 8:
      ctx.transform(0, -1, 1, 0, 0, width);
      canvas.width = height;
      canvas.height = width;
      return { width: height, height: width };
  }
  
  return { width, height };
}

/**
 * Calculate optimal dimensions maintaining aspect ratio
 */
function calculateDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }
  
  const ratio = Math.min(maxWidth / width, maxHeight / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio)
  };
}

/**
 * Compress image using Canvas API
 */
async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    maxSizeKB = 500,
    quality = 0.85,
    format = 'image/jpeg'
  } = options;

  const originalSize = file.size;
  
  // Check if compression is needed
  const originalSizeKB = originalSize / 1024;
  const needsCompression = originalSizeKB > maxSizeKB;
  
  if (!needsCompression && file.type === format) {
    // Check if resizing is needed by loading image dimensions
    const needsResize = await new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img.width > maxWidth || img.height > maxHeight);
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
      setTimeout(() => {
        URL.revokeObjectURL(img.src);
        resolve(false);
      }, 1000);
    });
    
    if (!needsResize) {
      // No compression needed
      return {
        file,
        originalSize,
        compressedSize: originalSize,
        reductionPercent: 0
      };
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = async () => {
      try {
        // Get EXIF orientation
        const orientation = await getOrientation(file);
        
        // Calculate optimal dimensions
        const { width, height } = calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );
        
        // Create canvas with optimal size
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d', {
          alpha: format === 'image/png',
          willReadFrequently: false
        });
        
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }
        
        // Set high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Apply orientation correction
        const finalDimensions = applyOrientation(
          canvas,
          ctx,
          orientation,
          width,
          height
        );
        
        // Draw image
        ctx.drawImage(img, 0, 0, finalDimensions.width, finalDimensions.height);
        
        // Compress with progressive quality reduction if needed
        let currentQuality = quality;
        let compressedBlob: Blob | null = null;
        
        for (let attempt = 0; attempt < 3; attempt++) {
          compressedBlob = await new Promise<Blob>((blobResolve) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  blobResolve(blob);
                } else {
                  blobResolve(new Blob());
                }
              },
              format,
              currentQuality
            );
          });
          
          const compressedSizeKB = compressedBlob.size / 1024;
          
          if (compressedSizeKB <= maxSizeKB || attempt === 2) {
            break;
          }
          
          // Reduce quality by 10% for next attempt
          currentQuality = Math.max(0.3, currentQuality - 0.1);
        }
        
        if (!compressedBlob || compressedBlob.size === 0) {
          throw new Error('Compression failed');
        }
        
        // Create File from Blob
        const compressedFile = new File(
          [compressedBlob],
          file.name.replace(/\.[^/.]+$/, '') + '.' + format.split('/')[1],
          {
            type: format,
            lastModified: Date.now()
          }
        );
        
        const compressedSize = compressedFile.size;
        const reductionPercent = ((originalSize - compressedSize) / originalSize) * 100;
        
        // Cleanup
        URL.revokeObjectURL(img.src);
        
        resolve({
          file: compressedFile,
          originalSize,
          compressedSize,
          reductionPercent
        });
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Smart compress: Only compress if needed, fallback to original on error
 */
export async function smartCompressImage(
  file: File,
  options?: CompressionOptions
): Promise<File> {
  try {
    // Quick check: if file is already small enough, skip compression
    const fileSizeKB = file.size / 1024;
    if (fileSizeKB <= 200 && file.type === 'image/jpeg') {
      // Check dimensions
      const needsResize = await new Promise<boolean>((resolve) => {
        const testImg = new Image();
        testImg.onload = () => {
          const needs = testImg.width > 800 || testImg.height > 800;
          URL.revokeObjectURL(testImg.src);
          resolve(needs);
        };
        testImg.onerror = () => {
          URL.revokeObjectURL(testImg.src);
          resolve(false);
        };
        testImg.src = URL.createObjectURL(file);
        setTimeout(() => {
          URL.revokeObjectURL(testImg.src);
          resolve(false);
        }, 500);
      });
      
      if (!needsResize) {
        return file;
      }
    }
    
    const result = await compressImage(file, options);
    return result.file;
  } catch (error) {
    // Fallback to original file if compression fails
    console.warn('Image compression failed, using original:', error);
    return file;
  }
}

export default smartCompressImage;

