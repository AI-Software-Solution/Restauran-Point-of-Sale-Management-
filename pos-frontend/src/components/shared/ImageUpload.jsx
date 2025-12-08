import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';

const ImageUpload = ({
  currentImage,
  onImageChange,
  onUpload,
  disabled = false,
  size = 'medium', // small, medium, large
  className = ''
}) => {
  const [preview, setPreview] = useState(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-40 h-40',
    large: 'w-60 h-60'
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Callback
    if (onImageChange) {
      onImageChange(file);
    }

    // Auto upload if handler provided
    if (onUpload) {
      setIsUploading(true);
      try {
        await onUpload(file);
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    if (onImageChange) {
      onImageChange(null);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          ${sizeClasses[size]}
          border-2 border-dashed rounded-lg
          flex flex-col items-center justify-center
          cursor-pointer transition-all duration-200
          ${isDragging
            ? 'border-yellow-500 bg-yellow-500/10'
            : preview
              ? 'border-transparent'
              : 'border-gray-600 hover:border-gray-500 bg-[#2a2a2a]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            {!disabled && (
              <button
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <FiX size={14} />
              </button>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            {isUploading ? (
              <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiImage size={size === 'small' ? 20 : 32} />
                <span className={`text-center ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
                  {isDragging ? "Qo'ying" : "Rasm yuklash"}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

export default ImageUpload;
