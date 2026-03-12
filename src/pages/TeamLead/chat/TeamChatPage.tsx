import { useState, useMemo } from 'react'
import ChannelList from './components/ChannelList'
import ChatWindow from './components/ChatWindow'
import type { Message } from './types/chat.types'

const TeamChatPage = () => {
  const [selectedChannelId, setSelectedChannelId] = useState(channels[0]?.id || '')
  const [messages, setMessages] = useState(initialMessages)

  const selectedChannel = useMemo(() => {
    return channels.find((ch) => ch.id === selectedChannelId)
  }, [selectedChannelId])

  const channelMessages = useMemo(() => {
    return messages.filter((msg) => msg.channelId === selectedChannelId)
  }, [messages, selectedChannelId])

  const handleSendMessage = (content: string, file?: File) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      channelId: selectedChannelId,
      senderId: 'current-user',
      senderName: 'You',
      content,
      timestamp: new Date().toISOString(),
      isCurrentUser: true,
    }

    setMessages([...messages, newMessage])
  }

  return (
    <div style={{
      height: 'calc(100vh - 80px)',
      display: 'flex',
      background: '#fafafa',
    }}>
      {/* Left Panel - Channels */}
      <ChannelList
        channels={channels}
        selectedChannel={selectedChannelId}
        onChannelSelect={setSelectedChannelId}
      />

      {/* Right Panel - Chat Window */}
      <ChatWindow
        channel={selectedChannel}
        messages={channelMessages}
        onSendMessage={handleSendMessage}
      />
    </div>
  )
}

export default TeamChatPage
