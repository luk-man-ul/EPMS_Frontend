import { useState,useEffect } from 'react'
import { getAuthHeaders } from '../../../../utils/auth'

interface Props {
  onClose: () => void
  onSuccess: () => void
  employee?: any
  skills: any[]
  refreshSkills: () => Promise<void>   // 👈 ADD THIS
}


const API_URL = 'http://localhost:3000'

const EmployeeForm = ({
  onClose,
  onSuccess,
  employee,
  skills,
  refreshSkills, 
}: Props) => {
  /* -------------------- FORM STATE -------------------- */

  const [formData, setFormData] = useState({
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    email: employee?.email || '',
    password: '',
    phone: employee?.phone || '',
    department: employee?.department || '',
    profilePhoto: employee?.profilePhoto || '',
  })

  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    employee?.skills?.map((s: any) => s.skill.id) || []
  )

  const [showAddSkill, setShowAddSkill] = useState(false)
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {

}, [skills])


  /* -------------------- HANDLERS -------------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSkillToggle = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter((id) => id !== skillId))
    } else {
      setSelectedSkills([...selectedSkills, skillId])
    }
  }

  const handleAddSkill = async () => {
  if (!newSkill.trim()) return

  try {
    const res = await fetch(`${API_URL}/skills`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newSkill.trim() }),
    })

    if (!res.ok) throw new Error('Failed to create skill')

    // 🔥 Refresh skills from parent
    await refreshSkills()

    setNewSkill('')
    setShowAddSkill(false)

  } catch (err: any) {
    alert(err.message)
  }
}


  const handleSubmit = async () => {
    try {
      const url = employee
        ? `${API_URL}/users/${employee.id}`
        : `${API_URL}/users`

      const method = employee ? 'PATCH' : 'POST'

      const body = employee
        ? {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            department: formData.department,
            profilePhoto: formData.profilePhoto,
            skillIds: selectedSkills,
          }
        : {
            ...formData,
            skillIds: selectedSkills,
          }

      const res = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Operation failed')

      onSuccess()
    } catch (err: any) {
      alert(err.message)
    }
  }

  /* -------------------- UI -------------------- */

  return (
    <div
      style={{
        background: '#fff',
        padding: 32,
        width: 600,
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: 16,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      }}
    >
      <h2 style={{ marginBottom: 24 }}>
        {employee ? 'Edit Employee' : 'Create Employee'}
      </h2>

      {/* Grid Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
        <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
        <Input label="Email" name="email" value={formData.email} onChange={handleChange} disabled={!!employee} />

        {!employee && (
          <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
        )}

        <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
        <Input label="Department" name="department" value={formData.department} onChange={handleChange} />
      </div>

      {/* Profile Photo */}
      <div style={{ marginTop: 20 }}>
        <Input
          label="Profile Photo URL"
          name="profilePhoto"
          value={formData.profilePhoto}
          onChange={handleChange}
        />
      </div>

      {/* Skills Section */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <h4 style={{ margin: 0 }}>Skill Set</h4>

          {!showAddSkill && (
            <button
              onClick={() => setShowAddSkill(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              + Add Skill
            </button>
          )}
        </div>

        {showAddSkill && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              placeholder="New skill name"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid #ddd',
              }}
            />

            <button
              onClick={handleAddSkill}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: 'none',
                background: '#1a1a1a',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Save
            </button>

            <button
              onClick={() => {
                setShowAddSkill(false)
                setNewSkill('')
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #ddd',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 8,
          }}
        >
          {skills.map((skill) => (
            <label
              key={skill.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 8px',
                borderRadius: 8,
                border: '1px solid #e5e5e5',
                cursor: 'pointer',
                backgroundColor: selectedSkills.includes(skill.id)
                  ? '#e0f2fe'
                  : '#fff',
              }}
            >
              <input
                type="checkbox"
                checked={selectedSkills.includes(skill.id)}
                onChange={() => handleSkillToggle(skill.id)}
              />
              <span style={{ fontSize: 13 }}>{skill.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          marginTop: 32,
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            border: 'none',
            background: '#1a1a1a',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          {employee ? 'Save Changes' : 'Create Employee'}
        </button>
      </div>
    </div>
  )
}

/* -------------------- REUSABLE INPUT -------------------- */

const Input = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  disabled = false,
}: any) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <label style={{ fontSize: 13, marginBottom: 4, fontWeight: 500 }}>
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{
        padding: '8px 10px',
        borderRadius: 8,
        border: '1px solid #ddd',
        fontSize: 14,
      }}
    />
  </div>
)

export default EmployeeForm
