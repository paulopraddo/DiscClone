let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null
  }

  const AudioContextCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

  if (!AudioContextCtor) {
    return null
  }

  audioContext ??= new AudioContextCtor()
  return audioContext
}

function playTone(ctx: AudioContext, frequency: number, startTime: number, duration: number, gainValue = 0.15) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = frequency

  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(gainValue, startTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

function playSequence(notes: Array<{ frequency: number; duration: number }>) {
  try {
    const ctx = getAudioContext()

    if (!ctx) {
      return
    }

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => undefined)
    }

    let time = ctx.currentTime

    for (const note of notes) {
      playTone(ctx, note.frequency, time, note.duration)
      time += note.duration * 0.85
    }
  } catch {
    // Web Audio indisponível (navegador sem suporte, contexto bloqueado) — ignora silenciosamente.
  }
}

/** Alguém (não você) entrou na call. */
export function playParticipantJoinedSound() {
  playSequence([
    { frequency: 587, duration: 0.12 },
    { frequency: 784, duration: 0.16 },
  ])
}

/** Você entrou na call. */
export function playSelfJoinedSound() {
  playSequence([
    { frequency: 523, duration: 0.1 },
    { frequency: 659, duration: 0.1 },
    { frequency: 784, duration: 0.18 },
  ])
}

/** Você ou outra pessoa saiu da call. */
export function playParticipantLeftSound() {
  playSequence([
    { frequency: 659, duration: 0.12 },
    { frequency: 440, duration: 0.18 },
  ])
}

/** Você se mutou. */
export function playMutedSound() {
  playSequence([{ frequency: 300, duration: 0.08 }])
}

/** Alguém parou de compartilhar a tela. */
export function playScreenShareStoppedSound() {
  playSequence([
    { frequency: 392, duration: 0.1 },
    { frequency: 330, duration: 0.14 },
  ])
}
