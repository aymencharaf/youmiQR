import { io, type Socket } from 'socket.io-client'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000'

let socket: Socket | null = null

/** إنشاء (أو إعادة استخدام) اتصال الدردشة اللحظي. */
export function getChatSocket(token?: string): Socket {
  if (socket) return socket
  socket = io(`${WS_URL}/chat`, {
    transports: ['websocket'],
    auth: token ? { token } : undefined,
  })
  return socket
}

export function disconnectChatSocket() {
  socket?.disconnect()
  socket = null
}
