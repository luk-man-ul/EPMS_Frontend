import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../../../utils/api'

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  //////////////////////////////////////////////////////////////
  // FETCH PROJECT
  //////////////////////////////////////////////////////////////

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${projectId}`)
        setProject(res.data)
      } catch (err) {
        console.error('Error fetching project:', err)
      } finally {
        setLoading(false)
      }
    }

    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      setUserRole(parsed?.role || null)
    }

    if (projectId) fetchProject()
  }, [projectId])

  //////////////////////////////////////////////////////////////
  // STATUS UPDATE
  //////////////////////////////////////////////////////////////

  const updateStatus = async (newStatus: string) => {
    if (!project || updating) return

    try {
      setUpdating(true)

      const res = await api.patch(
        `/projects/${project.id}/status`,
        { status: newStatus }
      )

      setProject(res.data)
    } catch (err: any) {
      console.error('Error updating status:', err?.response?.data || err)
      alert(err?.response?.data?.message || 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  //////////////////////////////////////////////////////////////
  // STATUS STYLE
  //////////////////////////////////////////////////////////////

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PLANNING':
        return { bg: '#fef3c7', color: '#d97706' }
      case 'ACTIVE':
        return { bg: '#d1fae5', color: '#16a34a' }
      case 'COMPLETED':
        return { bg: '#dbeafe', color: '#2563eb' }
      case 'ON_HOLD':
        return { bg: '#fee2e2', color: '#dc2626' }
      default:
        return { bg: '#f3f4f6', color: '#6b7280' }
    }
  }

  //////////////////////////////////////////////////////////////
  // LOADING STATES
  //////////////////////////////////////////////////////////////

  if (loading) return <div>Loading project...</div>
  if (!project) return <div>Project not found</div>

  const statusStyle = getStatusStyle(project.status)

  const canEdit =
    userRole === 'TEAM_LEAD' || userRole === 'EMPLOYEE'

  //////////////////////////////////////////////////////////////
  // RENDER
  //////////////////////////////////////////////////////////////

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: 20,
          background: 'none',
          border: 'none',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        ← Back
      </button>

      {/* HEADER CARD */}
      <div style={{
        background: '#ffffff',
        padding: 32,
        borderRadius: 20,
        border: '1px solid #e5e7eb',
        boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
        marginBottom: 24
      }}>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>

          <div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 700,
              marginBottom: 8
            }}>
              {project.name}
            </h1>

            <span style={{
              padding: '6px 14px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              background: statusStyle.bg,
              color: statusStyle.color
            }}>
              {project.status}
            </span>
          </div>

          {canEdit && (
            <select
              value={project.status}
              disabled={updating}
              onChange={(e) => updateStatus(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #d1d5db',
                cursor: 'pointer'
              }}
            >
              {userRole === 'TEAM_LEAD' && (
                <>
                  <option value="PLANNING">PLANNING</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ON_HOLD">ON_HOLD</option>
                  <option value="COMPLETED">COMPLETED</option>
                </>
              )}

              {userRole === 'EMPLOYEE' && (
                <>
                  {project.status === 'ACTIVE' && (
                    <>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="ON_HOLD">ON_HOLD</option>
                    </>
                  )}

                  {project.status === 'ON_HOLD' && (
                    <>
                      <option value="ON_HOLD">ON_HOLD</option>
                      <option value="ACTIVE">ACTIVE</option>
                    </>
                  )}

                  {(project.status === 'PLANNING' ||
                    project.status === 'COMPLETED') && (
                    <option value={project.status}>
                      {project.status}
                    </option>
                  )}
                </>
              )}
            </select>
          )}

        </div>
      </div>

      {/* KPI GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20,
        marginBottom: 24
      }}>

        <InfoCard
          title="Start Date"
          value={
            project.startDate
              ? new Date(project.startDate).toLocaleDateString()
              : 'N/A'
          }
        />

        <InfoCard
          title="End Date"
          value={
            project.endDate
              ? new Date(project.endDate).toLocaleDateString()
              : 'N/A'
          }
        />

        <InfoCard
          title="Budget"
          value={project.budget ? `$${project.budget}` : 'N/A'}
        />

        <InfoCard
          title="Team Size"
          value={project.teamSize ?? 'N/A'}
        />

      </div>

      {/* DESCRIPTION */}
      <div style={{
        background: '#ffffff',
        padding: 24,
        borderRadius: 16,
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ marginBottom: 12 }}>
          Project Description
        </h3>
        <p style={{ lineHeight: 1.6 }}>
          {project.description || 'No description available'}
        </p>
      </div>

    </div>
  )
}

//////////////////////////////////////////////////////////////
// REUSABLE CARD
//////////////////////////////////////////////////////////////

const InfoCard = ({ title, value }: any) => (
  <div style={{
    background: '#ffffff',
    padding: 20,
    borderRadius: 16,
    border: '1px solid #e5e7eb'
  }}>
    <h3>{title}</h3>
    <div>{value}</div>
  </div>
)

export default ProjectDetailPage