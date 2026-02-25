import { useEffect, useState } from 'react'
import Select from 'react-select'
import api from '../../../../utils/api'
import { getAuthHeaders } from '../../../../utils/auth'
import type { ProjectDetail } from '../types/project.types'

interface Props {
  projectId?: string | null
  initialData?: ProjectDetail | null
  onClose: () => void
  onSuccess: () => void
}

interface Role {
  role: {
    name: string
  }
}

interface User {
  id: string
  firstName: string
  lastName: string
  roles: Role[]
}

const ProjectForm = ({
  projectId,
  initialData,
  onClose,
  onSuccess,
}: Props) => {
  const isEditMode = !!projectId

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState<number | ''>('')

  const [leadId, setLeadId] = useState('')
  const [memberIds, setMemberIds] = useState<string[]>([])

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  ////////////////////////////////////////////////////////////
  // FETCH USERS
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data)
    } catch (err) {
      console.error('Failed to fetch users')
    }
  }

  ////////////////////////////////////////////////////////////
  // PREFILL WHEN EDITING
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!initialData) return

    setName(initialData.name || '')
    setDescription(initialData.description || '')
    setStartDate(
      initialData.startDate
        ? initialData.startDate.slice(0, 10)
        : ''
    )
    setEndDate(
      initialData.endDate
        ? initialData.endDate.slice(0, 10)
        : ''
    )
    setBudget(initialData.budget ?? '')

    setLeadId(initialData.lead?.id || '')

    const existingMembers =
      initialData.members?.map((m) => m.userId) || []

    setMemberIds(existingMembers)
  }, [initialData])

  ////////////////////////////////////////////////////////////
  // FILTER TEAM LEADS
  ////////////////////////////////////////////////////////////

  const teamLeads = users.filter((user) =>
    user.roles?.some((r) => r.role.name === 'TEAM_LEAD')
  )

  ////////////////////////////////////////////////////////////
  // OPTIONS
  ////////////////////////////////////////////////////////////

  const leadOptions = teamLeads.map((user) => ({
    value: user.id,
    label: `${user.firstName} ${user.lastName}`,
  }))

  const memberOptions = users.map((user) => ({
    value: user.id,
    label: `${user.firstName} ${user.lastName}`,
  }))

  ////////////////////////////////////////////////////////////
  // HANDLE SUBMIT
  ////////////////////////////////////////////////////////////

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !leadId || memberIds.length === 0) {
      setError('Please fill all required fields')
      return
    }

    try {
      setLoading(true)

      const payload = {
        name,
        description,
        startDate,
        endDate,
        budget: budget || undefined,
        leadId,
        memberIds,
      }

      if (isEditMode && projectId) {
        await api.patch(`/projects/${projectId}`, payload, {
          headers: getAuthHeaders(),
        })
      } else {
        await api.post('/projects', payload, {
          headers: getAuthHeaders(),
        })
      }

      onSuccess()
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (isEditMode
            ? 'Failed to update project'
            : 'Failed to create project')
      )
    } finally {
      setLoading(false)
    }
  }

  ////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////

  return (
    <div
      style={{
        width: 650,
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
      }}
    >
      <h2
        style={{
          fontSize: 22,
          fontWeight: 600,
          marginBottom: 24,
        }}
      >
        {isEditMode ? 'Edit Project' : 'Create Project'}
      </h2>

      {error && (
        <div
          style={{
            background: '#fff5f5',
            color: '#dc2626',
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <input
          placeholder="Project Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...inputStyle, height: 90 }}
        />

        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={inputStyle}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <input
          type="number"
          placeholder="Budget"
          value={budget}
          onChange={(e) =>
            setBudget(e.target.value ? Number(e.target.value) : '')
          }
          style={inputStyle}
        />

        {/* TEAM LEAD SELECT */}
        <div>
          <label style={labelStyle}>Select Team Lead *</label>
          <Select
            options={leadOptions}
            value={leadOptions.find((o) => o.value === leadId)}
            onChange={(selected) =>
              setLeadId(selected?.value || '')
            }
            placeholder="Search team lead..."
          />
        </div>

        {/* MEMBER MULTI SELECT */}
        <div>
          <label style={labelStyle}>Select Project Members *</label>
          <Select
            isMulti
            options={memberOptions}
            value={memberOptions.filter((o) =>
              memberIds.includes(o.value)
            )}
            onChange={(selected) =>
              setMemberIds(selected.map((s) => s.value))
            }
            placeholder="Search employees..."
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            marginTop: 8,
          }}
        >
          <button type="button" onClick={onClose} style={cancelBtn}>
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...createBtn,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? isEditMode
                ? 'Updating...'
                : 'Creating...'
              : isEditMode
              ? 'Update Project'
              : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  )
}

////////////////////////////////////////////////////////////
// STYLES
////////////////////////////////////////////////////////////

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #e5e5e5',
  fontSize: 14,
  width: '100%',
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  marginBottom: 6,
  display: 'block',
}

const cancelBtn: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 8,
  border: '1px solid #ddd',
  background: '#f5f5f5',
  cursor: 'pointer',
}

const createBtn: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 8,
  border: 'none',
  background: '#111',
  color: '#fff',
  cursor: 'pointer',
}

export default ProjectForm