import type { Channel } from '../types/chat.types'

type ChannelListProps = {
  channels: Channel[]
  selectedChannel: string
  onChannelSelect: (channelId: string) => void
}

const ChannelList = ({ channels, selectedChannel, onChannelSelect }: ChannelListProps) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Group channels by project
  const groupedChannels = channels.reduce((acc, channel) => {
    if (!acc[channel.projectName]) {
      acc[channel.projectName] = []
    }
    acc[channel.projectName].push(channel)
    return acc
  }, {} as Record<string, Channel[]>)

  return (
    <div style={{
      width: '320px',
      background: '#ffffff',
      borderRight: '1px solid #e5e5e5',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,       // allows flex child to shrink
      overflow: 'hidden', // clip content, let inner div scroll
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e5e5e5',
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#1a1a1a',
          marginBottom: '4px',
        }}>
          Channels
        </h2>
        <p style={{
          fontSize: '13px',
          color: '#666666',
          margin: 0,
        }}>
          Project-based discussions
        </p>
      </div>

      {/* Channel List - scrollable */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 0',
        minHeight: 0,  // critical: allows this to scroll instead of push parent
      }}>
        {Object.entries(groupedChannels).map(([projectName, projectChannels]) => (
          <div key={projectName} style={{ marginBottom: '16px' }}>
            {/* Project Header */}
            <div style={{
              padding: '8px 20px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#999999',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {projectName}
            </div>

            {/* Channels */}
            {projectChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onChannelSelect(channel.id)}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: selectedChannel === channel.id ? '#f0f9ff' : 'transparent',
                  border: 'none',
                  borderLeft: selectedChannel === channel.id ? '3px solid #3b82f6' : '3px solid transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
                onMouseEnter={(e) => {
                  if (selectedChannel !== channel.id) {
                    e.currentTarget.style.background = '#fafafa'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedChannel !== channel.id) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {/* Channel Icon */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: selectedChannel === channel.id ? '#3b82f6' : '#e5e5e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0,
                }}>
                  #
                </div>

                {/* Channel Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1a1a1a',
                    }}>
                      {channel.name}
                    </span>
                    {channel.unreadCount > 0 && (
                      <span style={{
                        padding: '2px 8px',
                        background: '#3b82f6',
                        color: '#ffffff',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}>
                        {channel.unreadCount}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#666666',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: '4px',
                  }}>
                    {channel.lastMessage || 'No messages yet'}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '11px',
                    color: '#999999',
                  }}>
                    <span>{channel.memberCount} members</span>
                    {channel.lastMessageTime && (
                      <>
                        <span>•</span>
                        <span>{formatTime(channel.lastMessageTime)}</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChannelList
