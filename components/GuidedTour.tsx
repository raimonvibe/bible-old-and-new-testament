'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowRight,
  BookOpen,
  Castle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CloudRain,
  Compass,
  Cross,
  DoorOpen,
  Droplets,
  Fish,
  Flame,
  Footprints,
  Heart,
  HeartPulse,
  Languages,
  LifeBuoy,
  MapPin,
  Maximize2,
  MessageCircleQuestionMark,
  Minimize2,
  PawPrint,
  Quote,
  RotateCcw,
  Scroll,
  ShieldCheck,
  SkipForward,
  Sparkles,
  Sunrise,
  Users,
  Utensils,
  Volume2,
  VolumeX,
  Waves,
  Wheat,
  Wine,
  X,
} from 'lucide-react'
import {
  MOMENTS,
  TOUR_INTRO,
  TOUR_OUTRO,
  TOUR_STEPS,
  VOICE_ACCENTS,
  chapterIdOf,
  firstStepOfMoment,
  momentIndexOfStep,
  narrationForStep,
  passageOfStep,
  type MomentId,
  type PassageRef,
  type TourStep,
} from '@/lib/guidedTour'
import {
  MIRACLE_INTRO,
  MIRACLE_OUTRO,
  MIRACLE_STEPS,
  TESTAMENT_ACCENTS,
  TESTAMENT_SECTIONS,
  firstStepOfSection,
  narrationForMiracleStep,
  passageOfMiracleStep,
  sectionIndexOfStep,
  type MiracleId,
  type MiracleTourStep,
  type TestamentId,
} from '@/lib/miraclesTour'
import { TOUR_CATALOG, type TourId } from '@/lib/tourCatalog'
import { useTourNarration } from '@/hooks/useTourNarration'
import { formatVoiceLabel, groupVoicesByLanguage } from '@/lib/readAloud'

/** Where the tour wants the reader to be. */
export interface TourTarget {
  bookId: string
  chapterId: string
  verses: [number, number]
}

interface GuidedTourProps {
  /** Open a passage in the reader, or clear the spotlight when null. */
  onNavigate: (target: TourTarget | null) => void
}

type IconType = React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>

const MOMENT_ICONS: Record<MomentId, IconType> = {
  baptism: Droplets,
  crucifixion: Cross,
  resurrection: Sunrise,
}

const TESTAMENT_ICONS: Record<TestamentId, IconType> = {
  old: Scroll,
  new: Heart,
}

const MIRACLE_ICONS: Record<MiracleId, IconType> = {
  'red-sea': Waves,
  manna: Wheat,
  jericho: Castle,
  'elijah-fire': Flame,
  'fiery-furnace': ShieldCheck,
  'lions-den': PawPrint,
  jonah: Fish,
  cana: Wine,
  'calming-storm': CloudRain,
  'feeding-five-thousand': Utensils,
  'walking-on-water': Footprints,
  lazarus: HeartPulse,
  'bleeding-woman': Heart,
  'peters-rescue': DoorOpen,
}

const TOUR_CARD_ICONS: Record<TourId, IconType> = {
  voices: Users,
  miracles: LifeBuoy,
}

const SEEN_KEY = 'bible-tour-seen'

function lastStepFor(tour: TourId | null): number {
  if (tour === 'voices') return TOUR_STEPS.length - 1
  if (tour === 'miracles') return MIRACLE_STEPS.length - 1
  return 0
}

/**
 * Narrowest reading column worth keeping beside a side-docked panel, and the
 * gap around it. Below this the panel becomes a bottom sheet instead.
 * The 868px breakpoint in globals.css (25rem panel + these two values) caps the
 * panel height for that case and must move with them.
 */
const MIN_READING_COLUMN = 420
const PANEL_GUTTER = 48

/** Below this there is no useful strip of text above a bottom sheet. */
const MIN_VISIBLE_STRIP = 140

const SPEEDS = [0.75, 1, 1.25, 1.5]

/** Give the reader time to open the chapter before reading the passage from it. */
const NARRATION_DELAY = 450

function targetOf(passage: PassageRef): TourTarget {
  return {
    bookId: passage.bookId,
    chapterId: chapterIdOf(passage),
    verses: passage.verses,
  }
}

interface GroupPill {
  key: string
  label: string
  Icon: IconType
  firstStep: number
  reached: boolean
  active: boolean
  done: boolean
}

interface ItemDot {
  key: string
  label: string
  target: number
  accentDot: string
}

export default function GuidedTour({ onNavigate }: GuidedTourProps) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [selectedTour, setSelectedTour] = useState<TourId | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [furthestStep, setFurthestStep] = useState(0)
  const [seen, setSeen] = useState(true)
  const [voiceSheetOpen, setVoiceSheetOpen] = useState(false)
  /** Tour-picker cards start collapsed so both options fit at a glance. */
  const [expandedTourIds, setExpandedTourIds] = useState<Set<TourId>>(
    () => new Set(),
  )

  const narration = useTourNarration()
  const {
    enabled: speechOn,
    includePassage,
    rate: speechRate,
    voiceURI,
    stop: stopNarration,
  } = narration
  // Held in a ref so the narration effect keys off the settings, not identity.
  const speakRef = useRef(narration.speak)
  speakRef.current = narration.speak

  const headingRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  // Held in a ref so the navigation effect only reacts to step changes.
  const navigateRef = useRef(onNavigate)
  navigateRef.current = onNavigate

  useEffect(() => {
    setMounted(true)
    try {
      setSeen(localStorage.getItem(SEEN_KEY) === 'true')
    } catch {
      setSeen(true)
    }
  }, [])

  const isVoices = selectedTour === 'voices'
  const isMiracles = selectedTour === 'miracles'
  const lastStep = lastStepFor(selectedTour)

  const voicesStep: TourStep | null = isVoices ? TOUR_STEPS[stepIndex] : null
  const miracleStep: MiracleTourStep | null = isMiracles
    ? MIRACLE_STEPS[stepIndex]
    : null

  const momentIndex = voicesStep ? momentIndexOfStep(voicesStep) : null
  const moment = momentIndex !== null ? MOMENTS[momentIndex] : null
  const voice =
    voicesStep?.kind === 'voice'
      ? MOMENTS[voicesStep.momentIndex].voices[voicesStep.voiceIndex]
      : null

  const sectionIndex = miracleStep ? sectionIndexOfStep(miracleStep) : null
  const section = sectionIndex !== null ? TESTAMENT_SECTIONS[sectionIndex] : null
  const miracle =
    miracleStep?.kind === 'miracle'
      ? TESTAMENT_SECTIONS[miracleStep.sectionIndex].miracles[
          miracleStep.miracleIndex
        ]
      : null

  /* --- navigation ------------------------------------------------------- */

  const goTo = useCallback(
    (next: number) => {
      const max = lastStepFor(selectedTour)
      const clamped = Math.max(0, Math.min(max, next))
      setStepIndex(clamped)
      setFurthestStep((f) => Math.max(f, clamped))
      setMinimized(false)
      setVoiceSheetOpen(false)
    },
    [selectedTour],
  )

  const restart = useCallback(() => {
    setStepIndex(0)
    setFurthestStep(0)
  }, [])

  const start = useCallback(() => {
    // The launcher always opens on the tour picker, so a fresh choice is made
    // each time the overlay is opened from fully closed.
    setSelectedTour(null)
    setStepIndex(0)
    setFurthestStep(0)
    setExpandedTourIds(new Set())
    setOpen(true)
    setMinimized(false)
    setSeen(true)
    try {
      localStorage.setItem(SEEN_KEY, 'true')
    } catch {
      /* private mode — the tour still works, it just re-announces itself */
    }
  }, [])

  const selectTour = useCallback((id: TourId) => {
    setSelectedTour(id)
    setStepIndex(0)
    setFurthestStep(0)
    setVoiceSheetOpen(false)
  }, [])

  const toggleTourDetails = useCallback((id: TourId) => {
    setExpandedTourIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const backToSelector = useCallback(() => {
    setSelectedTour(null)
    setStepIndex(0)
    setFurthestStep(0)
    setExpandedTourIds(new Set())
    setVoiceSheetOpen(false)
    stopNarration()
  }, [stopNarration])

  const exit = useCallback(() => {
    setOpen(false)
    setMinimized(false)
    setSelectedTour(null)
    setStepIndex(0)
    setFurthestStep(0)
    setExpandedTourIds(new Set())
    setVoiceSheetOpen(false)
    stopNarration()
    navigateRef.current(null)
  }, [stopNarration])

  const skipGroup = useCallback(() => {
    if (isVoices && momentIndex !== null) {
      const next = firstStepOfMoment(momentIndex + 1)
      goTo(next === -1 ? lastStepFor('voices') : next)
    } else if (isMiracles && sectionIndex !== null) {
      const next = firstStepOfSection(sectionIndex + 1)
      goTo(next === -1 ? lastStepFor('miracles') : next)
    }
  }, [isVoices, isMiracles, momentIndex, sectionIndex, goTo])

  // Drive the reader behind the panel.
  useEffect(() => {
    if (!open) return
    const passage =
      isVoices && voicesStep
        ? passageOfStep(voicesStep)
        : isMiracles && miracleStep
          ? passageOfMiracleStep(miracleStep)
          : null
    navigateRef.current(passage ? targetOf(passage) : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stepIndex, selectedTour])

  /**
   * Publish the space the panel occupies so the page can keep the passage out
   * from under it. Two layouts, picked by how much room is left beside the
   * panel (kept in sync with the matching breakpoint in globals.css):
   *
   *  - wide enough → the panel docks to the side and the page pads its right
   *    edge, so no line of text runs underneath it.
   *  - otherwise → the panel is a bottom sheet and the reader scrolls the
   *    highlighted verses into the space above it.
   */
  useEffect(() => {
    const root = document.documentElement
    const clear = () => {
      root.style.setProperty('--reader-safe-bottom', '0px')
      root.style.setProperty('--reader-safe-right', '0px')
    }

    if (!open || minimized) {
      clear()
      return clear
    }

    const update = () => {
      const el = panelRef.current
      if (!el) return clear()
      const rect = el.getBoundingClientRect()
      const columnLeft = window.innerWidth - rect.width - PANEL_GUTTER

      if (columnLeft >= MIN_READING_COLUMN) {
        root.style.setProperty('--reader-safe-bottom', '0px')
        root.style.setProperty(
          '--reader-safe-right',
          `${Math.round(window.innerWidth - rect.left + 16)}px`,
        )
      } else {
        // On a very short window the sheet fills the screen and there is no
        // strip left to scroll into; leave the reservation at zero so the
        // passage still centres normally (Minimize is the way to read there).
        const roomAbove = rect.top
        root.style.setProperty(
          '--reader-safe-bottom',
          roomAbove >= MIN_VISIBLE_STRIP
            ? `${Math.round(window.innerHeight - rect.top)}px`
            : '0px',
        )
        root.style.setProperty('--reader-safe-right', '0px')
      }
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
      clear()
    }
  }, [open, minimized, stepIndex, voiceSheetOpen, selectedTour])

  /**
   * Speech mode: when it is on, each step is read as you arrive at it, and
   * changing a voice or speed re-reads the current step so the choice can be
   * heard straight away. The passage is pulled from the reader after it has had
   * a moment to open the chapter.
   */
  useEffect(() => {
    if (!open || !speechOn || selectedTour === null) return

    const timer = window.setTimeout(() => {
      const segments =
        isVoices && voicesStep
          ? narrationForStep(voicesStep)
          : isMiracles && miracleStep
            ? narrationForMiracleStep(miracleStep)
            : []

      if (includePassage) {
        const verses = Array.from(
          document.querySelectorAll<HTMLElement>('.verse-spotlight'),
        )
          .map((el) =>
            el.innerText.replace(/\[\d+\]/g, ' ').replace(/\s+/g, ' ').trim(),
          )
          .filter(Boolean)

        if (verses.length) segments.push('The passage.', ...verses)
      }

      speakRef.current(segments)
    }, NARRATION_DELAY)

    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, speechOn, includePassage, speechRate, voiceURI, stepIndex, selectedTour])

  // Move focus to the new step's heading so screen readers follow along.
  useEffect(() => {
    if (!open || minimized) return
    headingRef.current?.focus()
    bodyRef.current?.scrollTo({ top: 0 })
  }, [open, minimized, stepIndex, selectedTour])

  // Keyboard: arrows to move, Escape to leave.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const tag = el?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === 'Escape') {
        e.preventDefault()
        exit()
      } else if (e.key === 'ArrowRight' && selectedTour !== null && stepIndex < lastStep) {
        e.preventDefault()
        goTo(stepIndex + 1)
      } else if (e.key === 'ArrowLeft' && selectedTour !== null) {
        e.preventDefault()
        if (stepIndex === 0) backToSelector()
        else goTo(stepIndex - 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, stepIndex, selectedTour, lastStep, goTo, exit, backToSelector])

  const progress = lastStep > 0 ? (stepIndex / lastStep) * 100 : 0

  const stepLabel = useMemo(() => {
    if (selectedTour === null) return 'Choose a tour'
    if (isVoices && voicesStep) {
      switch (voicesStep.kind) {
        case 'welcome':
          return 'Welcome'
        case 'moment-intro':
          return MOMENTS[voicesStep.momentIndex].title
        case 'voice':
          return `${MOMENTS[voicesStep.momentIndex].voices[voicesStep.voiceIndex].name} · ${
            MOMENTS[voicesStep.momentIndex].title
          }`
        case 'synthesis':
          return `${MOMENTS[voicesStep.momentIndex].title} · together`
        case 'outro':
          return 'Closing'
      }
    }
    if (isMiracles && miracleStep) {
      switch (miracleStep.kind) {
        case 'welcome':
          return 'Welcome'
        case 'section-intro':
          return TESTAMENT_SECTIONS[miracleStep.sectionIndex].title
        case 'miracle':
          return TESTAMENT_SECTIONS[miracleStep.sectionIndex].miracles[
            miracleStep.miracleIndex
          ].title
        case 'section-synthesis':
          return `${TESTAMENT_SECTIONS[miracleStep.sectionIndex].title} · together`
        case 'outro':
          return 'Closing'
      }
    }
    return ''
  }, [selectedTour, isVoices, isMiracles, voicesStep, miracleStep])

  const groupPills: GroupPill[] = isVoices
    ? MOMENTS.map((m, i) => {
        const first = firstStepOfMoment(i)
        return {
          key: m.id,
          label: m.title.replace('The ', ''),
          Icon: MOMENT_ICONS[m.id],
          firstStep: first,
          reached: furthestStep >= first,
          active: momentIndex === i,
          done:
            furthestStep > first + m.voices.length + 1 ||
            (momentIndex !== null && momentIndex > i) ||
            voicesStep?.kind === 'outro',
        }
      })
    : isMiracles
      ? TESTAMENT_SECTIONS.map((s, i) => {
          const first = firstStepOfSection(i)
          return {
            key: s.id,
            label: s.title.replace(' Wonders', ''),
            Icon: TESTAMENT_ICONS[s.id],
            firstStep: first,
            reached: furthestStep >= first,
            active: sectionIndex === i,
            done:
              furthestStep > first + s.miracles.length + 1 ||
              (sectionIndex !== null && sectionIndex > i) ||
              miracleStep?.kind === 'outro',
          }
        })
      : []

  const itemDots: ItemDot[] =
    isVoices && moment && momentIndex !== null
      ? moment.voices.map((v, i) => ({
          key: v.id,
          label: `Go to ${v.name}'s account`,
          target: firstStepOfMoment(momentIndex) + 1 + i,
          accentDot: VOICE_ACCENTS[v.id].dot,
        }))
      : isMiracles && section && sectionIndex !== null
        ? section.miracles.map((m, i) => ({
            key: m.id,
            label: `Go to ${m.title}`,
            target: firstStepOfSection(sectionIndex) + 1 + i,
            accentDot: TESTAMENT_ACCENTS[section.id].dot,
          }))
        : []

  if (!mounted) return null

  /* --- launcher --------------------------------------------------------- */

  if (!open) {
    return createPortal(
      <div className="tour-anchor" style={{ zIndex: 55 }}>
        <button
          type="button"
          onClick={start}
          data-read-aloud-ignore
          className="tour-fab group pointer-events-auto flex min-h-14 items-center gap-2.5 rounded-full px-4 py-3 shadow-lg transition-all hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 sm:px-5"
          aria-label="Start a guided tour"
        >
          {!seen && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-3 w-3"
              aria-hidden="true"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400" />
            </span>
          )}
          <Compass
            className="h-5 w-5 shrink-0 text-beige-50 transition-transform group-hover:rotate-12 dark:text-brown-50"
            aria-hidden
          />
          <span className="font-sans text-sm font-semibold text-beige-50 dark:text-brown-50">
            Guided tour
          </span>
        </button>
      </div>,
      document.body,
    )
  }

  /* --- minimized bar ---------------------------------------------------- */

  if (minimized) {
    return createPortal(
      <div className="tour-anchor" style={{ zIndex: 55 }}>
        <div
          data-read-aloud-ignore
          className="tour-panel-shell pointer-events-auto flex items-center gap-2 rounded-full py-2 pl-4 pr-2 shadow-lg"
        >
          {speechOn && (
            <Volume2
              className={`h-3.5 w-3.5 shrink-0 text-beige-600 dark:text-brown-400 ${
                narration.speaking ? 'tour-speaking' : ''
              }`}
              aria-label="Narration is on"
            />
          )}
          <span className="font-sans text-xs font-medium text-beige-800 dark:text-brown-100">
            {stepLabel}
          </span>
          <button
            type="button"
            onClick={() => setMinimized(false)}
            className="tour-icon-btn"
            aria-label="Expand the guided tour"
          >
            <Maximize2 className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={exit}
            className="tour-icon-btn"
            aria-label="Exit the guided tour"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>,
      document.body,
    )
  }

  /* --- panel ------------------------------------------------------------ */

  const activeTitle =
    TOUR_CATALOG.find((t) => t.id === selectedTour)?.title ?? 'choose an experience'

  return createPortal(
    <div className="tour-anchor" style={{ zIndex: 55 }}>
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-label={`Guided tour: ${activeTitle}`}
        data-read-aloud-ignore
        data-voice-sheet={voiceSheetOpen ? 'true' : undefined}
        className="tour-panel-shell tour-panel pointer-events-auto flex flex-col overflow-hidden rounded-2xl shadow-2xl"
      >
        {/* header */}
        <div className="shrink-0 border-b border-beige-300/70 px-4 pt-3 pb-2 dark:border-brown-700/70">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-wider text-beige-600 dark:text-brown-400">
                Guided tour
              </p>
              <p className="truncate font-sans text-xs text-beige-500 dark:text-brown-500">
                {selectedTour === null
                  ? 'Pick a tour to begin'
                  : `Step ${stepIndex + 1} of ${lastStep + 1} · ${stepLabel}`}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {selectedTour !== null && narration.supported && (
                <div className="tour-speech-control flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !speechOn
                      narration.setEnabled(next)
                      if (!next) setVoiceSheetOpen(false)
                    }}
                    className={`tour-icon-btn ${speechOn ? 'tour-icon-btn-on' : ''}`}
                    aria-pressed={speechOn}
                    aria-label={
                      speechOn ? 'Turn narration off' : 'Read the tour aloud'
                    }
                  >
                    {speechOn ? (
                      <Volume2
                        className={`h-4 w-4 ${narration.speaking ? 'tour-speaking' : ''}`}
                        aria-hidden
                      />
                    ) : (
                      <VolumeX className="h-4 w-4" aria-hidden />
                    )}
                  </button>

                  {/* Voice and speed stay hidden until narration is actually on. */}
                  {speechOn && (
                    <button
                      type="button"
                      onClick={() => setVoiceSheetOpen((v) => !v)}
                      className="tour-icon-btn tour-icon-btn-slim"
                      aria-expanded={voiceSheetOpen}
                      aria-label="Voice and speed"
                    >
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${voiceSheetOpen ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </button>
                  )}
                </div>
              )}

              {selectedTour !== null && (
                <button
                  type="button"
                  onClick={() => setMinimized(true)}
                  className="tour-icon-btn"
                  aria-label="Minimize the tour and read the passage"
                >
                  <Minimize2 className="h-4 w-4" aria-hidden />
                </button>
              )}
              <button
                type="button"
                onClick={exit}
                className="tour-icon-btn"
                aria-label="Exit the guided tour"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          {/* group pills */}
          {selectedTour !== null && groupPills.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5">
              {groupPills.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  disabled={!g.reached}
                  onClick={() => goTo(g.firstStep)}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 font-sans text-[11px] font-medium transition-colors ${
                    g.active
                      ? 'bg-beige-800 text-beige-50 dark:bg-brown-200 dark:text-brown-950'
                      : g.reached
                        ? 'bg-beige-200/70 text-beige-800 hover:bg-beige-300/70 dark:bg-brown-800/70 dark:text-brown-100 dark:hover:bg-brown-700/70'
                        : 'bg-beige-100/50 text-beige-400 dark:bg-brown-900/40 dark:text-brown-600'
                  }`}
                  aria-current={g.active ? 'step' : undefined}
                  aria-label={
                    g.reached ? `Go to ${g.label}` : `${g.label} — not reached yet`
                  }
                >
                  {g.done && !g.active ? (
                    <Check className="h-3 w-3 shrink-0" aria-hidden />
                  ) : (
                    <g.Icon className="h-3 w-3 shrink-0" aria-hidden />
                  )}
                  <span className="truncate">{g.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* progress */}
          {selectedTour !== null && (
            <div
              className="mt-2 h-1 overflow-hidden rounded-full bg-beige-200 dark:bg-brown-800"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Tour progress"
            >
              <div
                className="tour-progress-bar h-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* body — a flex column so the scroll area keeps a definite height and
            the voice sheet has something to absolutely fill */}
        <div className="relative flex min-h-0 flex-1 flex-col">
          {voiceSheetOpen && (
            <div className="tour-voice-sheet tour-panel-body absolute inset-0 z-10 overflow-y-auto px-4 py-4">
              <div className="mb-3 flex items-center gap-2">
                <Languages
                  className="h-4 w-4 text-beige-700 dark:text-brown-300"
                  aria-hidden
                />
                <h2 className="font-display text-base font-bold text-beige-900 dark:text-brown-50">
                  Narration
                </h2>
              </div>

              {narration.voices.length === 0 ? (
                <p className="font-sans text-xs text-beige-600 dark:text-brown-400">
                  Your browser hasn&rsquo;t offered any voices yet. Try again in a
                  moment.
                </p>
              ) : (
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-wide text-beige-600 dark:text-brown-400">
                      Voice
                    </span>
                    <select
                      value={voiceURI}
                      onChange={(e) => narration.setVoiceURI(e.target.value)}
                      className="min-h-11 w-full rounded-xl border border-beige-300 bg-white px-3 font-sans text-xs text-beige-900 focus:border-beige-600 focus:outline-none focus:ring-2 focus:ring-beige-400/30 dark:border-brown-600 dark:bg-brown-800 dark:text-brown-50 dark:focus:border-brown-400"
                    >
                      {groupVoicesByLanguage(narration.voices).map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.voices.map((v) => (
                            <option key={v.voiceURI} value={v.voiceURI}>
                              {formatVoiceLabel(v)}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <span className="mt-1.5 block font-sans text-[10px] leading-relaxed text-beige-500 dark:text-brown-500">
                      Grouped by language, from the voices installed on your
                      device. The tour text stays in English, so another
                      language&rsquo;s voice will read it in that accent.
                    </span>
                  </label>

                  <div>
                    <span className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-wide text-beige-600 dark:text-brown-400">
                      Speed
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SPEEDS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => narration.setRate(s)}
                          aria-pressed={speechRate === s}
                          className={`min-h-9 min-w-[3rem] rounded-lg px-2 font-sans text-xs font-medium transition-colors ${
                            speechRate === s
                              ? 'bg-beige-800 text-beige-50 dark:bg-brown-200 dark:text-brown-950'
                              : 'bg-beige-100 text-beige-800 hover:bg-beige-200 dark:bg-brown-800 dark:text-brown-100 dark:hover:bg-brown-700'
                          }`}
                        >
                          {s}&times;
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={includePassage}
                      onChange={(e) =>
                        narration.setIncludePassage(e.target.checked)
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 accent-beige-700 dark:accent-brown-300"
                    />
                    <span className="font-sans text-xs leading-snug text-beige-800 dark:text-brown-200">
                      Read the highlighted passage too
                      <span className="mt-0.5 block text-[10px] text-beige-500 dark:text-brown-500">
                        Adds the spotlit verses after each perspective.
                      </span>
                    </span>
                  </label>

                  <div className="flex items-center gap-2 border-t border-beige-200 pt-3 dark:border-brown-700">
                    <button
                      type="button"
                      onClick={() => {
                        const segments =
                          isVoices && voicesStep
                            ? narrationForStep(voicesStep)
                            : isMiracles && miracleStep
                              ? narrationForMiracleStep(miracleStep)
                              : []
                        speakRef.current(segments)
                      }}
                      className="flex min-h-10 items-center gap-1.5 rounded-xl px-3 font-sans text-xs btn-surface hover:shadow-md"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                      Replay step
                    </button>
                    <div className="flex-1" />
                    <button
                      type="button"
                      onClick={() => setVoiceSheetOpen(false)}
                      className="tour-next-btn flex min-h-10 items-center rounded-xl px-4 font-sans text-xs font-semibold shadow-md"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div
            ref={bodyRef}
            className="tour-panel-body min-h-0 flex-1 overflow-y-auto px-4 py-4"
          >
            {/* ===================================================================
                Tour selector — shown until a tour is chosen
                =================================================================== */}
            {selectedTour === null && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-beige-700 dark:text-brown-300">
                  <Compass className="h-5 w-5" aria-hidden />
                  <span className="font-sans text-xs font-medium uppercase tracking-wide">
                    Choose your walk
                  </span>
                </div>
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="font-display text-2xl font-bold text-beige-900 outline-none dark:text-brown-50"
                >
                  Guided Tours
                </h2>
                <p className="font-serif text-sm leading-relaxed text-beige-800 dark:text-brown-200">
                  Two ways to walk through this reader with a passage open beside
                  you. Pick one to begin — you can always come back and try the
                  other.
                </p>

                <div className="space-y-3">
                  {TOUR_CATALOG.map((t) => {
                    const Icon = TOUR_CARD_ICONS[t.id]
                    const expanded = expandedTourIds.has(t.id)
                    const detailsId = `tour-details-${t.id}`
                    const badgeClass =
                      t.id === 'miracles'
                        ? 'bg-rose-100 text-rose-900 ring-2 ring-rose-500/40 dark:bg-rose-950/60 dark:text-rose-100 dark:ring-rose-400/40'
                        : 'bg-beige-200/80 text-beige-800 ring-2 ring-beige-400/40 dark:bg-brown-800/80 dark:text-brown-100 dark:ring-brown-500/40'
                    return (
                      <div
                        key={t.id}
                        className="rounded-2xl border border-beige-300/60 bg-beige-50/60 p-3.5 dark:border-brown-700/60 dark:bg-brown-900/40"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${badgeClass}`}
                            aria-hidden
                          >
                            <Icon className="h-5 w-5" aria-hidden />
                          </span>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-display text-lg font-bold leading-tight text-beige-900 dark:text-brown-50">
                              {t.title}
                            </h3>
                            <p className="mt-0.5 font-sans text-xs text-beige-600 dark:text-brown-400">
                              {t.subtitle}
                            </p>
                            <p className="mt-1.5 font-sans text-[11px] font-medium text-beige-700 dark:text-brown-300">
                              {t.duration}
                            </p>
                          </div>
                        </div>

                        <div
                          id={detailsId}
                          hidden={!expanded}
                          className="mt-3 border-t border-beige-300/50 pt-3 dark:border-brown-700/50"
                        >
                          <p className="font-serif text-[13px] leading-relaxed text-beige-800 dark:text-brown-200">
                            {t.description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {t.facts.map((f) => (
                              <span
                                key={f}
                                className="inline-flex items-center rounded-full bg-beige-200/70 px-2 py-0.5 font-sans text-[10px] font-medium text-beige-700 dark:bg-brown-800/70 dark:text-brown-300"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleTourDetails(t.id)}
                            aria-expanded={expanded}
                            aria-controls={detailsId}
                            className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl px-3 font-sans text-xs font-medium btn-surface hover:shadow-md"
                          >
                            <ChevronDown
                              className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
                              aria-hidden
                            />
                            {expanded ? 'Hide details' : 'Details'}
                          </button>
                          <button
                            type="button"
                            onClick={() => selectTour(t.id)}
                            className="tour-next-btn flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl px-3 font-sans text-xs font-semibold shadow-md transition-all hover:shadow-lg"
                          >
                            Begin
                            <ArrowRight className="h-4 w-4" aria-hidden />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ===================================================================
                "One Story, Five Voices" — unchanged from the original tour
                =================================================================== */}

            {isVoices && voicesStep?.kind === 'welcome' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-beige-700 dark:text-brown-300">
                  <Sparkles className="h-5 w-5" aria-hidden />
                  <span className="font-sans text-xs font-medium uppercase tracking-wide">
                    {TOUR_INTRO.duration}
                  </span>
                </div>
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="font-display text-2xl font-bold text-beige-900 outline-none dark:text-brown-50"
                >
                  {TOUR_INTRO.title}
                </h2>
                <p className="font-sans text-sm text-beige-600 dark:text-brown-400">
                  {TOUR_INTRO.subtitle}
                </p>
                {TOUR_INTRO.body.map((p, i) => (
                  <p
                    key={i}
                    className="font-serif text-sm leading-relaxed text-beige-800 dark:text-brown-200"
                  >
                    {p}
                  </p>
                ))}
                <div className="rounded-xl border border-beige-300/70 bg-beige-100/60 p-3 dark:border-brown-700/70 dark:bg-brown-900/40">
                  <p className="mb-2 flex items-center gap-1.5 font-sans text-xs font-semibold text-beige-700 dark:text-brown-300">
                    <Users className="h-3.5 w-3.5" aria-hidden />
                    The five voices
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {MOMENTS[0].voices.map((v) => (
                      <span
                        key={v.id}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-xs font-medium ${VOICE_ACCENTS[v.id].chip}`}
                      >
                        {v.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isVoices && voicesStep?.kind === 'moment-intro' && moment && (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-beige-200/80 text-beige-800 dark:bg-brown-800/80 dark:text-brown-100">
                    {(() => {
                      const Icon = MOMENT_ICONS[moment.id]
                      return <Icon className="h-5 w-5" aria-hidden />
                    })()}
                  </span>
                  <div>
                    <h2
                      ref={headingRef}
                      tabIndex={-1}
                      className="font-display text-xl font-bold text-beige-900 outline-none dark:text-brown-50"
                    >
                      {moment.title}
                    </h2>
                    <p className="font-sans text-xs text-beige-600 dark:text-brown-400">
                      {moment.subtitle}
                    </p>
                  </div>
                </div>

                <p className="font-serif text-sm leading-relaxed text-beige-800 dark:text-brown-200">
                  {moment.intro}
                </p>

                <ol className="space-y-1.5">
                  {moment.voices.map((v, i) => (
                    <li key={v.id}>
                      <button
                        type="button"
                        onClick={() =>
                          goTo(firstStepOfMoment(voicesStep.momentIndex) + 1 + i)
                        }
                        className="flex w-full items-center gap-2.5 rounded-lg border border-beige-300/60 bg-beige-50/60 px-2.5 py-2 text-left transition-colors hover:border-beige-400 hover:bg-beige-100 dark:border-brown-700/60 dark:bg-brown-900/40 dark:hover:border-brown-500 dark:hover:bg-brown-800/60"
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-sans text-xs font-bold ring-1 ${VOICE_ACCENTS[v.id].badge}`}
                        >
                          {v.name.charAt(0)}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-sans text-xs font-semibold text-beige-900 dark:text-brown-50">
                            {v.name}
                          </span>
                          <span className="block truncate font-sans text-[11px] text-beige-600 dark:text-brown-400">
                            {v.passage.label}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {isVoices && voicesStep?.kind === 'voice' && voice && moment && (
              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold ring-2 ${VOICE_ACCENTS[voice.id].badge}`}
                    aria-hidden
                  >
                    {voice.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <h2
                      ref={headingRef}
                      tabIndex={-1}
                      className="font-display text-xl font-bold text-beige-900 outline-none dark:text-brown-50"
                    >
                      {voice.name}
                    </h2>
                    <p className="font-sans text-xs leading-snug text-beige-600 dark:text-brown-400">
                      {voice.role}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-sans text-[11px] font-medium ${VOICE_ACCENTS[voice.id].chip}`}
                  >
                    <BookOpen className="h-3 w-3" aria-hidden />
                    {voice.passage.label}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-beige-200/70 px-2.5 py-1 font-sans text-[11px] text-beige-700 dark:bg-brown-800/70 dark:text-brown-300">
                    written {voice.written}
                  </span>
                </div>

                <blockquote
                  className={`border-l-4 pl-3 ${VOICE_ACCENTS[voice.id].rule}`}
                >
                  <Quote
                    className="mb-1 h-3.5 w-3.5 text-beige-400 dark:text-brown-500"
                    aria-hidden
                  />
                  <p className="font-serif text-[15px] italic leading-relaxed text-beige-900 dark:text-brown-100">
                    {voice.quote}
                  </p>
                  <cite className="mt-1.5 block font-sans text-[11px] not-italic text-beige-600 dark:text-brown-400">
                    {voice.quoteRef}
                  </cite>
                </blockquote>

                <div>
                  <p className="mb-1.5 font-sans text-xs font-semibold uppercase tracking-wide text-beige-700 dark:text-brown-300">
                    What only {voice.name} gives you
                  </p>
                  <ul className="space-y-1.5">
                    {voice.distinctives.map((d, i) => (
                      <li
                        key={i}
                        className="flex gap-2 font-serif text-[13px] leading-relaxed text-beige-800 dark:text-brown-200"
                      >
                        <span
                          className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${VOICE_ACCENTS[voice.id].dot}`}
                          aria-hidden
                        />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="rounded-xl bg-beige-100/70 p-3 font-serif text-[13px] leading-relaxed text-beige-800 dark:bg-brown-900/50 dark:text-brown-200">
                  {voice.lens}
                </p>

                {voice.alsoSee && voice.alsoSee.length > 0 && (
                  <div>
                    <p className="mb-1.5 font-sans text-[11px] font-semibold uppercase tracking-wide text-beige-600 dark:text-brown-400">
                      Also read
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {voice.alsoSee.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => navigateRef.current(targetOf(p))}
                          className="inline-flex items-center gap-1 rounded-full border border-beige-300 bg-beige-50/70 px-2.5 py-1 font-sans text-[11px] text-beige-800 transition-colors hover:border-beige-500 hover:bg-beige-100 dark:border-brown-700 dark:bg-brown-900/50 dark:text-brown-200 dark:hover:border-brown-500"
                        >
                          <BookOpen className="h-3 w-3" aria-hidden />
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isVoices && voicesStep?.kind === 'synthesis' && moment && (
              <div className="space-y-3.5">
                <div className="flex items-center gap-2">
                  <Users
                    className="h-5 w-5 text-beige-700 dark:text-brown-300"
                    aria-hidden
                  />
                  <h2
                    ref={headingRef}
                    tabIndex={-1}
                    className="font-display text-lg font-bold leading-tight text-beige-900 outline-none dark:text-brown-50"
                  >
                    {moment.synthesis.heading}
                  </h2>
                </div>

                <div className="rounded-xl border border-emerald-600/25 bg-emerald-50/60 p-3 dark:border-emerald-400/20 dark:bg-emerald-950/25">
                  <p className="mb-1.5 font-sans text-[11px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
                    All five hold this in common
                  </p>
                  <ul className="space-y-1">
                    {moment.synthesis.shared.map((s, i) => (
                      <li
                        key={i}
                        className="flex gap-2 font-serif text-[13px] leading-relaxed text-beige-800 dark:text-brown-100"
                      >
                        <Check
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-400"
                          aria-hidden
                        />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="mb-1 font-sans text-[11px] font-semibold uppercase tracking-wide text-beige-600 dark:text-brown-400">
                    Where they part ways
                  </p>
                  <p className="font-serif text-[13px] leading-relaxed text-beige-800 dark:text-brown-200">
                    {moment.synthesis.differences}
                  </p>
                </div>

                <div>
                  <p className="mb-1 font-sans text-[11px] font-semibold uppercase tracking-wide text-beige-600 dark:text-brown-400">
                    And why that matters
                  </p>
                  <p className="font-serif text-[13px] leading-relaxed text-beige-800 dark:text-brown-200">
                    {moment.synthesis.reflection}
                  </p>
                </div>

                <blockquote className="rounded-xl bg-beige-100/70 p-3 dark:bg-brown-900/50">
                  <p className="font-serif text-[14px] italic leading-relaxed text-beige-900 dark:text-brown-100">
                    {moment.synthesis.quote}
                  </p>
                  <cite className="mt-1.5 block font-sans text-[11px] not-italic text-beige-600 dark:text-brown-400">
                    {moment.synthesis.passage.label} — highlighted in the reader
                  </cite>
                </blockquote>
              </div>
            )}

            {isVoices && voicesStep?.kind === 'outro' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles
                    className="h-5 w-5 text-beige-700 dark:text-brown-300"
                    aria-hidden
                  />
                  <h2
                    ref={headingRef}
                    tabIndex={-1}
                    className="font-display text-xl font-bold text-beige-900 outline-none dark:text-brown-50"
                  >
                    {TOUR_OUTRO.title}
                  </h2>
                </div>

                {TOUR_OUTRO.body.map((p, i) => (
                  <p
                    key={i}
                    className="font-serif text-sm leading-relaxed text-beige-800 dark:text-brown-200"
                  >
                    {p}
                  </p>
                ))}

                <blockquote className="rounded-xl bg-beige-100/70 p-3 dark:bg-brown-900/50">
                  <p className="font-serif text-[15px] italic leading-relaxed text-beige-900 dark:text-brown-100">
                    {TOUR_OUTRO.quote}
                  </p>
                  <cite className="mt-1.5 block font-sans text-[11px] not-italic text-beige-600 dark:text-brown-400">
                    {TOUR_OUTRO.passage.label}
                  </cite>
                </blockquote>

                <div>
                  <p className="mb-1.5 font-sans text-[11px] font-semibold uppercase tracking-wide text-beige-600 dark:text-brown-400">
                    Carry on reading
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {TOUR_OUTRO.furtherReading.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => navigateRef.current(targetOf(p))}
                        className="inline-flex items-center gap-1 rounded-full border border-beige-300 bg-beige-50/70 px-2.5 py-1 font-sans text-[11px] text-beige-800 transition-colors hover:border-beige-500 hover:bg-beige-100 dark:border-brown-700 dark:bg-brown-900/50 dark:text-brown-200 dark:hover:border-brown-500"
                      >
                        <BookOpen className="h-3 w-3" aria-hidden />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <button
                    type="button"
                    onClick={restart}
                    className="font-sans text-xs text-beige-600 underline underline-offset-2 transition-colors hover:text-beige-900 dark:text-brown-400 dark:hover:text-brown-100"
                  >
                    Walk through it again
                  </button>
                  <button
                    type="button"
                    onClick={backToSelector}
                    className="font-sans text-xs text-beige-600 underline underline-offset-2 transition-colors hover:text-beige-900 dark:text-brown-400 dark:hover:text-brown-100"
                  >
                    Try the other tour
                  </button>
                </div>
              </div>
            )}

            {/* ===================================================================
                "Wonders and Hope" — the miracles tour
                =================================================================== */}

            {isMiracles && miracleStep?.kind === 'welcome' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-beige-700 dark:text-brown-300">
                  <Sparkles className="h-5 w-5" aria-hidden />
                  <span className="font-sans text-xs font-medium uppercase tracking-wide">
                    {MIRACLE_INTRO.duration}
                  </span>
                </div>
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="font-display text-2xl font-bold text-beige-900 outline-none dark:text-brown-50"
                >
                  {MIRACLE_INTRO.title}
                </h2>
                <p className="font-sans text-sm text-beige-600 dark:text-brown-400">
                  {MIRACLE_INTRO.subtitle}
                </p>
                {MIRACLE_INTRO.body.map((p, i) => (
                  <p
                    key={i}
                    className="font-serif text-sm leading-relaxed text-beige-800 dark:text-brown-200"
                  >
                    {p}
                  </p>
                ))}
                <div className="rounded-xl border border-beige-300/70 bg-beige-100/60 p-3 dark:border-brown-700/70 dark:bg-brown-900/40">
                  <p className="mb-2 flex items-center gap-1.5 font-sans text-xs font-semibold text-beige-700 dark:text-brown-300">
                    <LifeBuoy className="h-3.5 w-3.5" aria-hidden />
                    Two testaments, fourteen wonders
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {TESTAMENT_SECTIONS.map((s) => (
                      <span
                        key={s.id}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-xs font-medium ${TESTAMENT_ACCENTS[s.id].chip}`}
                      >
                        {s.title.replace(' Wonders', '')} ({s.miracles.length})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isMiracles && miracleStep?.kind === 'section-intro' && section && (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-beige-200/80 text-beige-800 dark:bg-brown-800/80 dark:text-brown-100">
                    {(() => {
                      const Icon = TESTAMENT_ICONS[section.id]
                      return <Icon className="h-5 w-5" aria-hidden />
                    })()}
                  </span>
                  <div>
                    <h2
                      ref={headingRef}
                      tabIndex={-1}
                      className="font-display text-xl font-bold text-beige-900 outline-none dark:text-brown-50"
                    >
                      {section.title}
                    </h2>
                    <p className="font-sans text-xs text-beige-600 dark:text-brown-400">
                      {section.subtitle}
                    </p>
                  </div>
                </div>

                <p className="font-serif text-sm leading-relaxed text-beige-800 dark:text-brown-200">
                  {section.intro}
                </p>

                <ol className="space-y-1.5">
                  {section.miracles.map((m, i) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() =>
                          goTo(firstStepOfSection(miracleStep.sectionIndex) + 1 + i)
                        }
                        className="flex w-full items-center gap-2.5 rounded-lg border border-beige-300/60 bg-beige-50/60 px-2.5 py-2 text-left transition-colors hover:border-beige-400 hover:bg-beige-100 dark:border-brown-700/60 dark:bg-brown-900/40 dark:hover:border-brown-500 dark:hover:bg-brown-800/60"
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-sans text-xs font-bold ring-1 ${TESTAMENT_ACCENTS[section.id].badge}`}
                        >
                          {i + 1}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-sans text-xs font-semibold text-beige-900 dark:text-brown-50">
                            {m.title}
                          </span>
                          <span className="block truncate font-sans text-[11px] text-beige-600 dark:text-brown-400">
                            {m.passage.label}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {isMiracles && miracleStep?.kind === 'miracle' && miracle && section && (
              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-2 ${TESTAMENT_ACCENTS[section.id].badge}`}
                    aria-hidden
                  >
                    {(() => {
                      const Icon = MIRACLE_ICONS[miracle.id]
                      return <Icon className="h-5 w-5" aria-hidden />
                    })()}
                  </span>
                  <div className="min-w-0">
                    <h2
                      ref={headingRef}
                      tabIndex={-1}
                      className="font-display text-xl font-bold text-beige-900 outline-none dark:text-brown-50"
                    >
                      {miracle.title}
                    </h2>
                    <p className="flex items-center gap-1 font-sans text-xs leading-snug text-beige-600 dark:text-brown-400">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                      {miracle.location}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-sans text-[11px] font-medium ${TESTAMENT_ACCENTS[section.id].chip}`}
                  >
                    <BookOpen className="h-3 w-3" aria-hidden />
                    {miracle.passage.label}
                  </span>
                </div>

                <blockquote
                  className={`border-l-4 pl-3 ${TESTAMENT_ACCENTS[section.id].rule}`}
                >
                  <Quote
                    className="mb-1 h-3.5 w-3.5 text-beige-400 dark:text-brown-500"
                    aria-hidden
                  />
                  <p className="font-serif text-[15px] italic leading-relaxed text-beige-900 dark:text-brown-100">
                    {miracle.quote}
                  </p>
                  <cite className="mt-1.5 block font-sans text-[11px] not-italic text-beige-600 dark:text-brown-400">
                    {miracle.quoteRef}
                  </cite>
                </blockquote>

                <div>
                  <p className="mb-1.5 font-sans text-xs font-semibold uppercase tracking-wide text-beige-700 dark:text-brown-300">
                    Notice
                  </p>
                  <ul className="space-y-1.5">
                    {miracle.details.map((d, i) => (
                      <li
                        key={i}
                        className="flex gap-2 font-serif text-[13px] leading-relaxed text-beige-800 dark:text-brown-200"
                      >
                        <span
                          className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${TESTAMENT_ACCENTS[section.id].dot}`}
                          aria-hidden
                        />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="rounded-xl bg-beige-100/70 p-3 font-serif text-[13px] leading-relaxed text-beige-800 dark:bg-brown-900/50 dark:text-brown-200">
                  {miracle.whatHappened}
                </p>

                <p className="rounded-xl bg-beige-100/70 p-3 font-serif text-[13px] leading-relaxed text-beige-800 dark:bg-brown-900/50 dark:text-brown-200">
                  {miracle.hopeMeaning}
                </p>

                {miracle.alsoSee && miracle.alsoSee.length > 0 && (
                  <div>
                    <p className="mb-1.5 font-sans text-[11px] font-semibold uppercase tracking-wide text-beige-600 dark:text-brown-400">
                      Also read
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {miracle.alsoSee.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => navigateRef.current(targetOf(p))}
                          className="inline-flex items-center gap-1 rounded-full border border-beige-300 bg-beige-50/70 px-2.5 py-1 font-sans text-[11px] text-beige-800 transition-colors hover:border-beige-500 hover:bg-beige-100 dark:border-brown-700 dark:bg-brown-900/50 dark:text-brown-200 dark:hover:border-brown-500"
                        >
                          <BookOpen className="h-3 w-3" aria-hidden />
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-rose-500/25 bg-rose-50/50 p-3 dark:border-rose-400/20 dark:bg-rose-950/20">
                  <p className="mb-1 flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-wide text-rose-800 dark:text-rose-200">
                    <MessageCircleQuestionMark className="h-3.5 w-3.5" aria-hidden />
                    Something to consider
                  </p>
                  <p className="font-serif text-[13px] italic leading-relaxed text-beige-900 dark:text-brown-100">
                    {miracle.reflectionQuestion}
                  </p>
                </div>
              </div>
            )}

            {isMiracles &&
              miracleStep?.kind === 'section-synthesis' &&
              section && (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      className="h-5 w-5 text-beige-700 dark:text-brown-300"
                      aria-hidden
                    />
                    <h2
                      ref={headingRef}
                      tabIndex={-1}
                      className="font-display text-lg font-bold leading-tight text-beige-900 outline-none dark:text-brown-50"
                    >
                      {section.synthesis.heading}
                    </h2>
                  </div>

                  <div className="rounded-xl border border-emerald-600/25 bg-emerald-50/60 p-3 dark:border-emerald-400/20 dark:bg-emerald-950/25">
                    <p className="mb-1.5 font-sans text-[11px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
                      The pattern
                    </p>
                    <ul className="space-y-1">
                      {section.synthesis.patterns.map((s, i) => (
                        <li
                          key={i}
                          className="flex gap-2 font-serif text-[13px] leading-relaxed text-beige-800 dark:text-brown-100"
                        >
                          <Check
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-400"
                            aria-hidden
                          />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="mb-1 font-sans text-[11px] font-semibold uppercase tracking-wide text-beige-600 dark:text-brown-400">
                      And why that matters
                    </p>
                    <p className="font-serif text-[13px] leading-relaxed text-beige-800 dark:text-brown-200">
                      {section.synthesis.reflection}
                    </p>
                  </div>

                  <blockquote className="rounded-xl bg-beige-100/70 p-3 dark:bg-brown-900/50">
                    <p className="font-serif text-[14px] italic leading-relaxed text-beige-900 dark:text-brown-100">
                      {section.synthesis.quote}
                    </p>
                    <cite className="mt-1.5 block font-sans text-[11px] not-italic text-beige-600 dark:text-brown-400">
                      {section.synthesis.passage.label} — highlighted in the
                      reader
                    </cite>
                  </blockquote>
                </div>
              )}

            {isMiracles && miracleStep?.kind === 'outro' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles
                    className="h-5 w-5 text-beige-700 dark:text-brown-300"
                    aria-hidden
                  />
                  <h2
                    ref={headingRef}
                    tabIndex={-1}
                    className="font-display text-xl font-bold text-beige-900 outline-none dark:text-brown-50"
                  >
                    {MIRACLE_OUTRO.title}
                  </h2>
                </div>

                {MIRACLE_OUTRO.body.map((p, i) => (
                  <p
                    key={i}
                    className="font-serif text-sm leading-relaxed text-beige-800 dark:text-brown-200"
                  >
                    {p}
                  </p>
                ))}

                <blockquote className="rounded-xl bg-beige-100/70 p-3 dark:bg-brown-900/50">
                  <p className="font-serif text-[15px] italic leading-relaxed text-beige-900 dark:text-brown-100">
                    {MIRACLE_OUTRO.quote}
                  </p>
                  <cite className="mt-1.5 block font-sans text-[11px] not-italic text-beige-600 dark:text-brown-400">
                    {MIRACLE_OUTRO.passage.label}
                  </cite>
                </blockquote>

                <div>
                  <p className="mb-1.5 font-sans text-[11px] font-semibold uppercase tracking-wide text-beige-600 dark:text-brown-400">
                    Carry on reading
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {MIRACLE_OUTRO.furtherReading.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => navigateRef.current(targetOf(p))}
                        className="inline-flex items-center gap-1 rounded-full border border-beige-300 bg-beige-50/70 px-2.5 py-1 font-sans text-[11px] text-beige-800 transition-colors hover:border-beige-500 hover:bg-beige-100 dark:border-brown-700 dark:bg-brown-900/50 dark:text-brown-200 dark:hover:border-brown-500"
                      >
                        <BookOpen className="h-3 w-3" aria-hidden />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <button
                    type="button"
                    onClick={restart}
                    className="font-sans text-xs text-beige-600 underline underline-offset-2 transition-colors hover:text-beige-900 dark:text-brown-400 dark:hover:text-brown-100"
                  >
                    Walk through it again
                  </button>
                  <button
                    type="button"
                    onClick={backToSelector}
                    className="font-sans text-xs text-beige-600 underline underline-offset-2 transition-colors hover:text-beige-900 dark:text-brown-400 dark:hover:text-brown-100"
                  >
                    Try the other tour
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* footer — only once a tour is chosen; the selector is card-driven */}
        {selectedTour !== null && (
          <div className="shrink-0 border-t border-beige-300/70 px-4 py-3 dark:border-brown-700/70">
            {/* item stepper */}
            {itemDots.length > 0 && (
              <div className="mb-2.5 flex items-center justify-center gap-1.5">
                {itemDots.map((d) => {
                  const active = stepIndex === d.target
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => goTo(d.target)}
                      className={`h-2 rounded-full transition-all ${
                        active
                          ? `w-6 ${d.accentDot}`
                          : 'w-2 bg-beige-300 hover:bg-beige-400 dark:bg-brown-700 dark:hover:bg-brown-600'
                      }`}
                      aria-label={d.label}
                      aria-current={active ? 'step' : undefined}
                    />
                  )
                })}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  stepIndex === 0 ? backToSelector() : goTo(stepIndex - 1)
                }
                className="flex min-h-10 items-center gap-1 rounded-xl px-3 font-sans text-xs font-medium btn-surface transition-all hover:shadow-md"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Back
              </button>

              <div className="flex-1" />

              {(momentIndex !== null || sectionIndex !== null) && (
                <button
                  type="button"
                  onClick={skipGroup}
                  className="flex min-h-10 items-center gap-1 rounded-xl px-2.5 font-sans text-xs text-beige-600 transition-colors hover:text-beige-900 dark:text-brown-400 dark:hover:text-brown-100"
                  aria-label={`Skip the rest of ${moment?.title ?? section?.title ?? ''}`}
                >
                  <SkipForward className="h-3.5 w-3.5" aria-hidden />
                  Skip
                </button>
              )}

              {stepIndex < lastStep ? (
                <button
                  type="button"
                  onClick={() => goTo(stepIndex + 1)}
                  className="tour-next-btn flex min-h-10 items-center gap-1 rounded-xl px-4 font-sans text-xs font-semibold shadow-md transition-all hover:shadow-lg"
                >
                  {voicesStep?.kind === 'welcome' || miracleStep?.kind === 'welcome'
                    ? 'Begin'
                    : 'Next'}
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={exit}
                  className="tour-next-btn flex min-h-10 items-center gap-1 rounded-xl px-4 font-sans text-xs font-semibold shadow-md transition-all hover:shadow-lg"
                >
                  Finish
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>

            <p className="tour-hint mt-2 text-center font-sans text-[10px] text-beige-500 dark:text-brown-500">
              ← → to move · Esc to leave · you can exit at any time
            </p>
          </div>
        )}
      </section>
    </div>,
    document.body,
  )
}
