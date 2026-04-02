import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { format, isToday, isYesterday } from 'date-fns'

const formatTime = (ts) => {
  const d = new Date(ts)
  if (isToday(d)) return format(d, 'h:mm a')
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`
  return format(d, 'MMM d, h:mm a')
}

export default function Messages() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)   // { userId, userName }
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [pageLoading, setPageLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef(null)
  const channelRef = useRef(null)
  const inputRef = useRef(null)

  // ── Auth guard ──
  useEffect(() => {
    if (!user) { navigate('/auth'); return }
    loadConversations()
  }, [user, navigate])

  // ── Handle ?user=UUID deep-link from ListingDetail ──
  useEffect(() => {
    const targetUserId = searchParams.get('user')
    if (!targetUserId || !user) return

    const initFromUrl = async () => {
      // Try to find existing conversation first
      const existing = conversations.find((c) => c.userId === targetUserId)
      if (existing) { selectConversation(existing); return }

      // Fetch the user's name from DB
      const { data } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('id', targetUserId)
        .maybeSingle()

      if (data) {
        const conv = {
          userId: data.id,
          userName: data.full_name,
          lastMessage: '',
          lastTime: new Date().toISOString(),
          unreadCount: 0,
        }
        setConversations((prev) =>
          prev.find((c) => c.userId === data.id) ? prev : [conv, ...prev]
        )
        setSelectedConv(conv)
      }
    }

    initFromUrl()
  }, [searchParams, conversations.length, user])

  // ── Load messages whenever selected conversation changes ──
  useEffect(() => {
    if (!selectedConv) return
    loadMessages(selectedConv.userId)
    subscribeToMessages(selectedConv.userId)
    inputRef.current?.focus()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [selectedConv?.userId])

  // ── Auto-scroll to bottom ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ─────────────────────────────────────────────
  const loadConversations = async () => {
    setPageLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        is_read,
        sender_id,
        receiver_id,
        sender:sender_id(id, full_name),
        receiver:receiver_id(id, full_name)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const convMap = new Map()
      data.forEach((msg) => {
        const other = msg.sender_id === user.id ? msg.receiver : msg.sender
        if (!other) return
        if (!convMap.has(other.id)) {
          const unreadCount = data.filter(
            (m) => m.sender_id === other.id && m.receiver_id === user.id && !m.is_read
          ).length
          convMap.set(other.id, {
            userId: other.id,
            userName: other.full_name || 'Unknown User',
            lastMessage: msg.content,
            lastTime: msg.created_at,
            unreadCount,
          })
        }
      })
      setConversations(Array.from(convMap.values()))
    }
    setPageLoading(false)
  }

  const loadMessages = async (otherUserId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
      )
      .order('created_at', { ascending: true })

    if (!error && data) {
      setMessages(data)
      // Mark incoming as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', otherUserId)
        .eq('is_read', false)

      // Refresh conversation list to clear badge
      setConversations((prev) =>
        prev.map((c) =>
          c.userId === otherUserId ? { ...c, unreadCount: 0 } : c
        )
      )
    }
  }

  const subscribeToMessages = (otherUserId) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }
    channelRef.current = supabase
      .channel(`msg-${user.id}-${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.new.sender_id === otherUserId) {
            setMessages((prev) => [...prev, payload.new])
            // Mark immediately read since we're looking at this convo
            await supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', payload.new.id)
          }
          loadConversations()
        }
      )
      .subscribe()
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    const content = newMessage.trim()
    if (!content || !selectedConv) return
    setSending(true)

    const optimistic = {
      id: `opt-${Date.now()}`,
      sender_id: user.id,
      receiver_id: selectedConv.userId,
      content,
      created_at: new Date().toISOString(),
      is_read: false,
    }
    setMessages((prev) => [...prev, optimistic])
    setNewMessage('')

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        sender_id: user.id,
        receiver_id: selectedConv.userId,
        content,
        is_read: false,
      }])
      .select()

    if (!error && data) {
      // Replace optimistic with real message
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? data[0] : m))
      )
      loadConversations()
    } else {
      // Remove optimistic on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      setNewMessage(content)
    }
    setSending(false)
    inputRef.current?.focus()
  }

  const selectConversation = (conv) => {
    setSelectedConv(conv)
    setMessages([])
  }

  // ─────────────────────────────────────────────

  if (pageLoading) return <div className="loading">Loading messages…</div>

  return (
    <div className="messages-page">
      <div className="container">
        <h1 className="messages-title">Messages</h1>

        <div className="messages-layout">

          {/* ── Left: Conversations list ── */}
          <div className="conversations-panel">
            <div className="conversations-header">
              <h2>Conversations</h2>
              {conversations.length > 0 && (
                <span className="conv-count">{conversations.length}</span>
              )}
            </div>

            {conversations.length === 0 ? (
              <div className="no-conversations">
                <span>💬</span>
                <p>No messages yet</p>
                <p className="no-conv-hint">
                  Browse listings and tap "Contact Seller" to start chatting
                </p>
              </div>
            ) : (
              <div className="conversations-list">
                {conversations.map((conv) => (
                  <button
                    key={conv.userId}
                    className={`conversation-item ${selectedConv?.userId === conv.userId ? 'active' : ''}`}
                    onClick={() => selectConversation(conv)}
                  >
                    <div className="conv-avatar">
                      {conv.userName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="conv-info">
                      <div className="conv-name-row">
                        <span className="conv-name">{conv.userName}</span>
                        <span className="conv-time">{formatTime(conv.lastTime)}</span>
                      </div>
                      <p className="conv-preview">
                        {conv.lastMessage
                          ? conv.lastMessage.length > 38
                            ? conv.lastMessage.substring(0, 38) + '…'
                            : conv.lastMessage
                          : 'Start the conversation'}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="unread-badge">{conv.unreadCount}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Message thread ── */}
          <div className="messages-panel">
            {selectedConv ? (
              <>
                {/* Thread header */}
                <div className="messages-panel-header">
                  <div className="conv-avatar">
                    {selectedConv.userName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3>{selectedConv.userName}</h3>
                    <span className="panel-subtitle">Direct message</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="messages-thread">
                  {messages.length === 0 ? (
                    <div className="no-messages-hint">
                      <p>👋 Say hello to {selectedConv.userName}!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine = msg.sender_id === user.id
                      return (
                        <div
                          key={msg.id}
                          className={`message-bubble ${isMine ? 'sent' : 'received'}`}
                        >
                          <p>{msg.content}</p>
                          <span className="message-time">{formatTime(msg.created_at)}</span>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form className="message-input-form" onSubmit={sendMessage}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${selectedConv.userName}…`}
                    className="message-input"
                    disabled={sending}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="send-btn"
                    aria-label="Send message"
                    disabled={!newMessage.trim() || sending}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </form>
              </>
            ) : (
              /* Empty state */
              <div className="no-conversation-selected">
                <div className="empty-messages-icon">💬</div>
                <h3>Your Messages</h3>
                <p>Select a conversation on the left, or contact a seller from any listing to start chatting.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}