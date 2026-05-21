import { useCallback, useRef } from 'react'

export function useSpeech() {
  const speaking = useRef(false)

  const speak = useCallback((text: string, lang: 'ja-JP' | 'vi-VN' = 'ja-JP') => {
    if (!window.speechSynthesis || !text.trim()) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text.trim())
    utt.lang = lang
    utt.rate = 0.85
    utt.onstart = () => { speaking.current = true }
    utt.onend = () => { speaking.current = false }
    window.speechSynthesis.speak(utt)
  }, [])

  return { speak }
}
