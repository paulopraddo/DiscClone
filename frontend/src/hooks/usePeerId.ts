import { useEffect, useState } from 'react'
import { ensurePeer } from '../services/peer'

export function usePeerId() {
  const [peerId, setPeerId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    ensurePeer()
      .then(({ id }) => {
        if (active) {
          setPeerId(id)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Falha ao conectar ao PeerJS.')
        }
      })

    return () => {
      active = false
    }
  }, [])

  return { peerId, error }
}
