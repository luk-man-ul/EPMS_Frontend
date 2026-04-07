import { useState, useEffect, useRef } from 'react'
import api from '../../../../utils/api'

interface Props {
  onClose: () => void
  onSuccess: () => void
  employee?: any
  skills: any[]
  refreshSkills: () => Promise<void>
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

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
    workMode: (employee?.workMode || 'ON_SITE') as 'ON_SITE' | 'WFH',
  })

  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    employee?.skills?.map((s: any) => s.skill.id) || []
  )

  const [showAddSkill, setShowAddSkill] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ── Confirm password (create mode only) ──
  const [confirmPassword, setConfirmPassword] = useState('')
  const passwordsMatch = formData.password.length > 0 && confirmPassword.length > 0 && formData.password === confirmPassword
  const createModeInvalid = !employee && (!formData.password || !confirmPassword || formData.password !== confirmPassword)

  /* -------------------- PHOTO STATE -------------------- */

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>(employee?.profilePhoto || '')
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {}, [skills])

  /* -------------------- HANDLERS -------------------- */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('')
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setPhotoError('Only JPEG, PNG, and WebP images are allowed')
      e.target.value = ''
      return
    }

    if (file.size > MAX_SIZE_BYTES) {
      setPhotoError('Image must be smaller than 5MB')
      e.target.value = ''
      return
    }

    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleRemovePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(employee?.profilePhoto || '')
    setPhotoError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
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
      await api.post('/skills', { name: newSkill.trim() })
      await refreshSkills()
      setNewSkill('')
      setShowAddSkill(false)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create skill')
    }
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.firstName.trim()) e.firstName = 'First name is required'
    if (!formData.lastName.trim()) e.lastName = 'Last name is required'
    if (!formData.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Enter a valid email'
    if (!employee) {
      if (!formData.password.trim()) e.password = 'Password is required'
      else if (formData.password.length < 6) e.password = 'Password must be at least 6 characters'
      if (!confirmPassword.trim()) e.confirmPassword = 'Confirm password is required'
      else if (formData.password !== confirmPassword) e.confirmPassword = 'Passwords do not match'
    }
    if (formData.phone && !/^\+?[\d\s\-()]{7,15}$/.test(formData.phone)) e.phone = 'Enter a valid phone number'
    return e
  }

  const handleSubmit = async () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    try {
      let profilePhotoUrl = formData.profilePhoto

      // Step 1: Upload photo if a new file was selected
      if (photoFile) {
        setPhotoUploading(true)
        const photoFormData = new FormData()
        photoFormData.append('photo', photoFile)

        const uploadRes = await api.post('/users/upload-photo', photoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        profilePhotoUrl = uploadRes.data.url
        setPhotoUploading(false)
      }

      // Step 2: Create or update user with the resolved photo URL
      const body = employee
        ? {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            department: formData.department,
            profilePhoto: profilePhotoUrl,
            workMode: formData.workMode,
            skillIds: selectedSkills,
          }
        : { ...formData, profilePhoto: profilePhotoUrl, skillIds: selectedSkills }

      if (employee) {
        await api.patch(`/users/${employee.id}`, body)
      } else {
        await api.post('/users', body)
      }

      onSuccess()
    } catch (err: any) {
      setPhotoUploading(false)
      alert(err.response?.data?.message || 'Operation failed')
    }
  }

  /* -------------------- AVATAR PREVIEW -------------------- */

  const initials =
    `${formData.firstName?.[0] ?? ''}${formData.lastName?.[0] ?? ''}`.toUpperCase() || '?'

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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} error={errors.firstName} />
        <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} error={errors.lastName} />
        <Input label="Email" name="email" value={formData.email} onChange={handleChange} disabled={!!employee} error={errors.email} />

        {!employee && (
          <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} />
        )}

        {/* Confirm Password — create mode only, never sent to backend */}
        {!employee && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: 13, marginBottom: 4, fontWeight: 500 }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                border: `1px solid ${confirmPassword && !passwordsMatch ? '#dc2626' : confirmPassword && passwordsMatch ? '#16a34a' : '#ddd'}`,
                fontSize: 14,
                outline: 'none',
              }}
            />
            {confirmPassword && (
              <span style={{ fontSize: 11, marginTop: 4, color: passwordsMatch ? '#16a34a' : '#dc2626' }}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </span>
            )}
            {!confirmPassword && errors.confirmPassword && (
              <span style={{ fontSize: 11, marginTop: 4, color: '#dc2626' }}>{errors.confirmPassword}</span>
            )}
          </div>
        )}

        <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} />
        <Input label="Department" name="department" value={formData.department} onChange={handleChange} />
      </div>

      {/* Work Mode */}
      <div style={{ marginTop: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>
          Work Mode
        </label>
        <select
          value={formData.workMode}
          onChange={(e) => setFormData({ ...formData, workMode: e.target.value as 'ON_SITE' | 'WFH' })}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: 8,
            border: '1px solid #ddd',
            fontSize: 14,
            background: '#fff',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="ON_SITE">On Site</option>
          <option value="WFH">Work From Home</option>
        </select>
      </div>

      {/* Profile Photo Upload */}
      <div style={{ marginTop: 24 }}>
        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 10 }}>
          Profile Photo
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Avatar preview */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              border: '2px solid #e5e5e5',
              overflow: 'hidden',
              flexShrink: 0,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>
                {initials}
              </span>
            )}
          </div>

          {/* Controls */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label
                htmlFor="photo-upload"
                style={{
                  display: 'inline-block',
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  background: '#fff',
                  cursor: photoUploading ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#374151',
                  opacity: photoUploading ? 0.6 : 1,
                }}
              >
                {photoUploading ? 'Uploading...' : 'Choose Photo'}
              </label>

              {photoFile && !photoUploading && (
                <button
                  onClick={handleRemovePhoto}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 8,
                    border: '1px solid #fecaca',
                    background: '#fff5f5',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  Remove
                </button>
              )}
            </div>

            <input
              id="photo-upload"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handlePhotoChange}
              disabled={photoUploading}
              style={{ display: 'none' }}
            />

            {photoFile && !photoError && (
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 5 }}>
                {photoFile.name} ({(photoFile.size / 1024).toFixed(0)} KB)
              </p>
            )}

            {photoError && (
              <p style={{ fontSize: 12, color: '#dc2626', marginTop: 5 }}>
                {photoError}
              </p>
            )}

            {!photoFile && !photoError && (
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 5 }}>
                JPEG, PNG or WebP · Max 5MB
              </p>
            )}
          </div>
        </div>
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
              style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd' }}
            />
            <button
              onClick={handleAddSkill}
              style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#1a1a1a', color: '#fff', cursor: 'pointer' }}
            >
              Save
            </button>
            <button
              onClick={() => { setShowAddSkill(false); setNewSkill('') }}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
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
                backgroundColor: selectedSkills.includes(skill.id) ? '#e0f2fe' : '#fff',
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
        <button
          onClick={onClose}
          disabled={photoUploading}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: '#fff',
            cursor: photoUploading ? 'not-allowed' : 'pointer',
            opacity: photoUploading ? 0.6 : 1,
          }}
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={photoUploading || createModeInvalid}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            border: 'none',
            background: '#1a1a1a',
            color: '#fff',
            cursor: (photoUploading || createModeInvalid) ? 'not-allowed' : 'pointer',
            opacity: (photoUploading || createModeInvalid) ? 0.5 : 1,
          }}
        >
          {photoUploading ? 'Uploading...' : employee ? 'Save Changes' : 'Create Employee'}
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
  error,
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
        border: `1px solid ${error ? '#dc2626' : '#ddd'}`,
        fontSize: 14,
        outline: 'none',
        background: disabled ? '#f9fafb' : '#fff',
      }}
    />
    {error && (
      <span style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{error}</span>
    )}
  </div>
)

export default EmployeeForm
