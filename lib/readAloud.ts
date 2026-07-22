export type ReadChunk = {
  index: number
  text: string
  element: HTMLElement
}

const BLOCK_SELECTOR =
  '[data-read-aloud-block], article, section.card-surface'

const READABLE_SELECTOR =
  'h1, h2, h3, h4, p, li, blockquote'

const IGNORE_ANCESTOR =
  '[data-read-aloud-ignore], nav, footer, header, button'

function isIgnored(el: HTMLElement): boolean {
  if (el.closest(IGNORE_ANCESTOR)) return true
  const anchor = el.closest('a')
  if (anchor && !anchor.matches(BLOCK_SELECTOR) && !anchor.hasAttribute('data-read-aloud-block')) {
    return true
  }
  return false
}

function extractText(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement
  clone
    .querySelectorAll(
      "[data-read-aloud-ignore], button, svg, [aria-hidden='true'], .verse-num",
    )
    .forEach((node) => node.remove())
  return clone.innerText.replace(/\s+/g, ' ').trim()
}

function compareDocumentOrder(a: HTMLElement, b: HTMLElement): number {
  const position = a.compareDocumentPosition(b)
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1
  if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1
  return 0
}

/** Split scripture articles into verse chunks when present */
function expandBlockToChunks(block: HTMLElement): Omit<ReadChunk, 'index'>[] {
  const verses = Array.from(block.querySelectorAll<HTMLElement>('.verse')).filter(
    (el) => !isIgnored(el),
  )

  if (verses.length > 1) {
    return verses
      .map((element) => ({ text: extractText(element), element }))
      .filter((chunk) => chunk.text.length > 0)
  }

  const text = extractText(block)
  return text ? [{ text, element: block }] : []
}

/** One utterance per card/section; scripture articles read verse-by-verse */
export function getReadableChunks(root: HTMLElement): ReadChunk[] {
  const blocks = Array.from(root.querySelectorAll<HTMLElement>(BLOCK_SELECTOR))
    .filter((el) => !isIgnored(el))
    .filter((el, _, arr) =>
      arr.every((other) => other === el || !other.contains(el)),
    )
    .sort(compareDocumentOrder)

  const claimed = new Set<HTMLElement>()
  const chunks: ReadChunk[] = []

  for (const block of blocks) {
    const blockChunks = expandBlockToChunks(block)
    if (!blockChunks.length) continue

    for (const chunk of blockChunks) {
      chunks.push({ index: chunks.length, ...chunk })
    }

    claimed.add(block)
    block.querySelectorAll<HTMLElement>(READABLE_SELECTOR).forEach((el) => {
      claimed.add(el)
    })
    block.querySelectorAll<HTMLElement>('.verse').forEach((el) => {
      claimed.add(el)
    })
  }

  const standalone = Array.from(
    root.querySelectorAll<HTMLElement>(READABLE_SELECTOR),
  )
    .filter((el) => {
      if (isIgnored(el)) return false
      if (claimed.has(el)) return false
      if (el.closest(BLOCK_SELECTOR)) return false
      return extractText(el).length > 0
    })
    .sort(compareDocumentOrder)

  for (const el of standalone) {
    const text = extractText(el)
    if (!text) continue
    chunks.push({ index: chunks.length, text, element: el })
  }

  return chunks
}

type CachedSelection = {
  text: string
  element: HTMLElement
}

/** Last non-empty selection inside #main-content (survives toolbar clicks). */
let selectionCache: CachedSelection | null = null

function elementFromNode(node: Node | null | undefined): HTMLElement {
  if (!node) return document.body
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement
    return (
      el.closest<HTMLElement>(`${BLOCK_SELECTOR}, ${READABLE_SELECTOR}, .verse`) ??
      el
    )
  }
  const parent = node.parentElement
  return (
    parent?.closest<HTMLElement>(`${BLOCK_SELECTOR}, ${READABLE_SELECTOR}, .verse`) ??
    parent ??
    document.body
  )
}

function selectionInMain(selection: Selection, root: HTMLElement): boolean {
  if (!selection.rangeCount) return false
  return root.contains(selection.getRangeAt(0).commonAncestorContainer)
}

function chunkFromSelection(selection: Selection): ReadChunk | null {
  const text = selection.toString().replace(/\s+/g, ' ').trim()
  if (!text) return null
  const element = elementFromNode(selection.focusNode ?? selection.anchorNode)
  return { index: 0, text, element }
}

/** Call on selectionchange so toolbar clicks can still read the last highlight. */
export function updateSelectionCache(): void {
  const root = document.getElementById('main-content')
  const selection = window.getSelection()
  if (!root || !selection || selection.isCollapsed || !selection.rangeCount) return
  if (!selectionInMain(selection, root)) return

  const chunk = chunkFromSelection(selection)
  if (!chunk) return

  selectionCache = { text: chunk.text, element: chunk.element }
}

export function getSelectionChunk(): ReadChunk | null {
  const root = document.getElementById('main-content')
  const selection = window.getSelection()

  if (root && selection && !selection.isCollapsed && selection.rangeCount) {
    if (selectionInMain(selection, root)) {
      const live = chunkFromSelection(selection)
      if (live) {
        selectionCache = { text: live.text, element: live.element }
        return live
      }
    }
  }

  if (selectionCache) {
    return { index: 0, text: selectionCache.text, element: selectionCache.element }
  }

  return null
}

export function clearChunkHighlights(root: HTMLElement) {
  root.querySelectorAll('[data-read-chunk-active]').forEach((el) => {
    el.removeAttribute('data-read-chunk-active')
    el.classList.remove('read-aloud-active')
  })
}

export function highlightChunk(element: HTMLElement) {
  const main =
    element.closest('main') ?? document.getElementById('main-content')
  if (main) clearChunkHighlights(main)
  element.setAttribute('data-read-chunk-active', 'true')
  element.classList.add('read-aloud-active')
  element.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function voiceQualityScore(voice: SpeechSynthesisVoice): number {
  let score = 0
  if (!voice.localService) score += 10
  if (/natural|premium|enhanced|neural|online|cloud/i.test(voice.name)) score += 5
  if (/google|microsoft|amazon|apple/i.test(voice.name)) score += 2
  if (voice.lang.startsWith('en')) score += 3
  if (voice.default) score += 1
  return score
}

export function sortVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return [...voices].sort((a, b) => {
    const diff = voiceQualityScore(b) - voiceQualityScore(a)
    if (diff !== 0) return diff
    return a.name.localeCompare(b.name)
  })
}

export function filterVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const english = voices.filter((v) => v.lang.startsWith('en'))
  const pool = english.length > 0 ? english : voices
  return sortVoices(pool)
}

export function pickDefaultVoice(
  voices: SpeechSynthesisVoice[],
  preferredURI?: string,
): SpeechSynthesisVoice | undefined {
  if (preferredURI) {
    const saved = voices.find((v) => v.voiceURI === preferredURI)
    if (saved) return saved
  }

  return voices.find((v) => !v.localService) ?? voices[0]
}

export function formatVoiceLabel(voice: SpeechSynthesisVoice): string {
  const lang = voice.lang.replace('_', '-')
  const tag = voice.localService ? 'Local' : 'Network'
  return `${voice.name} (${lang}, ${tag})`
}

export function groupVoicesBySource(
  voices: SpeechSynthesisVoice[],
): { label: string; voices: SpeechSynthesisVoice[] }[] {
  const network = voices.filter((v) => !v.localService)
  const local = voices.filter((v) => v.localService)
  const groups: { label: string; voices: SpeechSynthesisVoice[] }[] = []

  if (network.length) {
    groups.push({ label: 'Network voices (recommended)', voices: sortVoices(network) })
  }
  if (local.length) {
    groups.push({ label: 'Local voices', voices: sortVoices(local) })
  }

  return groups
}
