import React, { useRef } from 'react';
import { UploadCloud, Camera, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import './EvidenceUploader.css';

const MAX_PHOTOS = 3;
const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function EvidenceUploader({ photos, onChange, error }) {
  const fileInputRef = useRef(null);

  const handleFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;

    const newPhotos = [...photos];
    const invalidFiles = [];

    Array.from(fileList).forEach((file) => {
      if (newPhotos.length >= MAX_PHOTOS) return;

      if (!ALLOWED_TYPES.includes(file.type)) {
        invalidFiles.push(`${file.name}: Invalid file type. Only JPEG, PNG, WebP allowed.`);
        return;
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        invalidFiles.push(`${file.name}: Exceeds maximum 10MB limit.`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      newPhotos.push({
        file,
        name: file.name,
        size: file.size,
        preview: previewUrl,
        type: file.type
      });
    });

    onChange(newPhotos, invalidFiles.length > 0 ? invalidFiles.join(' ') : null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index) => {
    const photoToRemove = photos[index];
    if (photoToRemove && photoToRemove.preview && photoToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(photoToRemove.preview);
    }
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated, null);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="evidence-uploader-container">
      <div className="uploader-header">
        <h2 className="uploader-title">Add Photo Evidence</h2>
        <p className="uploader-subtitle">
          Upload clear photos of the waste issue. Visual evidence helps municipal officers verify severity and prioritize resource dispatch.
        </p>
      </div>

      {error && (
        <div className="uploader-error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {photos.length < MAX_PHOTOS && (
        <div 
          className="upload-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={(e) => handleFiles(e.target.files)}
            multiple
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
          />
          <div className="dropzone-icon-badge">
            <UploadCloud size={32} />
          </div>
          <div className="dropzone-text">
            <p className="dropzone-main-text">
              <strong>Click to upload</strong> or drag and drop photos here
            </p>
            <p className="dropzone-sub-text">
              JPEG, PNG, WebP • Up to 10 MB per photo • Maximum {MAX_PHOTOS} photos
            </p>
          </div>
          <div className="dropzone-badges">
            <span className="dropzone-pill">
              <Camera size={14} /> Camera Supported
            </span>
            <span className="dropzone-pill">
              <ImageIcon size={14} /> High Resolution
            </span>
          </div>
        </div>
      )}

      <div className="photo-status-bar">
        <span className="photo-count-label">
          {photos.length} of {MAX_PHOTOS} photos selected
        </span>
        <span className="photo-req-label">
          {photos.length === 0 ? '* At least 1 photo required' : '✓ Photo requirement met'}
        </span>
      </div>

      {photos.length > 0 && (
        <div className="preview-grid">
          {photos.map((photo, idx) => (
            <div key={idx} className="preview-card">
              <div className="preview-image-wrapper">
                <img 
                  src={photo.preview || '/placeholder-waste.jpg'} 
                  alt={`Evidence photo ${idx + 1}`} 
                  className="preview-img"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2364748b" stroke-width="1"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                  }}
                />
                <button 
                  type="button"
                  className="btn-remove-photo"
                  onClick={() => handleRemove(idx)}
                  title="Remove photo"
                  aria-label="Remove photo"
                >
                  <X size={16} />
                </button>
                <span className="photo-index-tag">Photo #{idx + 1}</span>
              </div>
              <div className="preview-info">
                <span className="preview-filename" title={photo.name}>{photo.name}</span>
                <span className="preview-filesize">{formatFileSize(photo.size)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}