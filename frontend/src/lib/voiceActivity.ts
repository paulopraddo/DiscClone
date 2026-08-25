let sharedContext: AudioContext | null = null

function getSharedContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null
  }

  const AudioContextCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

  if (!AudioContextCtor) {
    return null
  }

  sharedContext ??= new AudioContextCtor()
  return sharedContext
}

const SPEAKING_THRESHOLD = 12
const HANGOVER_MS = 250

/**
 * Analisa o volume de um MediaStream de áudio e chama `onChange` sempre que o
 * status de "falando" muda, com uma folga (hangover) para não piscar entre
 * palavras. Retorna uma função de limpeza.
 */
export function createSpeakingDetector(stream: MediaStream, onChange: (isSpeaking: boolean) => void): () => void {
  if (stream.getAudioTracks().length === 0) {
    return () => undefined
  }

  const ctx = getSharedContext()

  if (!ctx) {
    return () => undefined
  }

  let source: MediaStreamAudioSourceNode
  let analyser: AnalyserNode

  try {
    source = ctx.createMediaStreamSource(stream)
    analyser = ctx.createAnalyser()
  } catch {
    return () => undefined
  }

  analyser.fftSize = 512
  analyser.smoothingTimeConstant = 0.6
  source.connect(analyser)

  const data = new Uint8Array(analyser.frequencyBinCount)
  let speaking = false
  let lastAboveThreshold = 0
  let rafId = 0
  let stopped = false

  function tick() {
    if (stopped) {
      return
    }

    analyser.getByteFrequencyData(data)

    let sum = 0
    for (let i = 0; i < data.length; i += 1) {
      sum += data[i]
    }
    const average = sum / data.length
    const now = performance.now()

    if (average > SPEAKING_THRESHOLD) {
      lastAboveThreshold = now

      if (!speaking) {
        speaking = true
        onChange(true)
      }
    } else if (speaking && now - lastAboveThreshold > HANGOVER_MS) {
      speaking = false
      onChange(false)
    }

    rafId = requestAnimationFrame(tick)
  }

  rafId = requestAnimationFrame(tick)

  return () => {
    stopped = true
    cancelAnimationFrame(rafId)
    source.disconnect()
    analyser.disconnect()

    if (speaking) {
      onChange(false)
    }
  }
}
