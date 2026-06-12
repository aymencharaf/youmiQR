'use client'

import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { getChatSocket } from '@/lib/socket'
import { useAuth } from '@/store/auth'

type Conversation = {
  id: string
  vendor: { storeName: string; slug: string }
  customer: { fullName: string }
  messages: { body: string }[]
}

type Message = { id: string; senderId: string; body: string; createdAt: string }

export default function MessagesPage() {
  const { token, user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) return
    api<Conversation[]>('/chat/conversations', { token }).then(setConversations).catch(() => {})
  }, [token])

  useEffect(() => {
    if (!activeId || !token) return
    api<Message[]>(`/chat/conversations/${activeId}/messages`, { token }).then(setMessages)
    const socket = getChatSocket(token)
    socket.emit('join', { conversationId: activeId })
    const handler = (msg: Message) => setMessages((prev) => [...prev, msg])
    socket.on('message', handler)
    return () => {
      socket.off('message', handler)
    }
  }, [activeId, token])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!text.trim() || !activeId || !user) return
    const socket = getChatSocket(token || undefined)
    socket.emit('message', { conversationId: activeId, senderId: user.id, body: text.trim() })
    setText('')
  }

  if (!token) {
    return <div className="p-8 text-center">يرجى تسجيل الدخول لعرض الرسائل.</div>
  }

  return (
    <div className="mx-auto flex h-[70vh] max-w-5xl gap-4 p-4" dir="rtl">
      <aside className="w-72 overflow-y-auto rounded-lg border bg-white">
        <h2 className="border-b p-3 font-bold">المحادثات</h2>
        {conversations.length === 0 && <p className="p-3 text-sm text-gray-500">لا توجد محادثات.</p>}
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            className={`block w-full border-b p-3 text-right hover:bg-gray-50 ${activeId === c.id ? 'bg-emerald-50' : ''}`}
          >
            <div className="font-medium">{c.vendor?.storeName || c.customer?.fullName}</div>
            <div className="truncate text-sm text-gray-500">{c.messages?.[0]?.body || '—'}</div>
          </button>
        ))}
      </aside>
      <section className="flex flex-1 flex-col rounded-lg border bg-white">
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[70%] rounded-lg px-3 py-2 ${m.senderId === user?.id ? 'mr-auto bg-emerald-600 text-white' : 'ml-auto bg-gray-100'}`}
            >
              {m.body}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        {activeId && (
          <div className="flex gap-2 border-t p-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="اكتب رسالة..."
              className="flex-1 rounded-lg border px-3 py-2"
            />
            <button onClick={send} className="rounded-lg bg-emerald-600 px-4 py-2 text-white">
              إرسال
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
