import Peer, { type MediaConnection } from 'peerjs'

let peer: Peer | null = null
let openPromise: Promise<string> | null = null

function getPeer(): Peer {
  peer ??= new Peer()
  return peer
}

export function ensurePeer(): Promise<{ peer: Peer; id: string }> {
  const instance = getPeer()

  if (instance.id) {
    return Promise.resolve({ peer: instance, id: instance.id })
  }

  openPromise ??= new Promise<string>((resolve, reject) => {
    instance.on('open', (id) => resolve(id))
    instance.on('error', (err) => {
      openPromise = null
      reject(err)
    })
  })

  return openPromise.then((id) => ({ peer: instance, id }))
}

export function onIncomingCall(handler: (call: MediaConnection) => void): () => void {
  const instance = getPeer()
  instance.on('call', handler)
  return () => instance.off('call', handler)
}

export async function callPeer(
  remotePeerId: string,
  stream: MediaStream,
  metadata?: unknown,
): Promise<MediaConnection> {
  const { peer: instance } = await ensurePeer()
  return instance.call(remotePeerId, stream, { metadata })
}
