import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

interface Props {
  ticketId: string
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

const TicketActions = ({ ticketId, onEdit, onDelete }: Props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  ////////////////////////////////////////////////////////////
  // CLOSE ON OUTSIDE CLICK
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  ////////////////////////////////////////////////////////////
  // DETECT WORKSPACE (ADMIN / APP)
  ////////////////////////////////////////////////////////////

  const isAdmin = location.pathname.startsWith('/admin')
  const basePath = isAdmin ? '/admin/tickets' : '/app/tickets'

  ////////////////////////////////////////////////////////////
  // HANDLERS
  ////////////////////////////////////////////////////////////

  const handleView = () => {
    setOpen(false)
    navigate(`${basePath}/${ticketId}`)
  }

  const handleEdit = () => {
    setOpen(false)
    onEdit?.(ticketId)
  }

  const handleDelete = () => {
    setOpen(false)
    onDelete?.(ticketId)
  }

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'relative',
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end',
      }}
    >
      {/* View Button */}
      <button
        type="button"
        onClick={handleView}
        style={viewButtonStyle}
      >
        View
      </button>

      {/* Three Dot Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={threeDotButtonStyle}
        aria-expanded={open}
      >
        ⋮
      </button>

      {/* Dropdown */}
      {open && (
        <div style={dropdownStyle}>
          <DropdownItem label="View Details" onClick={handleView} />
          <DropdownItem label="Edit" onClick={handleEdit} />
          <DropdownItem label="Delete" danger onClick={handleDelete} />
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
        padding: '10px 14px',
        cursor: 'pointer',
        fontSize: '14px',
        color: danger ? '#dc2626' : '#1a1a1a',
        transition: 'background 0.15s ease',
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

const viewButtonStyle: React.CSSProperties = {
  border: '1px solid #e5e5e5',
  background: '#fff',
  cursor: 'pointer',
  fontSize: '13px',
  padding: '6px 12px',
  borderRadius: '8px',
  color: '#1a1a1a',
  fontWeight: 500,
}

const threeDotButtonStyle: React.CSSProperties = {
  border: '1px solid #e5e5e5',
  background: '#fff',
  cursor: 'pointer',
  fontSize: '18px',
  padding: '6px 10px',
  borderRadius: '8px',
  color: '#666',
}

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  right: 0,
  top: '42px',
  background: '#fff',
  border: '1px solid #e5e5e5',
  borderRadius: '8px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
  minWidth: '150px',
  zIndex: 9999,
}

export default TicketActions
