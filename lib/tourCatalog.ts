/**
 * The list of guided tours offered from the selector screen. Each tour's own
 * content lives in its own data module (lib/guidedTour.ts, lib/miraclesTour.ts)
 * — this file only holds what the selector cards need to introduce them.
 */

import { MOMENTS, TOUR_INTRO } from './guidedTour'
import { MIRACLE_INTRO, TESTAMENT_SECTIONS } from './miraclesTour'

export type TourId = 'voices' | 'miracles'

export interface TourSummary {
  id: TourId
  title: string
  subtitle: string
  description: string
  duration: string
  /** Small facts shown on the card, e.g. "3 moments" / "5 voices each". */
  facts: string[]
}

export const TOUR_CATALOG: TourSummary[] = [
  {
    id: 'voices',
    title: TOUR_INTRO.title,
    subtitle: TOUR_INTRO.subtitle,
    description:
      'Matthew, Mark, Luke, John and Paul each describe the same events differently. Walk through the baptism, the crucifixion, and the resurrection, and see what a community keeps when it refuses to flatten five voices into one.',
    duration: TOUR_INTRO.duration,
    facts: [`${MOMENTS.length} pivotal moments`, `${MOMENTS[0].voices.length} voices per moment`],
  },
  {
    id: 'miracles',
    title: MIRACLE_INTRO.title,
    subtitle: MIRACLE_INTRO.subtitle,
    description:
      'Fourteen widely known miracles, seven from each Testament — a parted sea, bread from the sky, a fire, a furnace, a storm stilled, a friend raised. Each one closes with a question connecting it to your own life.',
    duration: MIRACLE_INTRO.duration,
    facts: [
      `${TESTAMENT_SECTIONS.length} testaments`,
      `${TESTAMENT_SECTIONS.reduce((n, s) => n + s.miracles.length, 0)} miracles`,
    ],
  },
]
