interface Props {
  project: any
}

const TeamMembersPanel = ({ project }: Props) => {
  const members = project.members || []

  return (
    <div>
      <h3 style={{ marginBottom: '20px' }}>Team Members ({members.length})</h3>

      {members.length === 0 && (
        <div style={{ padding: '40px', background: '#fafafa', borderRadius: '12px' }}>
          No members assigned.
        </div>
      )}

      {members.map((m: any) => (
        <div key={m.userId} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
          {m.user?.firstName} {m.user?.lastName} — {m.user?.email}
        </div>
      ))}
    </div>
  )
}

export default TeamMembersPanel