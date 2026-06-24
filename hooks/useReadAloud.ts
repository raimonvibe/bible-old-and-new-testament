'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  applyVoiceFilters,
  clearChunkHighlights,
  getReadableChunks,
  getSelectionChunk,
  highlightChunk,
  pickDefaultVoice,
  updateSelectionCache,
  type ReadChunk,
  type VoiceGenderFilter,
  type VoiceSourceFilter,
} from '@/lib/readAloud'

const VOICE_URI_KEY = 'read-aloud-voice-uri'
const VOICE_SOURCE_KEY = 'read-aloud-voice-source'
const VOICE_GENDER_KEY = 'read-aloud-voice-gender'

export type ReadAloudStatus = 'idle' | 'playing' | 'paused'

export type ReadMode = 'page' | 'selection'

type SessionState = {
  generation: number
  paused: boolean
  stopped: boolean
}

export function useReadAloud() {
  const [status, setStatus] = useState<ReadAloudStatus>('idle')
  const [chunks, setChunks] = useState<ReadChunk[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const [allVoices, setAllVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceURI, setVoiceURI] = useState('')
  const [voiceSource, setVoiceSourceState] = useState<VoiceSourceFilter>(() => {
    if (typeof window === 'undefined') return 'network'
    const saved = localStorage.getItem(VOICE_SOURCE_KEY)
    return saved === 'all' || saved === 'local' || saved === 'network'
      ? saved
      : 'network'
  })
  const [voiceGender, setVoiceGenderState] = useState<VoiceGenderFilter>(() => {
    if (typeof window === 'undefined') return 'female'
    const saved = localStorage.getItem(VOICE_GENDER_KEY)
    return saved === 'any' || saved === 'female' || saved === 'male'
      ? saved
      : 'female'
  })
  const [mode, setMode] = useState<ReadMode>('page')
  const [supported, setSupported] = useState(true)

  const chunksRef = useRef<ReadChunk[]>([])
  const indexRef = useRef(0)
  const mainRef = useRef<HTMLElement | null>(null)
  const sessionRef = useRef<SessionState>({
    generation: 0,
    paused: false,
    stopped: true,
  })
  const settingsRef = useRef({ rate, pitch, volume, voiceURI })
  const voiceSourceRef = useRef(voiceSource)
  const voiceGenderRef = useRef(voiceGender)

  useEffect(() => {
    settingsRef.current = { rate, pitch, volume, voiceURI }
  }, [rate, pitch, volume, voiceURI])

  useEffect(() => {
    voiceSourceRef.current = voiceSource
  }, [voiceSource])

  useEffect(() => {
    voiceGenderRef.current = voiceGender
  }, [voiceGender])

  const getMainRoot = useCallback(() => {
    if (typeof document === 'undefined') return null
    const root = document.getElementById('main-content')
    mainRef.current = root
    return root
  }, [])

  const syncFilteredVoices = useCallback(
    (
      available: SpeechSynthesisVoice[],
      source: VoiceSourceFilter,
      gender: VoiceGenderFilter,
      currentURI: string,
    ) => {
      const filtered = applyVoiceFilters(available, source, gender)
      setVoices(filtered)

      setVoiceURI((current) => {
        const uri = current || currentURI
        if (uri && filtered.some((v) => v.voiceURI === uri)) return uri

        const saved =
          typeof window !== 'undefined'
            ? localStorage.getItem(VOICE_URI_KEY) ?? undefined
            : undefined
        const picked = pickDefaultVoice(filtered, saved)
        return picked?.voiceURI ?? filtered[0]?.voiceURI ?? ''
      })
    },
    [],
  )

  const loadVoices = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const available = window.speechSynthesis.getVoices()
    setAllVoices(available)
    syncFilteredVoices(
      available,
      voiceSourceRef.current,
      voiceGenderRef.current,
      settingsRef.current.voiceURI,
    )
  }, [syncFilteredVoices])

  const setVoiceSource = useCallback(
    (source: VoiceSourceFilter) => {
      setVoiceSourceState(source)
      voiceSourceRef.current = source
      if (typeof window !== 'undefined') {
        localStorage.setItem(VOICE_SOURCE_KEY, source)
      }
      syncFilteredVoices(
        allVoices.length
          ? allVoices
          : window.speechSynthesis?.getVoices() ?? [],
        source,
        voiceGenderRef.current,
        settingsRef.current.voiceURI,
      )
    },
    [allVoices, syncFilteredVoices],
  )

  const setVoiceGender = useCallback(
    (gender: VoiceGenderFilter) => {
      setVoiceGenderState(gender)
      voiceGenderRef.current = gender
      if (typeof window !== 'undefined') {
        localStorage.setItem(VOICE_GENDER_KEY, gender)
      }
      syncFilteredVoices(
        allVoices.length
          ? allVoices
          : window.speechSynthesis?.getVoices() ?? [],
        voiceSourceRef.current,
        gender,
        settingsRef.current.voiceURI,
      )
    },
    [allVoices, syncFilteredVoices],
  )

  const setVoiceURIAndSave = useCallback((uri: string) => {
    setVoiceURI(uri)
    if (typeof window !== 'undefined' && uri) {
      localStorage.setItem(VOICE_URI_KEY, uri)
    }
  }, [])

  const stop = useCallback(() => {
    sessionRef.current.generation += 1
    sessionRef.current.stopped = true
    sessionRef.current.paused = false
    window.speechSynthesis?.cancel()
    if (mainRef.current) clearChunkHighlights(mainRef.current)
    setStatus('idle')
    setCurrentIndex(0)
    indexRef.current = 0
    chunksRef.current = []
    setChunks([])
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.speechSynthesis) {
      setSupported(false)
      return
    }
    getMainRoot()
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    const onStop = () => stop()
    window.addEventListener('read-aloud-stop', onStop)
    document.addEventListener('selectionchange', updateSelectionCache)

    return () => {
      window.speechSynthesis.onvoiceschanged = null
      window.speechSynthesis.cancel()
      window.removeEventListener('read-aloud-stop', onStop)
      document.removeEventListener('selectionchange', updateSelectionCache)
    }
  }, [getMainRoot, loadVoices, stop])

  const speakChunk = useCallback(
    (index: number) => {
      const session = sessionRef.current
      if (session.stopped) return

      const list = chunksRef.current
      if (!list.length || index >= list.length) {
        stop()
        return
      }

      const generation = session.generation
      const chunk = list[index]
      indexRef.current = index
      setCurrentIndex(index)
      highlightChunk(chunk.element)

      const { rate: r, pitch: p, volume: v, voiceURI: uri } = settingsRef.current

      const utterance = new SpeechSynthesisUtterance(chunk.text)
      utterance.rate = r
      utterance.pitch = p
      utterance.volume = v

      const voice = window.speechSynthesis
        ?.getVoices()
        .find((item) => item.voiceURI === uri)
      if (voice) utterance.voice = voice

      utterance.onend = () => {
        const current = sessionRef.current
        if (
          current.generation !== generation ||
          current.stopped ||
          current.paused
        ) {
          return
        }
        window.setTimeout(() => {
          const after = sessionRef.current
          if (
            after.generation !== generation ||
            after.stopped ||
            after.paused
          ) {
            return
          }
          speakChunk(index + 1)
        }, 280)
      }

      utterance.onerror = (event) => {
        const current = sessionRef.current
        if (current.generation !== generation || current.stopped) return
        if (event.error === 'interrupted' || event.error === 'canceled') return
        if (index < list.length - 1) speakChunk(index + 1)
        else stop()
      }

      window.speechSynthesis.speak(utterance)
      setStatus(session.paused ? 'paused' : 'playing')
    },
    [stop],
  )

  const start = useCallback(
    (readMode: ReadMode = 'page'): boolean => {
      const root = getMainRoot()
      if (!supported || !root) return false

      sessionRef.current.generation += 1
      sessionRef.current.stopped = false
      sessionRef.current.paused = false
      window.speechSynthesis.cancel()
      clearChunkHighlights(root)

      let list: ReadChunk[] = []
      let activeMode: ReadMode = readMode

      if (readMode === 'selection') {
        const selected = getSelectionChunk()
        if (!selected) return false
        list = [selected]
      } else {
        list = getReadableChunks(root)
        activeMode = 'page'
      }

      if (!list.length) return false

      setMode(activeMode)
      chunksRef.current = list
      setChunks(list)
      indexRef.current = 0
      setCurrentIndex(0)

      window.setTimeout(() => speakChunk(0), 50)
      return true
    },
    [supported, speakChunk, getMainRoot],
  )

  const pause = useCallback(() => {
    if (!window.speechSynthesis.speaking || window.speechSynthesis.paused) {
      return
    }
    sessionRef.current.paused = true
    window.speechSynthesis.pause()
    setStatus('paused')
  }, [])

  const resume = useCallback(() => {
    if (!sessionRef.current.paused) return
    sessionRef.current.paused = false
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
    setStatus('playing')
  }, [])

  const togglePlayPause = useCallback(() => {
    if (status === 'playing') pause()
    else if (status === 'paused') resume()
    else start(mode)
  }, [status, pause, resume, start, mode])

  const skip = useCallback(
    (delta: number) => {
      const next = indexRef.current + delta
      if (next < 0 || next >= chunksRef.current.length) return

      sessionRef.current.generation += 1
      sessionRef.current.paused = false
      sessionRef.current.stopped = false
      window.speechSynthesis.cancel()

      window.setTimeout(() => speakChunk(next), 80)
    },
    [speakChunk],
  )

  const progress =
    chunks.length > 0 ? ((currentIndex + 1) / chunks.length) * 100 : 0

  return {
    supported,
    status,
    chunks,
    currentIndex,
    progress,
    rate,
    setRate,
    pitch,
    setPitch,
    volume,
    setVolume,
    voices,
    voiceURI,
    setVoiceURI: setVoiceURIAndSave,
    voiceSource,
    setVoiceSource,
    voiceGender,
    setVoiceGender,
    mode,
    start,
    stop,
    pause,
    resume,
    togglePlayPause,
    skip,
  }
}
