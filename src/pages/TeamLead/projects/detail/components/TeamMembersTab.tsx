import { useEffect, useState } from 'react'
import api from '../../../../../utils/api'

interface Props {
  projectId: string
}

const TeamMembersTab = ({ projectId }: Props) => {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get(`/projects/${projectId}/members`)
        setMembers(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [projectId])

  if (loading) return <div>Loading team...</div>

  return (
    <div>
      {members.map((member) => (
        <div key={member.id}>
          {member.firstName} {member.lastName}
        </div>
      ))}
    </div>
  )
}

export default TeamMembersTab