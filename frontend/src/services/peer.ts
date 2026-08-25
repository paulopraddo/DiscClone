import Peer, { type MediaConnection } from 'peerjs'

let peer: Peer | null = null
let openPromise: Promise<string> | null = null

// Sem um servidor TURN, dois peers atrás de NAT/firewall mais restritivo (rede
// corporativa, certas operadoras) não conseguem uma rota P2P estável — a call
// conecta mas fica instável ou cai. STUN sozinho só ajuda a descobrir o
// caminho direto, não retransmite mídia quando esse caminho não é bom.
//
// TODO: credenciais publicas de teste (OpenRelay/Metered) — trocar por um TURN
// proprio antes de qualquer uso com mais gente, sao compartilhadas e sem SLA.
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.relay.metered.ca:80' },
  { urls: 'turn:global.relay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:global.relay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
  {
    urls: 'turn:global.relay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
]

function getPeer(): Peer {
  peer ??= new Peer({ config: { iceServers: ICE_SERVERS } })
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
