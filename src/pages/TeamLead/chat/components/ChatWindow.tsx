import { useState, useRef, useEffect } from 'react'
import type { Message, Channel } from '../types/chat.types'

type ChatWindowProps = {
  channel: Channel | undefined
  messages: Message[]
  onSendMessage: (content: string, file?: File) => void
}

const ChatWindow = ({ channel, messages, onSendMessage }: ChatWindowProps) => {
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  // Ref on the scrollable messages container itself (not a sentinel element)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom ONLY when the active channel changes (room switch)
  // Does NOT fire when new messages arrive, so users can freely scroll up
  useEffect(() => {
    const el = messagesContainerRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [channel?.id])

  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput)
      setMessageInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️'
      case 'document': return '📄'
      case 'video': return '🎥'
      default: return '📎'
    }
  }

  if (!channel) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafafa',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>
            Select a channel
          </div>
          <div style={{ fontSize: '14px', color: '#666666' }}>
            Choose a channel from the left to start chatting
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
      minHeight: 0,   // critical: allows flex child to shrink below content size
      overflow: 'hidden',
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #e5e5e5',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: '4px',
          }}>
            # {channel.name}
          </h2>
          <p style={{
            fontSize: '13px',
            color: '#666666',
            margin: 0,
          }}>
            {channel.projectName} • {channel.memberCount} members
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '300px' }}>
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '16px',
          }}>
            🔍
          </span>
        </div>
      </div>

      {/* Messages - independent scroll area, ref used for room-switch scroll-to-bottom */}
      <div
        ref={messagesContainerRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '24px',
          background: '#fafafa',
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '20px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: message.isCurrentUser ? '#3b82f6' : '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 600,
              flexShrink: 0,
            }}>
              {message.senderName.charAt(0)}
            </div>

            {/* Message Content */}
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                }}>
                  {message.senderName}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#999999',
                }}>
                  {formatTime(message.timestamp)}
                </span>
              </div>

              <div style={{
                background: '#ffffff',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
                fontSize: '14px',
                color: '#1a1a1a',
                lineHeight: '1.5',
              }}>
                {message.content}
              </div>

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  {message.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: '#ffffff',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                    >
                      <span style={{ fontSize: '18px' }}>{getFileIcon(attachment.type)}</span>
                      <div>
                        <div style={{ fontWeight: 500, color: '#1a1a1a' }}>
                          {attachment.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#999999' }}>
                          {attachment.size}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid #e5e5e5',
        background: '#ffffff',
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
        }}>
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message # ${channel.name}`}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              fontSize: '14px',
              resize: 'none',
              minHeight: '44px',
              maxHeight: '120px',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <button
            onClick={() => alert('File upload functionality')}
            style={{
              padding: '12px',
              background: '#f5f5f5',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '20px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e5e5e5'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f5'}
            title="Attach file"
          >
            📎
          </button>
          <button
            onClick={handleSend}
            disabled={!messageInput.trim()}
            style={{
              padding: '12px 24px',
              background: messageInput.trim() ? '#3b82f6' : '#e5e5e5',
              color: messageInput.trim() ? '#ffffff' : '#999999',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: messageInput.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (messageInput.trim()) e.currentTarget.style.background = '#2563eb'
            }}
            onMouseLeave={(e) => {
              if (messageInput.trim()) e.currentTarget.style.background = '#3b82f6'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow
