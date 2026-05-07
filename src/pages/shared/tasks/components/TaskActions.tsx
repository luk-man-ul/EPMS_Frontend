import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../../context/AuthContext'

interface TaskSnapshot {
  type: string
  status: string
  createdById: string
}

interface Props {
  taskId: string
  task?: TaskSnapshot          // optional — when provided, enables employee edit logic
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

const TaskActions = ({ taskId, task, onEdit, onDelete }: Props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  ////////////////////////////////////////////////////////////
  // CLOSE ON OUTSIDE CLICK
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () =>
      document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  ////////////////////////////////////////////////////////////
  // DETECT WORKSPACE (ADMIN / APP)
  ////////////////////////////////////////////////////////////

  const isAdmin = location.pathname.startsWith('/admin')
  const basePath = isAdmin ? '/admin/tasks' : '/app/tasks'

  ////////////////////////////////////////////////////////////
  // EDIT PERMISSION
  // Admin and Team Lead can always edit.
  // Employee can edit ONLY their own SELF_WORK task while PROPOSED.
  ////////////////////////////////////////////////////////////

  const canEdit =
    user?.role === 'ADMIN' ||
    user?.role === 'TEAM_LEAD' ||
    (
      user?.role === 'EMPLOYEE' &&
      task?.type === 'SELF_WORK' &&
      task?.createdById === user?.id &&
      task?.status === 'PROPOSED'
    )

  const canDelete = user?.role === 'ADMIN' || user?.role === 'TEAM_LEAD'

  ////////////////////////////////////////////////////////////
  // HANDLERS
  ////////////////////////////////////////////////////////////

  const handleView = () => {
    setOpen(false)
    navigate(`${basePath}/${taskId}`)
  }

  const handleEdit = () => {
    setOpen(false)
    onEdit?.(taskId)
  }

  const handleDelete = () => {
    setOpen(false)
    onDelete?.(taskId)
  }

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        position: 'relative',
      }}
      ref={menuRef}
    >
      {/* 3 Dot Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={threeDotButtonStyle}
      >
        ⋮
      </button>

      {/* Dropdown */}
      {open && (
        <div style={dropdownStyle}>
          <DropdownItem label="View Details" onClick={handleView} />
          {canEdit && <DropdownItem label="Edit" onClick={handleEdit} />}
          {canDelete && (
            <DropdownItem
              label="Delete"
              danger
              onClick={handleDelete}
            />
          )}
        </div>
      )}
    </div>
  )
}

////////////////////////////////////////////////////////////
// Reusable Dropdown Item
////////////////////////////////////////////////////////////

interface ItemProps {
  label: string
  onClick: () => void
  danger?: boolean
}

const DropdownItem = ({ label, onClick, danger }: ItemProps) => {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 16px',
        cursor: 'pointer',
        fontSize: '14px',
        color: danger ? '#dc2626' : '#1a1a1a',
        transition: 'background 0.15s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f5f5f5'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      {label}
    </div>
  )
}

////////////////////////////////////////////////////////////
// STYLES
////////////////////////////////////////////////////////////

const threeDotButtonStyle: React.CSSProperties = {
  border: '1px solid #e5e5e5',
  background: '#fff',
  cursor: 'pointer',
  fontSize: '18px',
  padding: '6px 10px',
  borderRadius: '8px',
  color: '#666',
  transition: 'all 0.15s ease',
}

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  right: '60%',
  bottom: 35,
  background: '#fff',
  border: '1px solid #e5e5e5',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  minWidth: '160px',
  zIndex: 9999,
}

export default TaskActions