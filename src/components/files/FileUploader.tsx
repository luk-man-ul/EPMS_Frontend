import { useState, useRef } from 'react';
import { Button, ErrorMessage } from '../ui';
import api from '../../utils/api';
import type { EntityType, FileAttachment } from './types';
import './FileUploader.css';

interface FileUploaderProps {
  entityType: EntityType;
  entityId: string;
  onUploadSuccess: (file: FileAttachment) => void;
}

const ALLOWED_TYPES = ['.jpg', '.jpeg', '.png', '.pdf', '.docx', '.txt'];
const MAX_SIZE_MB = 10;

export function FileUploader({ entityType, entityId, onUploadSuccess }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File size must be less than ${MAX_SIZE_MB}MB`);
      return;
    }

    // Validate file type
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(fileExt)) {
      setError(`File type not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);
      formData.append('entityId', entityId);

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onUploadSuccess(response.data);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-uploader">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept={ALLOWED_TYPES.join(',')}
        disabled={uploading}
        className="file-input"
        id="file-upload-input"
      />
      <label htmlFor="file-upload-input" className="file-upload-label">
        <Button
          variant="secondary"
          size="sm"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          {uploading ? 'Uploading...' : '📎 Attach File'}
        </Button>
      </label>

      {error && (
        <div className="file-upload-error">
          <ErrorMessage type="page" message={error} />
        </div>
      )}

      <div className="file-upload-hint">
        Max {MAX_SIZE_MB}MB • {ALLOWED_TYPES.join(', ')}
      </div>
    </div>
  );
}
