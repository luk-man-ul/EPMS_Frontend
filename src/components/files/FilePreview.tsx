import type { FileAttachment } from './types';
import './FilePreview.css';

interface FilePreviewProps {
  file: FileAttachment;
}

export function FilePreview({ file }: FilePreviewProps) {
  const getFileIcon = (fileType: string): string => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType === 'text/plain') return '📃';
    return '📎';
  };

  const isImage = file.fileType.startsWith('image/');

  return (
    <div className="file-preview">
      {isImage ? (
        <img
          src={`${import.meta.env.VITE_API_URL}${file.fileUrl}`}
          alt={file.fileName}
          className="file-preview-image"
        />
      ) : (
        <div className="file-preview-icon">{getFileIcon(file.fileType)}</div>
      )}
    </div>
  );
}