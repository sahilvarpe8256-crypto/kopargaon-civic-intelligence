import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle, CheckCircle2 } from 'lucide-react';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export default function ImageUploader({ file, onFileChange, error, onError }) {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!ALLOWED_MIME_TYPES.includes(selectedFile.type.toLowerCase())) {
      const msg = `Unsupported image format (${selectedFile.type || 'unknown'}). Please upload JPEG, PNG, or WebP.`;
      if (onError) onError(msg);
      return;
    }

    if (selectedFile.size > MAX_SIZE_BYTES) {
      const msg = `File size exceeds 10MB (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller photo.`;
      if (onError) onError(msg);
      return;
    }

    if (onError) onError(null);
    onFileChange(selectedFile);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onFileChange(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="form-group">
      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Waste Evidence Photo *</span>
        <span style={{ fontSize: '0.775rem', color: 'var(--slate-500)' }}>JPEG, PNG, WebP (Max 10MB)</span>
      </label>

      {previewUrl ? (
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '2px solid var(--primary-500)',
            background: '#000',
            maxHeight: '320px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={previewUrl}
            alt="Evidence preview"
            style={{ width: '100%', maxHeight: '320px', objectFit: 'contain' }}
          />
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              display: 'flex',
              gap: '0.5rem'
            }}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.9)' }}
            >
              Replace Photo
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="btn btn-danger"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              background: 'rgba(0,0,0,0.75)',
              color: '#fff',
              padding: '0.25rem 0.6rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <CheckCircle2 size={14} color="#34d399" />
            <span>{file?.name} ({(file?.size / (1024 * 1024)).toFixed(2)} MB)</span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? 'var(--primary-600)' : 'var(--slate-300)'}`,
            background: isDragging ? 'var(--primary-50)' : 'var(--slate-50)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <UploadCloud
            size={44}
            style={{
              color: isDragging ? 'var(--primary-600)' : 'var(--slate-400)',
              margin: '0 auto 0.75rem',
              display: 'block'
            }}
          />
          <h4 style={{ fontSize: '1rem', color: 'var(--slate-800)', marginBottom: '0.35rem' }}>
            Click or drag & drop waste photo here
          </h4>
          <p style={{ fontSize: '0.825rem', color: 'var(--slate-500)' }}>
            High-resolution photo helps Gemini Vision analyze obstruction and health risks accurately
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {error && (
        <div className="alert alert-error" style={{ marginTop: '0.75rem', padding: '0.6rem 0.85rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}