import { useState, useMemo } from 'react'
import ChannelList from './components/ChannelList'
import ChatWindow from './components/ChatWindow'
import { channels, messages as initialMessages } from './data/chatData'
import type { Message } from './types/chat.types'

const TeamChatPage = () => {
  const [selectedChannelId, setSelectedChannelId] = useState(channels[0]?.id || '')
  const [messages, setMessages] = useState<Message[]>(initialMessages)

  const selectedChannel = useMemo(() => {
    return channels.find((ch) => ch.id === selectedChannelId)
  }, [selectedChannelId])

  const channelMessages = useMemo(() => {
    return messages.filter((msg) => msg.channelId === selectedChannelId)
  }, [messages, selectedChannelId])

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      channelId: selectedChannelId,
      senderId: 'current-user',
      senderName: 'You',
      content,
      timestamp: new Date().toISOString(),
      isCurrentUser: true,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  return (
    // height: 100% fills the .content container which is sized by .main (100vh - header)
    <div style={{
      height: '100%',
      display: 'flex',
      overflow: 'hidden',
      background: '#fafafa',
    }}>
      {/* Left Panel - Channels (scrollable internally) */}
      <ChannelList
        channels={channels}
        selectedChannel={selectedChannelId}
        onChannelSelect={setSelectedChannelId}
      />

      {/* Right Panel - Chat Window (messages scroll, input stays fixed) */}
      <ChatWindow
        channel={selectedChannel}
        messages={channelMessages}
        onSendMessage={handleSendMessage}
      />
    </div>
  )
}

export default TeamChatPage
