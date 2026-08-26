import { useEffect, useRef, useState } from 'react'
import { getChannelMessages } from '../lib/api'
import {
  deleteMessage,
  editMessage,
  ensureConnected,
  joinChannel,
  leaveChannel,
  sendMessage,
} from '../services/chatHub'
import type { Message } from '../types'

interface ChatAreaProps {
  channelId: string
  channelName: string
  localUserId: string
  isServerOwner: boolean
}

interface ReceivedMessage {
  messageId: string
  channelId: string
  authorId: string
  authorUsername: string
  content: string
  sentAt: string
}

interface EditedMessage {
  messageId: string
  content: string
  editedAt: string
}

interface DeletedMessage {
  messageId: string
}

function formatTime(sentAt: string) {
  return new Date(sentAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function ChatArea({ channelId, channelName, localUserId, isServerOwner }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, isLoadingHistory])

  useEffect(() => {
    let active = true
    setMessages([])
    setIsLoadingHistory(true)
    setEditingId(null)

    function handleReceiveMessage(payload: ReceivedMessage) {
      if (payload.channelId !== channelId) {
        return
      }

      setMessages((current) => [
        ...current,
        {
          id: payload.messageId,
          channelId: payload.channelId,
          authorId: payload.authorId,
          author: payload.authorId === localUserId ? 'Você' : payload.authorUsername,
          content: payload.content,
          sentAt: formatTime(payload.sentAt),
          editedAt: null,
        },
      ])
    }

    function handleMessageEdited(payload: EditedMessage) {
      setMessages((current) =>
        current.map((message) =>
          message.id === payload.messageId
            ? { ...message, content: payload.content, editedAt: formatTime(payload.editedAt) }
            : message,
        ),
      )
    }

    function handleMessageDeleted(payload: DeletedMessage) {
      setMessages((current) => current.filter((message) => message.id !== payload.messageId))
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
          authorId: item.authorId,
          author: item.authorId === localUserId ? 'Você' : item.authorUsername,
          content: item.content,
          sentAt: formatTime(item.sentAt),
          editedAt: item.editedAt ? formatTime(item.editedAt) : null,
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
        hub.on('MessageEdited', handleMessageEdited)
        hub.on('MessageDeleted', handleMessageDeleted)
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
        hub.off('MessageEdited', handleMessageEdited)
        hub.off('MessageDeleted', handleMessageDeleted)
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

  function startEditing(message: Message) {
    setEditingId(message.id)
    setEditDraft(message.content)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditDraft('')
  }

  function handleEditSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!editingId || !editDraft.trim()) {
      return
    }

    setError(null)
    editMessage(editingId, editDraft).catch((err) => {
      setError(err instanceof Error ? err.message : 'Falha ao editar mensagem.')
    })
    setEditingId(null)
    setEditDraft('')
  }

  function handleDelete(messageId: string) {
    setError(null)
    deleteMessage(messageId).catch((err) => {
      setError(err instanceof Error ? err.message : 'Falha ao apagar mensagem.')
    })
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
          messages.map((message) => {
            const isOwnMessage = message.authorId === localUserId
            const canDelete = isOwnMessage || isServerOwner

            return (
              <div key={message.id} className="chat-message">
                <span className="chat-message-author">{message.author}</span>
                <span className="chat-message-time">{message.sentAt}</span>
                {message.editedAt && <span className="chat-message-edited">(editada)</span>}

                {editingId === message.id ? (
                  <form className="chat-message-edit-form" onSubmit={handleEditSubmit}>
                    <input
                      type="text"
                      value={editDraft}
                      onChange={(event) => setEditDraft(event.target.value)}
                      autoFocus
                    />
                    <button type="submit">Salvar</button>
                    <button type="button" onClick={cancelEditing}>
                      Cancelar
                    </button>
                  </form>
                ) : (
                  <p className="chat-message-content">{message.content}</p>
                )}

                {editingId !== message.id && (isOwnMessage || canDelete) && (
                  <span className="chat-message-actions">
                    {isOwnMessage && (
                      <button type="button" onClick={() => startEditing(message)} title="Editar mensagem">
                        ✎
                      </button>
                    )}
                    {canDelete && (
                      <button type="button" onClick={() => handleDelete(message.id)} title="Apagar mensagem">
                        🗑
                      </button>
                    )}
                  </span>
                )}
              </div>
            )
          })
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
