// Speech Synthesis & Recognition Services using browser Web Speech API

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

export const isSpeechSupported = () => {
  return typeof window !== 'undefined' && ('speechSynthesis' in window || !!SpeechRecognition)
}

export function speakText(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

  // Cancel any ongoing speaking
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 1.0
  utterance.pitch = 1.0

  // Choose a premium sounding voice if available
  const voices = window.speechSynthesis.getVoices()
  const premiumVoice = voices.find(
    (voice) =>
      voice.name.includes('Google US English') ||
      voice.name.includes('Microsoft David') ||
      voice.name.includes('Natural')
  )
  if (premiumVoice) {
    utterance.voice = premiumVoice
  }

  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
}

interface ListenCallbacks {
  onResult: (text: string) => void
  onError?: (err: any) => void
  onEnd?: () => void
}

export class VoiceListener {
  private recognition: any = null
  private active = false

  constructor() {
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = false
      this.recognition.lang = 'en-US'
      this.recognition.interimResults = false
      this.recognition.maxAlternatives = 1
    }
  }

  start({ onResult, onError, onEnd }: ListenCallbacks) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition not supported in this browser')
      return
    }
    if (this.active) return

    this.active = true
    this.recognition.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript
      onResult(resultText)
    }

    this.recognition.onerror = (event: any) => {
      if (onError) onError(event.error)
      this.active = false
    }

    this.recognition.onend = () => {
      this.active = false
      if (onEnd) onEnd()
    }

    try {
      this.recognition.start()
    } catch (e) {
      if (onError) onError(e)
      this.active = false
    }
  }

  stop() {
    if (this.recognition && this.active) {
      this.recognition.stop()
      this.active = false
    }
  }

  isActive() {
    return this.active
  }
}
