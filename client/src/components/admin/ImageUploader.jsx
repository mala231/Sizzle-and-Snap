import React, { useState, useRef, useCallback } from 'react';
import { PhotoIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ImageUploader({ onFileSelect, currentImageUrl }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const validate = (file) => {
    if (!file) return 'No file selected.';
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTS.includes(ext) || !ALLOWED_TYPES.includes(file.type)) {
      return 'Only JPG, PNG, or WebP images are allowed.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return 'Image must be smaller than 5 MB.';
    }
    return null;
  };

  const processFile = useCallback((file) => {
    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      setPreview(null);
      onFileSelect(null);
      return;
    }
    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onFileSelect(file);
  }, [onFileSelect]);

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const clearSelection = () => {
    setPreview(null);
    setError(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  // Display priority: new preview > existing server image > empty zone
  const displayImage = preview || (currentImageUrl ? `http://localhost:5000/uploads/${currentImageUrl}` : null);

  return (
    <div className="space-y-xs">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative w-full rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden ${
          dragging
            ? 'border-secondary-container bg-secondary-fixed/30 scale-[1.01]'
            : 'border-outline-variant/50 hover:border-secondary-container/60 hover:bg-surface-container-low'
        }`}
      >
        {displayImage ? (
          <div className="relative group">
            <img
              src={displayImage}
              alt="Item preview"
              className="w-full h-[180px] object-cover"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-sm">
              <ArrowUpTrayIcon className="h-8 w-8 text-white" />
              <span className="text-white text-label-md font-bold">
                {preview ? 'Change Image' : 'Replace Image'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-md py-xl px-md text-center">
            <div className="w-14 h-14 bg-surface-container rounded-full flex items-center justify-center">
              <PhotoIcon className="h-8 w-8 text-on-surface-variant/40" />
            </div>
            <div>
              <p className="text-body-md font-semibold text-on-surface-variant">
                Drop an image here, or{' '}
                <span className="text-secondary-container font-bold underline underline-offset-2">
                  browse
                </span>
              </p>
              <p className="text-label-sm text-on-surface-variant/50 mt-xs">
                JPG, PNG, WebP — max 5 MB
              </p>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between min-h-[20px]">
        {error && (
          <p className="text-error text-label-sm font-bold">{error}</p>
        )}
        {preview && !error && (
          <>
            <p className="text-[#1a6b2a] text-label-sm font-bold flex items-center gap-xs">
              <span className="h-2 w-2 rounded-full bg-[#1a6b2a]" />
              New image selected — ready to upload
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clearSelection(); }}
              className="text-on-surface-variant/50 hover:text-error transition-colors p-xs rounded-full hover:bg-error-container/20"
              title="Remove selection"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
