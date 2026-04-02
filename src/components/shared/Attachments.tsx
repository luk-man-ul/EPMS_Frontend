import { useState, useEffect, useRef } from 'react'
import api from '../../utils/api'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'

interface Attachment {
  id: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  createdAt: string
  uploadedById: string
  uploadedBy?: {
    id: string
    firstName: string
    lastName: string
  }
}

interface Props {
  entityType: string
  entityId: string
}

const VITE_API_URL = import.meta.env.VITE_API_URL || ''
const BACKEND_ORIGIN = VITE_API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '')

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf', 'text/plain']

const fileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return '🖼️'
  if (fileType === 'application/pdf') return '📄'
  if (fileType.includes('word') || fileType.includes('docx')) return '📝'
  if (fileType === 'text/plain') return '📃'
  return '📎'
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const resolveUrl = (fileUrl: string): string => {
  if (fileUrl.startsWith('http')) return fileUrl
  const path = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`
  return `${BACKEND_ORIGIN}${path}`
}

const Attachments = ({ entityType, entityId }: Props) => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loadingFiles, setLoadingFiles] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const fetchAttachments = async () => {
    try {
      const res = await api.get(`/files/${entityType}/${entityId}`)
      setAttachments(res.data)
    } catch {
      // silently fail — attachments are non-critical
    } finally {
      setLoadingFiles(false)
    }
  }

  useEffect(() => {
    if (entityType && entityId) fetchAttachments()
  }, [entityType, entityId])

  // Close lightbox on ESC
  useEffect(() => {
    if (!previewUrl) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setPreviewUrl(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [previewUrl])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      showToast('error', 'File too large (max 5MB)')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast('error', 'Unsupported file type')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('entityType', entityType)
    formData.append('entityId', entityId)

    try {
      setUploading(true)
      await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      showToast('success', 'File uploaded successfully')
      await fetchAttachments()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (attachmentId: string) => {
    const previous = attachments
    setDeletingId(attachmentId)
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId))

    try {
      await api.delete(`/files/${attachmentId}`)
      showToast('success', 'File deleted')
    } catch (err: any) {
      setAttachments(previous)
      showToast('error', err.response?.data?.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  const canDelete = (attachment: Attachment): boolean => {
    if (!user) return false
    return user.id === attachment.uploadedById || user.role === 'ADMIN'
  }

  const inputId = `file-upload-${entityType}-${entityId}`

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Attachments {attachments.length > 0 && `(${attachments.length})`}
        </div>

        <label
          htmlFor={inputId}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 8,
            border: '1px solid #e5e5e5',
            background: uploading ? '#f5f5f5' : '#fff',
            color: uploading ? '#999' : '#1a1a1a',
            fontSize: 12,
            fontWeight: 600,
            cursor: uploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {uploading ? '⏳ Uploading...' : '📎 Attach File'}
        </label>
        <input
          id={inputId}
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf,.txt"
          onChange={handleUpload}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </div>

      {/* File list */}
      {loadingFiles ? (
        <p style={{ color: '#bbb', fontSize: 13, margin: 0 }}>Loading attachments...</p>
      ) : attachments.length === 0 ? (
        <p style={{ color: '#bbb', fontSize: 13, margin: 0 }}>No attachments yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {attachments.map((attachment) => {
            const isImage = attachment.fileType.startsWith('image/')
            const resolvedUrl = resolveUrl(attachment.fileUrl)
            const isDeleting = deletingId === attachment.id

            return (
              <div
                key={attachment.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #f0f0f0',
                  background: '#fafafa',
                  transition: 'border-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#e5e5e5')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#f0f0f0')}
              >
                {isImage ? (
                  <img
                    src={resolvedUrl}
                    alt={attachment.fileName}
                    onClick={() => setPreviewUrl(resolvedUrl)}
                    style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', cursor: 'pointer', flexShrink: 0, border: '1px solid #e5e5e5' }}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{fileIcon(attachment.fileType)}</span>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {attachment.fileName}
                  </div>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                    {formatBytes(attachment.fileSize)} · {new Date(attachment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {attachment.uploadedBy && ` · ${attachment.uploadedBy.firstName} ${attachment.uploadedBy.lastName}`}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <a
                    href={resolvedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={attachment.fileName}
                    style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e5e5e5', background: '#fff', color: '#374151', fontSize: 11, fontWeight: 500, textDecoration: 'none', cursor: 'pointer' }}
                  >
                    ↓ Download
                  </a>

                  {canDelete(attachment) && (
                    <button
                      onClick={() => handleDelete(attachment.id)}
                      disabled={isDeleting}
                      style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #fecaca', background: '#fff5f5', color: isDeleting ? '#999' : '#dc2626', fontSize: 11, fontWeight: 500, cursor: isDeleting ? 'not-allowed' : 'pointer' }}
                    >
                      {isDeleting ? '...' : '🗑️'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Lightbox — close on backdrop click or ESC */}
      {previewUrl && (
        <div
          onClick={() => setPreviewUrl(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'zoom-out' }}
        >
          <img
            src={previewUrl}
            alt="Preview"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

export default Attachments
