import { useEffect, useRef, useState } from 'react'
import { getChannelMessages } from '../lib/api'
import { ensureConnected, joinChannel, leaveChannel, sendMessage } from '../services/chatHub'
import type { Message } from '../types'

interface ChatAreaProps {
  channelId: string
  channelName: string
  localUserId: string
}

interface ReceivedMessage {
  messageId: string
  channelId: string
  authorId: string
  authorUsername: string
  content: string
  sentAt: string
}

function formatTime(sentAt: string) {
  return new Date(sentAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function ChatArea({ channelId, channelName, localUserId }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, isLoadingHistory])

  useEffect(() => {
    let active = true
    setMessages([])
    setIsLoadingHistory(true)

    function handleReceiveMessage(payload: ReceivedMessage) {
      if (payload.channelId !== channelId) {
        return
      }

      setMessages((current) => [
        ...current,
        {
          id: payload.messageId,
          channelId: payload.channelId,
          author: payload.authorId === localUserId ? 'Você' : payload.authorUsername,
          content: payload.content,
          sentAt: formatTime(payload.sentAt),
        },
      ])
    }

    function handleMessageRejected(reasons: string[]) {
      if (active) {
        setError(reasons.join(' '))
      }
    }

    getChannelMessages(channelId)
      .then((history) => {
        if (!active) {
          return
        }

        const historyMessages: Message[] = history.map((item) => ({
          id: item.id,
          channelId,
          author: item.authorId === localUserId ? 'Você' : item.authorUsername,
          content: item.content,
          sentAt: formatTime(item.sentAt),
        }))

        // Mensagens que já chegaram ao vivo enquanto o histórico carregava não
        // devem ser duplicadas.
        setMessages((current) => {
          const historyIds = new Set(historyMessages.map((m) => m.id))
          const liveOnly = current.filter((m) => !historyIds.has(m.id))
          return [...historyMessages, ...liveOnly]
        })
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Falha ao carregar mensagens.')
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingHistory(false)
        }
      })

    ensureConnected()
      .then((hub) => {
        hub.on('ReceiveMessage', handleReceiveMessage)
        hub.on('MessageRejected', handleMessageRejected)
        return joinChannel(channelId)
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Falha ao conectar ao servidor.')
        }
      })

    return () => {
      active = false
      leaveChannel(channelId).catch(() => undefined)
      ensureConnected().then((hub) => {
        hub.off('ReceiveMessage', handleReceiveMessage)
        hub.off('MessageRejected', handleMessageRejected)
      })
    }
  }, [channelId, localUserId])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!draft.trim()) {
      return
    }

    setError(null)
    sendMessage(channelId, draft).catch((err) => {
      setError(err instanceof Error ? err.message : 'Falha ao enviar mensagem.')
    })
    setDraft('')
  }

  return (
    <section className="chat-area">
      <header className="chat-header">
        <span>#{channelName}</span>
      </header>

      <div className="chat-messages">
        {isLoadingHistory ? (
          <p className="chat-loading">Carregando mensagens...</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="chat-message">
              <span className="chat-message-author">{message.author}</span>
              <span className="chat-message-time">{message.sentAt}</span>
              <p className="chat-message-content">{message.content}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && <div className="chat-error">{error}</div>}

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={`Conversar em #${channelName}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </form>
    </section>
  )
}

export default ChatArea
