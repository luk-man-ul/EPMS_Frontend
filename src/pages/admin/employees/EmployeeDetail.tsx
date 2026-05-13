import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Employee } from './types/employee.types'
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  Briefcase,
  User,
} from 'lucide-react'
import api from '../../../utils/api'

const EmployeeDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) fetchEmployee(id)
  }, [id])

  const fetchEmployee = async (employeeId: string) => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/users')
      const data: Employee[] = res.data
      const found = data.find((u) => u.id === employeeId)
      if (!found) throw new Error('Employee not found')
      setEmployee(found)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
        <p style={{ color: '#666', marginTop: 16 }}>Loading employee details...</p>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div style={styles.centered}>
        <div style={styles.errorBox}>{error || 'Employee not found'}</div>
        <button style={styles.backBtn} onClick={() => navigate('/admin/employees')}>
          <ArrowLeft size={16} /> Back to Employees
        </button>
      </div>
    )
  }

  const primaryRole = getPrimaryRole(employee)
  const fullName = `${employee.firstName} ${employee.lastName}`
  const initials = `${employee.firstName?.[0] ?? ''}${employee.lastName?.[0] ?? ''}`.toUpperCase()

  return (
    <div style={styles.page}>
      {/* Back button */}
      <button style={styles.backBtn} onClick={() => navigate('/admin/employees')}>
        <ArrowLeft size={16} /> Back to Employees
      </button>

      {/* Hero card */}
      <div style={styles.heroCard}>
        <div style={styles.heroGradient} />
        <div style={styles.heroContent}>
          <div style={styles.avatar}>
            {employee.profilePhoto ? (
              <img
                src={employee.profilePhoto}
                alt={fullName}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                onError={(e) => {
                  // If image fails to load, hide it and show initials
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.parentElement!.textContent = initials
                }}
              />
            ) : (
              initials
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h1 style={styles.heroName}>{fullName}</h1>
              <StatusBadge status={employee.status} />
            </div>
            {employee.designation && (
              <p style={styles.heroDesignation}>{employee.designation}</p>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <RoleBadge role={primaryRole} />
              {employee.department && (
                <span style={styles.deptChip}>
                  <Building2 size={12} /> {employee.department}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two-column grid */}
      <div style={styles.grid}>
        {/* Contact Information */}
        <InfoCard title="Contact Information" icon={<User size={16} />}>
          <InfoRow icon={<Mail size={14} />} label="Email" value={employee.email} />
          <InfoRow icon={<Phone size={14} />} label="Phone" value={employee.phone || '—'} />
          <InfoRow icon={<Building2 size={14} />} label="Department" value={employee.department || '—'} />
          <InfoRow icon={<Briefcase size={14} />} label="Designation" value={employee.designation || '—'} />
        </InfoCard>

        {/* Employment Information */}
        <InfoCard title="Employment Information" icon={<Briefcase size={16} />}>
          <InfoRow
            icon={<Calendar size={14} />}
            label="Joined Date"
            value={
              employee.joinedAt
                ? new Date(employee.joinedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '—'
            }
          />
          <InfoRow
            icon={<Clock size={14} />}
            label="Last Login"
            value={
              employee.lastLoginAt
                ? new Date(employee.lastLoginAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '—'
            }
          />
          <InfoRow icon={<ShieldCheck size={14} />} label="Status" value={employee.status} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ color: '#9ca3af', marginTop: 2, flexShrink: 0 }}><Briefcase size={14} /></span>
            <div>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 2 }}>Work Mode</div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 10px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                background: employee.workMode === 'WFH' ? '#dbeafe' : '#dcfce7',
                color: employee.workMode === 'WFH' ? '#1e40af' : '#15803d',
              }}>
                {employee.workMode === 'WFH' ? '🏠 Work From Home' : '🏢 On-Site'}
              </span>
            </div>
          </div>
        </InfoCard>
      </div>

      {/* Roles */}
      <SectionCard title="Assigned Roles" icon={<ShieldCheck size={16} />}>
        {employee.roles && employee.roles.length > 0 ? (
          <div style={styles.chipRow}>
            {employee.roles.map((r, i) => (
              <RoleBadge key={i} role={r.role.name} large />
            ))}
          </div>
        ) : (
          <EmptyState text="No roles assigned" />
        )}
      </SectionCard>

      {/* Skills */}
      <SectionCard title="Skills" icon={<Briefcase size={16} />}>
        {employee.skills && employee.skills.length > 0 ? (
          <div style={styles.chipRow}>
            {employee.skills.map((s) => (
              <span key={s.skill.id} style={styles.skillChip}>
                {s.skill.name}
              </span>
            ))}
          </div>
        ) : (
          <EmptyState text="No skills assigned" />
        )}
      </SectionCard>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; color: string; dot: string }> = {
    ACTIVE:    { bg: '#dcfce7', color: '#15803d', dot: '#16a34a' },
    INACTIVE:  { bg: '#fee2e2', color: '#b91c1c', dot: '#dc2626' },
    SUSPENDED: { bg: '#fef9c3', color: '#92400e', dot: '#f59e0b' },
  }
  const s = map[status] ?? { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {status}
    </span>
  )
}

const RoleBadge = ({ role, large }: { role: string; large?: boolean }) => {
  const map: Record<string, { bg: string; color: string }> = {
    ADMIN:     { bg: '#fee2e2', color: '#991b1b' },
    TEAM_LEAD: { bg: '#dbeafe', color: '#1e3a8a' },
    EMPLOYEE:  { bg: '#f3f4f6', color: '#374151' },
  }
  const s = map[role] ?? { bg: '#f3f4f6', color: '#374151' }
  return (
    <span style={{ padding: large ? '6px 14px' : '3px 10px', borderRadius: 8, fontSize: large ? 13 : 11, fontWeight: 600, background: s.bg, color: s.color }}>
      {role.replace('_', ' ')}
    </span>
  )
}

const InfoCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div style={styles.card}>
    <div style={styles.cardHeader}>
      <span style={styles.cardIcon}>{icon}</span>
      <h3 style={styles.cardTitle}>{title}</h3>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
  </div>
)

const SectionCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div style={{ ...styles.card, marginTop: 0 }}>
    <div style={styles.cardHeader}>
      <span style={styles.cardIcon}>{icon}</span>
      <h3 style={styles.cardTitle}>{title}</h3>
    </div>
    {children}
  </div>
)

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
    <span style={{ color: '#9ca3af', marginTop: 2, flexShrink: 0 }}>{icon}</span>
    <div>
      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#1a1a1a', fontWeight: 500 }}>{value}</div>
    </div>
  </div>
)

const EmptyState = ({ text }: { text: string }) => (
  <p style={{ color: '#9ca3af', fontSize: 14 }}>{text}</p>
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPrimaryRole(emp: Employee): string {
  const names = emp.roles.map((r) => r.role.name)
  if (names.includes('ADMIN')) return 'ADMIN'
  if (names.includes('TEAM_LEAD')) return 'TEAM_LEAD'
  return 'EMPLOYEE'
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  page: {
    padding: '0',
    maxWidth: '100%',
    margin: '0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 20,
  },
  centered: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    gap: 16,
  },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid #e5e5e5',
    borderTop: '3px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorBox: {
    padding: '12px 20px',
    background: '#fff5f5',
    color: '#dc2626',
    borderRadius: 10,
    fontSize: 14,
    border: '1px solid #fecaca',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 10,
    border: '1px solid #e5e5e5',
    background: '#fff',
    color: '#374151',
    fontWeight: 500,
    fontSize: 14,
    cursor: 'pointer',
    width: 'fit-content',
  },
  heroCard: {
    borderRadius: 16,
    border: '1px solid #e5e5e5',
    overflow: 'hidden',
    position: 'relative' as const,
    background: '#fff',
  },
  heroGradient: {
    height: 80,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  heroContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 20,
    padding: '0 28px 24px 28px',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    fontWeight: 700,
    color: '#fff',
    border: '4px solid #fff',
    marginTop: -40,
    flexShrink: 0,
    boxShadow: '0 4px 16px rgba(102,126,234,0.3)',
  },
  heroName: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1a1a1a',
    margin: 0,
    marginTop: 12,
  },
  heroDesignation: {
    fontSize: 14,
    color: '#6b7280',
    margin: '4px 0 0',
  },
  deptChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 500,
    background: '#f3f4f6',
    color: '#374151',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 20,
  },
  card: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #e5e5e5',
    padding: '20px 24px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingBottom: 14,
    borderBottom: '1px solid #f3f4f6',
  },
  cardIcon: {
    color: '#667eea',
    display: 'flex',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1a1a1a',
    margin: 0,
  },
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  skillChip: {
    background: '#e0f2fe',
    color: '#0369a1',
    padding: '6px 14px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
  },
}

export default EmployeeDetail
