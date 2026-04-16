import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { NotificationBell } from '../notifications'
import api from '../../utils/api'

interface SearchResult {
  id: string
  type: 'project' | 'task' | 'ticket' | 'employee'
  title: string
  subtitle?: string
  badge?: string
  badgeColor?: string
  path: string
}

const typeConfig = {
  project: { icon: '📁', label: 'Projects', color: '#2563eb' },
  task:    { icon: '✅', label: 'Tasks',    color: '#16a34a' },
  ticket:  { icon: '🎫', label: 'Tickets',  color: '#d97706' },
  employee:{ icon: '👤', label: 'People',   color: '#7c3aed' },
}

const AppHeader = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const navigate = useNavigate()
  const { user, logout: authLogout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  // Search state
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleLogout = () => {
    authLogout()
    navigate('/auth/login')
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) {
      setResults([])
      setShowResults(false)
      return
    }
    try {
      setSearching(true)
      const lower = q.toLowerCase()

      const [projectsRes, tasksRes, ticketsRes, usersRes] = await Promise.allSettled([
        api.get('/projects'),
        api.get('/tasks'),
        api.get('/tickets'),
        api.get('/users'),
      ])

      const combined: SearchResult[] = []

      // Projects
      if (projectsRes.status === 'fulfilled') {
        const data = projectsRes.value.data?.data || projectsRes.value.data || []
        data
          .filter((p: any) =>
            p.name?.toLowerCase().includes(lower) ||
            p.description?.toLowerCase().includes(lower)
          )
          .slice(0, 4)
          .forEach((p: any) => {
            combined.push({
              id: p.id,
              type: 'project',
              title: p.name,
              subtitle: p.description || 'No description',
              badge: p.status,
              badgeColor: p.status === 'ACTIVE' ? '#16a34a' : '#6b7280',
              path: `/app/projects/${p.id}`,
            })
          })
      }

      // Tasks
      if (tasksRes.status === 'fulfilled') {
        const data = tasksRes.value.data?.data || tasksRes.value.data || []
        data
          .filter((t: any) =>
            t.title?.toLowerCase().includes(lower) ||
            t.description?.toLowerCase().includes(lower)
          )
          .slice(0, 4)
          .forEach((t: any) => {
            combined.push({
              id: t.id,
              type: 'task',
              title: t.title,
              subtitle: t.project?.name || 'No project',
              badge: t.status?.replace(/_/g, ' '),
              badgeColor: t.status === 'COMPLETED' ? '#16a34a' : t.status === 'IN_PROGRESS' ? '#2563eb' : '#6b7280',
              path: `/app/tasks/${t.id}`,
            })
          })
      }

      // Tickets
      if (ticketsRes.status === 'fulfilled') {
        const data = ticketsRes.value.data?.data || ticketsRes.value.data || []
        data
          .filter((t: any) =>
            t.title?.toLowerCase().includes(lower) ||
            t.description?.toLowerCase().includes(lower)
          )
          .slice(0, 4)
          .forEach((t: any) => {
            combined.push({
              id: t.id,
              type: 'ticket',
              title: t.title,
              subtitle: t.project?.name || 'No project',
              badge: t.priority,
              badgeColor: t.priority === 'URGENT' ? '#dc2626' : t.priority === 'HIGH' ? '#d97706' : '#6b7280',
              path: `/app/tickets/${t.id}`,
            })
          })
      }

      // Employees
      if (usersRes.status === 'fulfilled') {
        const data = usersRes.value.data?.data || usersRes.value.data || []
        data
          .filter((u: any) =>
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(lower) ||
            u.email?.toLowerCase().includes(lower)
          )
          .slice(0, 3)
          .forEach((u: any) => {
            combined.push({
              id: u.id,
              type: 'employee',
              title: `${u.firstName} ${u.lastName}`,
              subtitle: u.email,
              badge: u.role?.replace(/_/g, ' '),
              badgeColor: '#7c3aed',
              path: `/app/tasks?assignee=${u.id}`,
            })
          })
      }

      setResults(combined)
      setShowResults(true)
      setActiveIndex(-1)
    } catch {
      // silently fail
    } finally {
      setSearching(false)
    }
  }, [])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!val.trim()) { setResults([]); setShowResults(false); return }
    debounceRef.current = setTimeout(() => runSearch(val), 350)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && activeIndex >= 0) { handleSelect(results[activeIndex]) }
    else if (e.key === 'Escape') { setShowResults(false); inputRef.current?.blur() }
  }

  const handleSelect = (result: SearchResult) => {
    setQuery('')
    setResults([])
    setShowResults(false)
    navigate(result.path)
  }

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {})

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: 520 }}>
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="mobile-menu-btn"
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px',
            color: '#1a1a1a',
            flexShrink: 0,
          }}
        >
          ☰
        </button>

        {/* Global Search */}
        <div ref={searchRef} style={{ position: 'relative', flex: 1 }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none', color: '#aaa' }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search projects, tasks, tickets, people..."
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (results.length > 0) setShowResults(true) }}
            className="header-search"
            style={{ paddingLeft: 36, paddingRight: query ? 36 : 16 }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setShowResults(false) }}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#aaa', padding: 4 }}
            >✕</button>
          )}
        </div>

        {/* Results Dropdown */}
        {showResults && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: 14,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            zIndex: 9999,
            overflow: 'hidden',
            maxHeight: 480,
            overflowY: 'auto',
          }}>
            {searching && (
              <div style={{ padding: '16px 20px', fontSize: 13, color: '#999', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 14, height: 14, border: '2px solid #e5e5e5', borderTopColor: '#1a1a1a', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                Searching...
              </div>
            )}

            {!searching && results.length === 0 && (
              <div style={{ padding: '24px 20px', textAlign: 'center', fontSize: 13, color: '#bbb' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                No results found
              </div>
            )}

            {!searching && Object.entries(grouped).map(([type, items]) => {
              const cfg = typeConfig[type as keyof typeof typeConfig]
              return (
                <div key={type}>
                  {/* Section header */}
                  <div style={{ padding: '10px 16px 6px', fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                    {cfg.icon} {cfg.label}
                  </div>
                  {items.map((result) => {
                    const globalIdx = results.indexOf(result)
                    const isActive = globalIdx === activeIndex
                    return (
                      <div
                        key={result.id}
                        onMouseDown={() => handleSelect(result)}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        style={{
                          padding: '10px 16px',
                          cursor: 'pointer',
                          background: isActive ? '#f5f5f5' : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          transition: 'background 0.1s',
                          borderBottom: '1px solid #fafafa',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {result.title}
                          </div>
                          {result.subtitle && (
                            <div style={{ fontSize: 11, color: '#999', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {result.subtitle}
                            </div>
                          )}
                        </div>
                        {result.badge && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${result.badgeColor}18`, color: result.badgeColor, whiteSpace: 'nowrap', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {result.badge}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}
      </div>
      </div>

      <div className="header-actions">
        <NotificationBell />
        <div style={{ position: 'relative' }}>
          <div
            className="profile"
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ cursor: 'pointer' }}
          >
            {user?.email || 'Team Lead'}
          </div>

          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: '#ffffff',
              border: '1px solid #e5e5e5',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              minWidth: '180px',
              zIndex: 1000,
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e5e5e5',
                fontSize: '13px',
              }}>
                <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{user?.email}</div>
                <div style={{ color: '#666666', fontSize: '12px', marginTop: '2px' }}>{user?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: '13px',
                  color: '#c53030',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </header>
  )
}

export default AppHeader
