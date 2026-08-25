import { NoiseGateWorkletNode, RnnoiseWorkletNode, loadRnnoise } from '@sapphi-red/web-noise-suppressor'
import rnnoiseWorkletPath from '@sapphi-red/web-noise-suppressor/rnnoiseWorklet.js?url'
import rnnoiseWasmPath from '@sapphi-red/web-noise-suppressor/rnnoise.wasm?url'
import rnnoiseSimdWasmPath from '@sapphi-red/web-noise-suppressor/rnnoise_simd.wasm?url'
import noiseGateWorkletPath from '@sapphi-red/web-noise-suppressor/noiseGateWorklet.js?url'

// RnnoiseWorkletNode assume 48kHz.
let sharedContext: AudioContext | null = null
let modulesReady: Promise<void> | null = null
let rnnoiseWasmBinary: Promise<ArrayBuffer> | null = null

function getSharedContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null
  }

  const AudioContextCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

  if (!AudioContextCtor) {
    return null
  }

  sharedContext ??= new AudioContextCtor({ sampleRate: 48000 })
  return sharedContext
}

function ensureModulesLoaded(ctx: AudioContext): Promise<void> {
  modulesReady ??= (async () => {
    await ctx.audioWorklet.addModule(rnnoiseWorkletPath)
    await ctx.audioWorklet.addModule(noiseGateWorkletPath)
  })()

  return modulesReady
}

function getRnnoiseWasmBinary(): Promise<ArrayBuffer> {
  rnnoiseWasmBinary ??= loadRnnoise({ url: rnnoiseWasmPath, simdUrl: rnnoiseSimdWasmPath })
  return rnnoiseWasmBinary
}

export interface NoiseSuppressionResult {
  stream: MediaStream
  cleanup: () => void
}

/**
 * Processa a track de áudio de um MediaStream com RNNoise (supressão de
 * ruído por rede neural) seguido de um noise gate, e retorna um NOVO stream
 * já tratado. Bem mais forte que o `noiseSuppression: true` nativo do
 * navegador, que sozinho deixa bastante ruído de fundo passar.
 *
 * Se o navegador não suportar AudioWorklet ou o carregamento do wasm falhar,
 * cai de volta pro stream original (com o `cleanup` original) em vez de
 * quebrar a entrada na call.
 */
export async function suppressNoise(inputStream: MediaStream): Promise<NoiseSuppressionResult> {
  const passthrough: NoiseSuppressionResult = { stream: inputStream, cleanup: () => undefined }
  const audioTrack = inputStream.getAudioTracks()[0]

  if (!audioTrack) {
    return passthrough
  }

  const ctx = getSharedContext()

  if (!ctx?.audioWorklet) {
    return passthrough
  }

  try {
    await ensureModulesLoaded(ctx)
    const wasmBinary = await getRnnoiseWasmBinary()

    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => undefined)
    }

    const source = ctx.createMediaStreamSource(new MediaStream([audioTrack]))
    const rnnoise = new RnnoiseWorkletNode(ctx, { maxChannels: 1, wasmBinary })
    const gate = new NoiseGateWorkletNode(ctx, {
      openThreshold: -40,
      closeThreshold: -50,
      holdMs: 150,
      maxChannels: 1,
    })
    const destination = ctx.createMediaStreamDestination()

    source.connect(rnnoise)
    rnnoise.connect(gate)
    gate.connect(destination)

    const processedStream = destination.stream

    const cleanup = () => {
      source.disconnect()
      rnnoise.disconnect()
      gate.disconnect()
      rnnoise.destroy()
      destination.disconnect()
      processedStream.getTracks().forEach((track) => track.stop())
    }

    return { stream: processedStream, cleanup }
  } catch {
    return passthrough
  }
}
