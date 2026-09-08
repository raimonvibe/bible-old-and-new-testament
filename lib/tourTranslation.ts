/**
 * On-device translation for the guided tour.
 *
 * The browser's own "Translate this page" only rewrites the text that is in the
 * document when it runs. The tour mounts later, into a portal on document.body,
 * and swaps its whole body on every step — so a page that was translated before
 * the tour was opened leaves the tour in English, and the right-click menu no
 * longer offers to translate because the page already counts as translated.
 *
 * So the tour carries its own translator. It is built on the browser's built-in
 * Translator API (Chromium 138+): the model runs on the device, which means no
 * API key, no per-string network round trip, and no tour text leaving the
 * machine. Where the API is missing the tour stays in English — see
 * translationSupported().
 */

export type TranslatorAvailability =
  | 'unavailable'
  | 'downloadable'
  | 'downloading'
  | 'available'

export interface TourTranslator {
  translate(input: string): Promise<string>
  destroy?(): void
}

interface CreateOptions {
  sourceLanguage: string
  targetLanguage: string
  monitor?: (monitor: EventTarget) => void
  signal?: AbortSignal
}

interface TranslatorFactory {
  availability(pair: {
    sourceLanguage: string
    targetLanguage: string
  }): Promise<TranslatorAvailability>
  create(options: CreateOptions): Promise<TourTranslator>
}

/** The tour is written in English; every language below is a target from it. */
export const SOURCE_LANGUAGE = 'en'

function factory(): TranslatorFactory | null {
  if (typeof globalThis === 'undefined') return null
  const global = globalThis as unknown as { Translator?: TranslatorFactory }
  const candidate = global.Translator
  return candidate &&
    typeof candidate.create === 'function' &&
    typeof candidate.availability === 'function'
    ? candidate
    : null
}

/** True when this browser can translate on device. */
export function translationSupported(): boolean {
  return factory() !== null
}

export interface TourLanguage {
  code: string
  /** Endonym — shown in the picker, so a reader finds their own language. */
  label: string
  /** English name, used for the aria-label. */
  english: string
  rtl?: boolean
}

/**
 * Offered languages. The list is deliberately wider than any one browser
 * supports — useTourTranslation asks the browser which of these it can actually
 * do and hides the rest, so this never has to track the API's shipping list.
 */
export const TOUR_LANGUAGES: TourLanguage[] = [
  { code: 'ar', label: 'العربية', english: 'Arabic', rtl: true },
  { code: 'bn', label: 'বাংলা', english: 'Bengali' },
  { code: 'bg', label: 'Български', english: 'Bulgarian' },
  { code: 'cs', label: 'Čeština', english: 'Czech' },
  { code: 'da', label: 'Dansk', english: 'Danish' },
  { code: 'de', label: 'Deutsch', english: 'German' },
  { code: 'el', label: 'Ελληνικά', english: 'Greek' },
  { code: 'es', label: 'Español', english: 'Spanish' },
  { code: 'fa', label: 'فارسی', english: 'Persian', rtl: true },
  { code: 'fi', label: 'Suomi', english: 'Finnish' },
  { code: 'fr', label: 'Français', english: 'French' },
  { code: 'gu', label: 'ગુજરાતી', english: 'Gujarati' },
  { code: 'he', label: 'עברית', english: 'Hebrew', rtl: true },
  { code: 'hi', label: 'हिन्दी', english: 'Hindi' },
  { code: 'hr', label: 'Hrvatski', english: 'Croatian' },
  { code: 'hu', label: 'Magyar', english: 'Hungarian' },
  { code: 'id', label: 'Bahasa Indonesia', english: 'Indonesian' },
  { code: 'it', label: 'Italiano', english: 'Italian' },
  { code: 'ja', label: '日本語', english: 'Japanese' },
  { code: 'kn', label: 'ಕನ್ನಡ', english: 'Kannada' },
  { code: 'ko', label: '한국어', english: 'Korean' },
  { code: 'lt', label: 'Lietuvių', english: 'Lithuanian' },
  { code: 'mr', label: 'मराठी', english: 'Marathi' },
  { code: 'ms', label: 'Bahasa Melayu', english: 'Malay' },
  { code: 'nl', label: 'Nederlands', english: 'Dutch' },
  { code: 'no', label: 'Norsk', english: 'Norwegian' },
  { code: 'pl', label: 'Polski', english: 'Polish' },
  { code: 'pt', label: 'Português', english: 'Portuguese' },
  { code: 'ro', label: 'Română', english: 'Romanian' },
  { code: 'ru', label: 'Русский', english: 'Russian' },
  { code: 'sk', label: 'Slovenčina', english: 'Slovak' },
  { code: 'sl', label: 'Slovenščina', english: 'Slovenian' },
  { code: 'sr', label: 'Српски', english: 'Serbian' },
  { code: 'sv', label: 'Svenska', english: 'Swedish' },
  { code: 'sw', label: 'Kiswahili', english: 'Swahili' },
  { code: 'ta', label: 'தமிழ்', english: 'Tamil' },
  { code: 'te', label: 'తెలుగు', english: 'Telugu' },
  { code: 'th', label: 'ไทย', english: 'Thai' },
  { code: 'tr', label: 'Türkçe', english: 'Turkish' },
  { code: 'uk', label: 'Українська', english: 'Ukrainian' },
  { code: 'ur', label: 'اردو', english: 'Urdu', rtl: true },
  { code: 'vi', label: 'Tiếng Việt', english: 'Vietnamese' },
  { code: 'zh', label: '中文（简体）', english: 'Chinese (Simplified)' },
  { code: 'zh-Hant', label: '中文（繁體）', english: 'Chinese (Traditional)' },
]

export function languageByCode(code: string): TourLanguage | undefined {
  return TOUR_LANGUAGES.find((language) => language.code === code)
}

/**
 * Some builds expose `Translator` but never settle its promises — an embedded
 * or policy-restricted browser where the model service is not reachable. Every
 * call below is raced against a deadline so the panel reports "not available
 * here" instead of sitting on a spinner for the rest of the session.
 */
function withTimeout<T>(
  work: Promise<T>,
  ms: number,
  fallback: T,
): Promise<T> {
  return new Promise((resolve) => {
    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      resolve(fallback)
    }, ms)
    work.then(
      (value) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve(value)
      },
      () => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve(fallback)
      },
    )
  })
}

/** How long to wait on one availability check before writing it off. */
const AVAILABILITY_TIMEOUT = 6000

/** A model download is allowed to be slow, but not endless. */
const CREATE_TIMEOUT = 180000

/** One paragraph should never take this long; fall back to the English. */
const TRANSLATE_TIMEOUT = 20000

/** Can this browser translate English into `code` at all? */
export async function languageAvailability(
  code: string,
): Promise<TranslatorAvailability> {
  const api = factory()
  if (!api) return 'unavailable'
  try {
    return await withTimeout(
      api.availability({
        sourceLanguage: SOURCE_LANGUAGE,
        targetLanguage: code,
      }),
      AVAILABILITY_TIMEOUT,
      'unavailable',
    )
  } catch {
    return 'unavailable'
  }
}

/** The subset of TOUR_LANGUAGES this browser will actually translate into. */
export async function supportedLanguages(): Promise<TourLanguage[]> {
  if (!factory()) return []
  const checked = await Promise.all(
    TOUR_LANGUAGES.map(async (language) => ({
      language,
      availability: await languageAvailability(language.code),
    })),
  )
  return checked
    .filter((entry) => entry.availability !== 'unavailable')
    .map((entry) => entry.language)
}

/**
 * Build a translator for one language. The first use of a language downloads a
 * model, which is why `onProgress` exists — the caller shows a bar rather than
 * an unexplained wait. Called from the click that picks the language, since the
 * browser only allows the download from a user gesture.
 */
export async function createTranslator(
  code: string,
  onProgress?: (loaded: number) => void,
  signal?: AbortSignal,
): Promise<TourTranslator | null> {
  const api = factory()
  if (!api) return null
  try {
    return await withTimeout(
      api.create({
        sourceLanguage: SOURCE_LANGUAGE,
        targetLanguage: code,
        signal,
        monitor(monitor) {
          monitor.addEventListener('downloadprogress', (event) => {
            const { loaded } = event as ProgressEvent
            onProgress?.(typeof loaded === 'number' ? loaded : 0)
          })
        },
      }),
      CREATE_TIMEOUT,
      null,
    )
  } catch {
    return null
  }
}

/**
 * Translate a batch, a few at a time. The on-device model serialises anyway; a
 * small pool keeps it busy without queueing hundreds of calls at once, and a
 * string that fails comes back unchanged rather than blank.
 */
export async function translateBatch(
  translator: TourTranslator,
  texts: string[],
  concurrency = 4,
): Promise<string[]> {
  const out = new Array<string>(texts.length)
  let cursor = 0

  const worker = async () => {
    for (;;) {
      const index = cursor++
      if (index >= texts.length) return
      const source = texts[index]
      try {
        out[index] = await withTimeout(
          translator.translate(source),
          TRANSLATE_TIMEOUT,
          source,
        )
      } catch {
        out[index] = source
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.max(1, Math.min(concurrency, texts.length)) }, worker),
  )
  return out
}

/**
 * Keys whose values are machine identifiers, not prose: translating them would
 * break the icon lookups, the accent colours and the links into the reader.
 */
const PRESERVED_KEYS = new Set([
  'id',
  'kind',
  'bookId',
  'chapterNumber',
  'testament',
  'verses',
])

/**
 * Rebuild a tour data structure with every prose string passed through `fn`,
 * leaving identifiers and numbers alone. This is what lets MOMENTS, the
 * testament sections and the tour catalogue be translated without touching the
 * hundred places the panel renders them.
 */
export function mapStrings<T>(value: T, fn: (text: string) => string): T {
  if (typeof value === 'string') return fn(value) as unknown as T
  if (Array.isArray(value)) {
    return value.map((item) => mapStrings(item, fn)) as unknown as T
  }
  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>
    const next: Record<string, unknown> = {}
    for (const key of Object.keys(source)) {
      next[key] = PRESERVED_KEYS.has(key)
        ? source[key]
        : mapStrings(source[key], fn)
    }
    return next as unknown as T
  }
  return value
}

/**
 * Fill `{name}` placeholders in a translated template. Machine translation
 * sometimes drops or mangles a placeholder — when that happens the already
 * formatted English string is used instead of showing a broken sentence.
 */
export function format(
  template: string,
  vars: Record<string, string | number>,
  fallback: string,
): string {
  let out = template
  for (const [key, value] of Object.entries(vars)) {
    const token = `{${key}}`
    if (!out.includes(token)) return fallback
    out = out.split(token).join(String(value))
  }
  return out
}
