'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  SOURCE_LANGUAGE,
  createTranslator,
  languageAvailability,
  languageByCode,
  supportedLanguages,
  translateBatch,
  translationSupported,
  type TourLanguage,
  type TourTranslator,
} from '@/lib/tourTranslation'

const LANGUAGE_KEY = 'tour-language'

/** Strings translated per round trip. Small enough that the panel fills in
 *  visibly rather than sitting in English until the whole tour is done. */
const CHUNK = 24

export type TourTranslationStatus =
  | 'off'
  | 'preparing'
  | 'downloading'
  | 'translating'
  | 'ready'
  | 'error'

/**
 * Lazy, on-device translation of the guided tour.
 *
 * The panel renders through `tr()`, which is synchronous: it answers from a
 * cache and returns the English text for anything it has not seen yet, queueing
 * that string. After the render an effect drains the queue in chunks and bumps
 * a version, so a step arrives in English for a moment and then settles into
 * the chosen language rather than blocking behind a spinner.
 *
 * `tr` changes identity whenever the language or the cache does, so anything
 * derived from it — the translated copies of MOMENTS and friends — only has to
 * list `tr` in its dependencies.
 */
export function useTourTranslation() {
  const [supported, setSupported] = useState(false)
  const [languages, setLanguages] = useState<TourLanguage[]>([])
  const [languagesLoaded, setLanguagesLoaded] = useState(false)
  const [language, setLanguageState] = useState(SOURCE_LANGUAGE)
  const [status, setStatus] = useState<TourTranslationStatus>('off')
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [version, setVersion] = useState(0)

  /** language code → original string → translation. */
  const cacheRef = useRef(new Map<string, Map<string, string>>())
  const pendingRef = useRef(new Set<string>())
  const translatorRef = useRef<{ code: string; instance: TourTranslator } | null>(
    null,
  )
  const runningRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  const languageRef = useRef(language)
  languageRef.current = language

  useEffect(() => {
    setSupported(translationSupported())
  }, [])

  const attach = useCallback(async (code: string) => {
    setStatus('preparing')

    // create() goes first, still inside the click that asked for the language:
    // downloading a model needs a fresh user gesture, and awaiting anything
    // beforehand can spend it. The availability check runs alongside, only to
    // decide whether to say "downloading".
    const controller = new AbortController()
    abortRef.current = controller
    const creating = createTranslator(
      code,
      (loaded) => setDownloadProgress(loaded),
      controller.signal,
    )
    void languageAvailability(code).then((availability) => {
      if (languageRef.current !== code) return
      if (availability !== 'available') {
        setStatus((current) => (current === 'preparing' ? 'downloading' : current))
      }
    })

    const instance = await creating

    if (languageRef.current !== code) {
      instance?.destroy?.()
      return false
    }
    if (!instance) {
      setStatus('error')
      return false
    }

    translatorRef.current = { code, instance }
    setStatus('translating')
    // Re-render so tr() re-queues everything now that there is a translator.
    setVersion((v) => v + 1)
    return true
  }, [])

  /** Restore the reader's last choice, but only if its model is already here —
   *  downloading one needs a user gesture, so that waits for the picker. */
  useEffect(() => {
    if (!supported) return
    let cancelled = false
    let saved: string | null = null
    try {
      saved = localStorage.getItem(LANGUAGE_KEY)
    } catch {
      saved = null
    }
    if (!saved || saved === SOURCE_LANGUAGE || !languageByCode(saved)) return

    void (async () => {
      if ((await languageAvailability(saved)) !== 'available') return
      if (cancelled) return
      languageRef.current = saved
      setLanguageState(saved)
      await attach(saved)
    })()

    return () => {
      cancelled = true
    }
  }, [supported, attach])

  const drain = useCallback(async () => {
    const code = languageRef.current
    const translator = translatorRef.current
    if (!translator || translator.code !== code) return

    runningRef.current = true
    try {
      while (pendingRef.current.size > 0 && languageRef.current === code) {
        const chunk = Array.from(pendingRef.current).slice(0, CHUNK)
        for (const text of chunk) pendingRef.current.delete(text)

        const translated = await translateBatch(translator.instance, chunk)
        if (languageRef.current !== code) return

        const map = cacheRef.current.get(code) ?? new Map<string, string>()
        chunk.forEach((text, i) => map.set(text, translated[i]))
        cacheRef.current.set(code, map)
        setVersion((v) => v + 1)
      }
    } finally {
      runningRef.current = false
      if (languageRef.current === code && translatorRef.current?.code === code) {
        setStatus(pendingRef.current.size > 0 ? 'translating' : 'ready')
      }
    }
  }, [])

  // Runs after every render on purpose: rendering is what discovers the strings
  // this step needs, and the queue can only be drained once they are known.
  useEffect(() => {
    if (language === SOURCE_LANGUAGE) return
    if (runningRef.current || pendingRef.current.size === 0) return
    void drain()
  })

  /**
   * Translate one string. Returns English until the translation lands, then the
   * version bump re-renders the panel with it.
   */
  const tr = useCallback(
    (text: string): string => {
      const code = languageRef.current
      if (code === SOURCE_LANGUAGE || !text.trim()) return text
      const hit = cacheRef.current.get(code)?.get(text)
      if (hit !== undefined) return hit
      pendingRef.current.add(text)
      return text
    },
    // version is what makes a filled cache visible to memoised consumers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language, version],
  )

  /**
   * Translate narration segments before they are spoken. Unlike `tr` this waits
   * for the answer — nothing is on screen, so there is no flash to avoid.
   */
  const translateSegments = useCallback(
    async (segments: string[]): Promise<string[]> => {
      const code = languageRef.current
      const translator = translatorRef.current
      if (code === SOURCE_LANGUAGE || !translator || translator.code !== code) {
        return segments
      }

      const map = cacheRef.current.get(code) ?? new Map<string, string>()
      cacheRef.current.set(code, map)

      const missing = Array.from(
        new Set(segments.filter((s) => s.trim() && !map.has(s))),
      )
      if (missing.length > 0) {
        const translated = await translateBatch(translator.instance, missing)
        if (languageRef.current !== code) return segments
        missing.forEach((text, i) => map.set(text, translated[i]))
      }
      return segments.map((s) => map.get(s) ?? s)
    },
    [],
  )

  /** Ask the browser which of the offered languages it can actually do. Asked
   *  once, the first time the picker is opened, since each answer is a probe. */
  const loadingLanguagesRef = useRef(false)
  const loadLanguages = useCallback(async () => {
    if (!translationSupported() || languagesLoaded) return
    if (loadingLanguagesRef.current) return
    loadingLanguagesRef.current = true
    try {
      setLanguages(await supportedLanguages())
      setLanguagesLoaded(true)
    } finally {
      loadingLanguagesRef.current = false
    }
  }, [languagesLoaded])

  const setLanguage = useCallback(
    async (code: string) => {
      if (code === languageRef.current) return

      abortRef.current?.abort()
      abortRef.current = null
      translatorRef.current?.instance.destroy?.()
      translatorRef.current = null
      pendingRef.current.clear()
      setDownloadProgress(0)

      languageRef.current = code
      setLanguageState(code)
      try {
        localStorage.setItem(LANGUAGE_KEY, code)
      } catch {
        /* private mode — the choice just won't outlive the session */
      }

      if (code === SOURCE_LANGUAGE) {
        setStatus('off')
        return
      }
      await attach(code)
    },
    [attach],
  )

  useEffect(
    () => () => {
      abortRef.current?.abort()
      translatorRef.current?.instance.destroy?.()
    },
    [],
  )

  return {
    supported,
    languages,
    languagesLoaded,
    loadLanguages,
    language,
    setLanguage,
    status,
    downloadProgress,
    rtl: languageByCode(language)?.rtl === true,
    tr,
    translateSegments,
  }
}
