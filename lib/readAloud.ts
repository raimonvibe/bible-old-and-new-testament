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

export type VoiceGender = 'female' | 'male' | 'unknown'

export type VoiceSourceFilter = 'network' | 'all' | 'local'

export type VoiceGenderFilter = 'any' | 'female' | 'male'

const FEMALE_VOICE_PATTERN =
  /\b(female|woman|women|femme)\b|samantha|victoria|karen|moira|tessa|fiona|serena|zira|hazel|susan|jenny|aria\b|natasha|\bsara\b|emma\b|michelle|linda|heather|nancy|laura|allison|\bava\b|sonia|veena|priya|\bkate\b|olivia|sophie|charlotte|amelia|isabella|emily|chloe|nora|joanna|ivy|kimberly|kendra|salli|nicole|penelope|raveena|aditi|amy|lisa|hannah|sabina|maria|paulina|luciana|camila|mia|luna|soledad|laila|hoda|salma|yasmin|ayanda|thando|lesedi|imani|nandi|tapiwa|mapaseka|google uk english female|google us english.*female|english.*female|microsoft.*zira|microsoft.*jenny|microsoft.*aria|microsoft.*sonia|microsoft.*michelle|microsoft.*heather|microsoft.*linda|microsoft.*susan|microsoft.*hazel|microsoft.*catherine|microsoft.*libby|microsoft.*maisie|microsoft.*sonia|microsoft.*emily|microsoft.*natasha|microsoft.*clara|microsoft.*freya|microsoft.*olivia|microsoft.*sara|microsoft.*jane|microsoft.*nancy|microsoft.*amber|microsoft.*ana|microsoft.*ashley|microsoft.*ava|microsoft.*caroline|microsoft.*elizabeth|microsoft.*grace|microsoft.*jessa|microsoft.*joanna|microsoft.*kimberly|microsoft.*leah|microsoft.*monica|microsoft.*narrator.*female/i

const MALE_VOICE_PATTERN =
  /\b(male|man|homme)\b|microsoft.*david|microsoft.*mark|microsoft.*guy|microsoft.*ryan|microsoft.*brian|microsoft.*aaron|microsoft.*nathan|microsoft.*lloyd|microsoft.*rishi|microsoft.*james|microsoft.*george|microsoft.*tony|microsoft.*eric|microsoft.*andrew|microsoft.*christopher|microsoft.*steffan|microsoft.*william|microsoft.*thomas|microsoft.*connor|microsoft.*liam|microsoft.*noah|microsoft.*sam|google uk english male|google us english.*male|english.*male|\bdavid\b|\bmark\b|\bdaniel\b|\bjames\b|\bguy\b|\bgeorge\b|\bfred\b|\btom\b|\balex\b|\bryan\b|\bbrian\b|\baaron\b|\bnathan\b|\blloyd\b|\brishi\b|\bjohn\b|\bpaul\b|\brichard\b|\bstephen\b|\bsteven\b|\bsean\b|\bkevin\b|\bmichael\b|\brobert\b|\bwilliam\b|\bthomas\b|\bconnor\b|\bliam\b|\bnoah\b|\bsam\b|\bharry\b|\bbarry\b|\bbruce\b|\bcolin\b|\bdonald\b|\beddy\b|\bfrank\b|\bgordon\b|\bjack\b|\bjacob\b|\bjoe\b|\bjoshua\b|\bjustin\b|\bkenny\b|\blarry\b|\bmartin\b|\bmatt\b|\bmatthew\b|\bmike\b|\bneil\b|\bnick\b|\boscar\b|\bpatrick\b|\bphil\b|\bray\b|\breggie\b|\broland\b|\brussell\b|\bscott\b|\bsteve\b|\bterry\b|\btim\b|\btimmy\b|\btrevor\b|\btyler\b|\bvincent\b|\bwalter\b|\bwayne\b|\bwesley\b|\bwill\b|\bwilliam\b|\byuri\b|\bzach\b/i

export function inferVoiceGender(voice: SpeechSynthesisVoice): VoiceGender {
  const name = voice.name.toLowerCase()
  if (FEMALE_VOICE_PATTERN.test(name)) return 'female'
  if (MALE_VOICE_PATTERN.test(name)) return 'male'
  return 'unknown'
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

export function applyVoiceFilters(
  voices: SpeechSynthesisVoice[],
  source: VoiceSourceFilter,
  gender: VoiceGenderFilter,
): SpeechSynthesisVoice[] {
  let filtered = voices

  if (source === 'network') {
    filtered = filtered.filter((v) => !v.localService)
  } else if (source === 'local') {
    filtered = filtered.filter((v) => v.localService)
  }

  if (gender === 'female') {
    filtered = filtered.filter((v) => inferVoiceGender(v) === 'female')
  } else if (gender === 'male') {
    filtered = filtered.filter((v) => inferVoiceGender(v) === 'male')
  }

  if (source === 'all') {
    return sortVoices(filtered)
  }

  const english = filtered.filter((v) => v.lang.startsWith('en'))
  const pool = english.length > 0 ? english : filtered

  return sortVoices(pool)
}

/** All English voices (or all voices if none), network-first. */
export function filterVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return applyVoiceFilters(voices, 'network', 'any')
}

export function pickDefaultVoice(
  voices: SpeechSynthesisVoice[],
  preferredURI?: string,
): SpeechSynthesisVoice | undefined {
  if (preferredURI) {
    const saved = voices.find((v) => v.voiceURI === preferredURI)
    if (saved) return saved
  }

  const networkFemale = applyVoiceFilters(voices, 'network', 'female')
  if (networkFemale[0]) return networkFemale[0]

  const network = applyVoiceFilters(voices, 'network', 'any')
  if (network[0]) return network[0]

  return sortVoices(voices)[0]
}

export function formatVoiceLabel(voice: SpeechSynthesisVoice): string {
  const lang = voice.lang.replace('_', '-')
  const tag = voice.localService ? 'Local' : 'Network'
  const gender = inferVoiceGender(voice)
  const genderTag =
    gender === 'female' ? ', Female' : gender === 'male' ? ', Male' : ''
  return `${voice.name} (${lang}, ${tag}${genderTag})`
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
