import { useEffect, useState } from 'react'
import { ensurePeer } from '../services/peer'
import { withTimeout } from '../lib/withTimeout'

const CONNECT_TIMEOUT_MS = 15000

export function usePeerId() {
  const [peerId, setPeerId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setError(null)

    withTimeout(
      ensurePeer(),
      CONNECT_TIMEOUT_MS,
      'Não foi possível conectar ao serviço de voz. Verifique sua conexão e tente novamente.',
    )
      .then(({ id }) => {
        if (active) {
          setPeerId(id)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Falha ao conectar ao serviço de voz.')
        }
      })

    return () => {
      active = false
    }
  }, [attempt])

  function retry() {
    setPeerId(null)
    setAttempt((current) => current + 1)
  }

  return { peerId, error, retry }
}
