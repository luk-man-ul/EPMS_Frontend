import { useState } from 'react';
import { Button, LoadingSpinner, ErrorMessage } from '../ui';
import { FilePreview } from './FilePreview';
import type { FileAttachment } from './types';
import api from '../../utils/api';
import './AttachmentList.css';

interface AttachmentListProps {
  files: FileAttachment[];
  onDelete?: (fileId: string) => void;
  currentUserId?: string;
}

export function AttachmentList({ files, onDelete, currentUserId }: AttachmentListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      setDeleting(fileId);
      setError(null);

      await api.delete(`/files/${fileId}`);

      if (onDelete) {
        onDelete(fileId);
      }
    } catch (err: any) {
      console.error('File delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete file');
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (files.length === 0) {
    return (
      <div className="attachment-list-empty">
        <span className="empty-icon">📎</span>
        <p>No attachments yet</p>
      </div>
    );
  }

  return (
    <div className="attachment-list">
      {error && (
        <div className="attachment-list-error">
          <ErrorMessage type="page" message={error} />
        </div>
      )}

      {files.map((file) => (
        <div key={file.id} className="attachment-item">
          <FilePreview file={file} />

          <div className="attachment-info">
            <a
              href={`http://localhost:3000${file.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="attachment-name"
            >
              {file.fileName}
            </a>
            <div className="attachment-meta">
              <span className="attachment-size">{formatFileSize(file.fileSize)}</span>
              <span className="attachment-separator">•</span>
              <span className="attachment-uploader">
                {file.uploadedBy.firstName} {file.uploadedBy.lastName}
              </span>
              <span className="attachment-separator">•</span>
              <span className="attachment-date">{formatDate(file.createdAt)}</span>
            </div>
          </div>

          {currentUserId === file.uploadedById && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(file.id)}
              disabled={deleting === file.id}
              className="attachment-delete-btn"
            >
              {deleting === file.id ? <LoadingSpinner size="sm" /> : '🗑️'}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
