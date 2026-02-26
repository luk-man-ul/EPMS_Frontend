interface Props {
  members: any[]
}

const TeamMembersTab = ({ members }: Props) => {
  if (!members || members.length === 0)
    return <div>No team members assigned</div>

  return (
    <div>
      {members.map((m) => (
        <div key={m.userId}>
          {m.user.firstName} {m.user.lastName} — {m.user.email}
        </div>
      ))}
    </div>
  )
}

export default TeamMembersTab