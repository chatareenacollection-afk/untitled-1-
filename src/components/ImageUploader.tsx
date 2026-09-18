import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Trash2, Plus, Star, ArrowLeft, ArrowRight, X, Link as LinkIcon } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  helperText?: string;
}

// Client-side image compression & optimization using HTML5 Canvas
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1400;
        const maxHeight = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // High quality JPEG format
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxImages = 8,
  label = 'Product Pictures / Gallery *',
  helperText = 'Upload directly from your device (phone gallery, desktop, or camera). Supports multiple pictures.',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);

    try {
      const promises: Promise<string>[] = [];
      const fileCount = Math.min(files.length, maxImages - images.length);

      for (let i = 0; i < fileCount; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          promises.push(compressImage(file));
        }
      }

      const newImages = await Promise.all(promises);
      onChange([...images, ...newImages]);
    } catch (err) {
      console.error('Error processing uploaded pictures:', err);
      alert('Some images could not be loaded. Please ensure you are selecting valid picture files.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInputValue.trim()) return;
    onChange([...images, urlInputValue.trim()]);
    setUrlInputValue('');
    setShowUrlInput(false);
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const filtered = images.filter((_, i) => i !== index);
    onChange([target, ...filtered]);
  };

  const handleMoveLeft = (index: number) => {
    if (index <= 0) return;
    const updated = [...images];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  const handleMoveRight = (index: number) => {
    if (index >= images.length - 1) return;
    const updated = [...images];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block font-semibold uppercase text-stone-700 text-xs">
          {label}
        </label>
        <span className="text-[11px] text-stone-500 font-medium">
          {images.length} of {maxImages} uploaded
        </span>
      </div>

      {helperText && (
        <p className="text-[11px] text-stone-500">{helperText}</p>
      )}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Drag & Drop Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#C5A059] bg-[#C5A059]/10'
            : 'border-[#EBDCCB] hover:border-[#C5A059] bg-white hover:bg-[#FAF8F5]'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#C5A059]/40 flex items-center justify-center text-[#A37F37]">
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-stone-800">
              {isProcessing
                ? 'Optimizing and processing picture...'
                : 'Click to select pictures from phone/computer or drag & drop here'}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              JPG, PNG, WEBP, HEIC supported • Max {maxImages} high-resolution photos
            </p>
          </div>
          <button
            type="button"
            className="mt-2 px-4 py-1.5 bg-[#1C1917] hover:bg-stone-800 text-[#DFCA95] rounded text-xs font-semibold tracking-wide border border-[#C5A059]/40 inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Choose Files from Device</span>
          </button>
        </div>
      </div>

      {/* Secondary URL toggle option */}
      <div className="flex items-center justify-between pt-1 text-[11px]">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[#A37F37] hover:underline flex items-center gap-1 cursor-pointer font-medium"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>{showUrlInput ? 'Hide URL link input' : 'Or add via image web URL'}</span>
        </button>
      </div>

      {/* URL Input Form */}
      {showUrlInput && (
        <div className="flex gap-2 p-2.5 bg-stone-100 rounded border border-stone-200 animate-in fade-in">
          <input
            type="url"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            placeholder="Paste image web link (https://...)"
            className="flex-1 bg-white border border-[#EBDCCB] rounded px-3 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 bg-[#C5A059] text-stone-900 rounded font-semibold text-xs hover:bg-[#b08b47]"
          >
            Add Link
          </button>
        </div>
      )}

      {/* Image Gallery Previews Grid */}
      {images.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="text-[11px] font-semibold text-stone-600 flex items-center justify-between">
            <span>Uploaded Gallery (First photo is the Main Storefront Cover):</span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-red-600 hover:text-red-700 hover:underline text-[10px]"
            >
              Clear All Photos
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`relative group rounded-lg overflow-hidden border ${
                  idx === 0
                    ? 'border-2 border-[#C5A059] ring-2 ring-[#C5A059]/30 shadow-md bg-[#FAF8F5]'
                    : 'border-[#EBDCCB] bg-white'
                }`}
              >
                {/* Image Thumbnail */}
                <div className="aspect-3/4 w-full bg-stone-100 relative overflow-hidden">
                  <img
                    src={img}
                    alt={`Product photo ${idx + 1}`}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                    onClick={() => setPreviewModalImg(img)}
                    title="Click to view full preview"
                  />

                  {/* Primary Cover Badge */}
                  {idx === 0 && (
                    <div className="absolute top-1.5 left-1.5 bg-[#1C1917]/90 text-[#DFCA95] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm border border-[#C5A059]/60 flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-current text-[#C5A059]" />
                      Cover
                    </div>
                  )}

                  {/* Photo Number indicator */}
                  <div className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                    #{idx + 1}
                  </div>
                </div>

                {/* Control Action Toolbar */}
                <div className="p-1.5 bg-stone-900 text-white flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveLeft(idx)}
                      disabled={idx === 0}
                      title="Move left"
                      className="p-1 rounded hover:bg-stone-800 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveRight(idx)}
                      disabled={idx === images.length - 1}
                      title="Move right"
                      className="p-1 rounded hover:bg-stone-800 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      title="Make Primary Cover"
                      className="text-[10px] text-[#DFCA95] hover:underline cursor-pointer"
                    >
                      Set Cover
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    title="Delete photo"
                    className="p-1 rounded hover:bg-red-900/60 text-red-300 hover:text-red-200 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox / Zoom modal */}
      {previewModalImg && (
        <div
          className="fixed inset-0 z-70 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewModalImg(null)}
        >
          <div className="relative max-w-xl max-h-[85vh] bg-stone-900 rounded-lg overflow-hidden border border-[#C5A059]/50 shadow-2xl p-2">
            <button
              type="button"
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewModalImg}
              alt="Enlarged preview"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};
