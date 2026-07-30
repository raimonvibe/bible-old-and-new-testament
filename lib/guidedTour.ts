/**
 * Data for the guided tour: "One Story, Five Voices".
 *
 * Three pivotal moments — baptism, crucifixion, resurrection — as told by
 * Matthew, Mark, Luke, John and Paul. Every reference and quotation below was
 * checked against the World English Bible text shipped in
 * data/new-testament-data.json, so the pull quotes match what the reader shows.
 *
 * The theme running underneath is community: five people describe the same
 * events differently, the early church kept all five rather than flattening
 * them into one, and learning to hold them together is itself the lesson.
 */

export type MomentId = 'baptism' | 'crucifixion' | 'resurrection'

export type VoiceId = 'matthew' | 'mark' | 'luke' | 'john' | 'paul'

/** A scripture location the tour can send the reader to. */
export interface PassageRef {
  bookId: string
  bookName: string
  chapterNumber: string
  /** Inclusive verse range to highlight in the reader. */
  verses: [number, number]
  /** Human label, e.g. "Matthew 3:13–17". */
  label: string
}

export interface Voice {
  id: VoiceId
  /** Display name of the author. */
  name: string
  /** Who they were writing as, and for whom. */
  role: string
  /** Rough date of writing, shown as a small chip. */
  written: string
  passage: PassageRef
  /** Verbatim WEB quotation used as the pull quote. */
  quote: string
  /** Reference shown under the pull quote. */
  quoteRef: string
  /** One short paragraph on how this author sees the moment. */
  lens: string
  /** Details this author gives that the others do not. */
  distinctives: string[]
  /** Extra places to read, offered as secondary links. */
  alsoSee?: PassageRef[]
}

export interface Moment {
  id: MomentId
  /** e.g. "The Baptism" */
  title: string
  /** e.g. "At the Jordan" */
  subtitle: string
  /** Opening card for the moment. */
  intro: string
  voices: Voice[]
  /** Closing card for the moment: what is shared, what differs, what it asks of us. */
  synthesis: {
    heading: string
    /** Points every one of the five voices holds in common. */
    shared: string[]
    /** How the accounts differ, stated plainly and without alarm. */
    differences: string
    /** The community / mutual-respect reflection. */
    reflection: string
    /** A passage on living together with difference. */
    passage: PassageRef
    /** Verbatim WEB quotation from that passage. */
    quote: string
  }
}

function ref(
  bookId: string,
  bookName: string,
  chapterNumber: string,
  from: number,
  to: number,
): PassageRef {
  return {
    bookId,
    bookName,
    chapterNumber,
    verses: [from, to],
    label: `${bookName} ${chapterNumber}:${from === to ? from : `${from}–${to}`}`,
  }
}

/** Chapter id used by the Bible data, e.g. "MAT.3". */
export function chapterIdOf(passage: PassageRef): string {
  return `${passage.bookId}.${passage.chapterNumber}`
}

export const MOMENTS: Moment[] = [
  {
    id: 'baptism',
    title: 'The Baptism',
    subtitle: 'At the Jordan river',
    intro:
      'Five writers describe the day Jesus went down to the Jordan. One of them skips the baptism entirely. One was never there and never claims to have been. Read them side by side and notice that none of them tried to overwrite the others — the early communities kept all five.',
    voices: [
      {
        id: 'matthew',
        name: 'Matthew',
        role: 'Writing for a Jewish congregation, showing how Jesus completes Israel’s story',
        written: 'c. AD 80',
        passage: ref('MAT', 'Matthew', '3', 13, 17),
        quote:
          '“Allow it now, for this is the fitting way for us to fulfill all righteousness.”',
        quoteRef: 'Matthew 3:15',
        lens: 'Matthew keeps stopping to answer the question a careful reader would raise. If John’s baptism was for repentance, why would Jesus need it? Matthew is the only one who lets that objection be spoken out loud — and then answered.',
        distinctives: [
          'Only Matthew records John’s protest: “I need to be baptized by you, and you come to me?”',
          'Only Matthew gives Jesus’ reply about fulfilling all righteousness.',
          'The voice from heaven speaks about Jesus — “This is my beloved Son” — as a public announcement to everyone standing there.',
        ],
      },
      {
        id: 'mark',
        name: 'Mark',
        role: 'The shortest and earliest Gospel — urgency instead of explanation',
        written: 'c. AD 70',
        passage: ref('MRK', 'Mark', '1', 9, 11),
        quote: '“You are my beloved Son, in whom I am well pleased.”',
        quoteRef: 'Mark 1:11',
        lens: 'Mark spends three verses where Matthew spends five, and asks nothing of you but that you watch. No objection is raised, no theology is offered. The heavens part and a voice speaks, and Mark moves on.',
        distinctives: [
          'No protest and no conversation — Jesus arrives, is baptized, and the sky opens.',
          '“Immediately” is Mark’s signature word, and it is here in verse 10.',
          'The voice speaks to Jesus — “You are my beloved Son” — as a private word we are allowed to overhear.',
        ],
      },
      {
        id: 'luke',
        name: 'Luke',
        role: 'A careful researcher writing an orderly account for Theophilus',
        written: 'c. AD 85',
        passage: ref('LUK', 'Luke', '3', 21, 22),
        quote:
          '“Now when all the people were baptized, Jesus also had been baptized and was praying.”',
        quoteRef: 'Luke 3:21',
        lens: 'Luke puts Jesus inside the crowd rather than in front of it. The baptism happens while everyone else is being baptized, and heaven opens while Jesus is praying — which is how nearly every turning point in Luke begins.',
        distinctives: [
          'Jesus is baptized among “all the people” — one of a crowd, not set apart from it.',
          'Only Luke says Jesus was praying when the sky opened.',
          'Only Luke says the Spirit came “in a bodily form” — he wants you to know it could be seen.',
          'Luke has already told us John was shut in prison (3:19–20), so John is barely in the scene at all.',
        ],
      },
      {
        id: 'john',
        name: 'John',
        role: 'A witness more interested in what it meant than in what happened next',
        written: 'c. AD 90–100',
        passage: ref('JHN', 'John', '1', 29, 34),
        quote:
          '“I have seen the Spirit descending like a dove out of heaven, and it remained on Him.”',
        quoteRef: 'John 1:32',
        lens: 'The fourth Gospel never narrates the baptism. There is no water, no moment of going under. Instead John the Baptist stands up the next day and testifies to what he saw — the story arrives as somebody’s testimony rather than as a scene.',
        distinctives: [
          'The baptism itself is never described — this is the day after.',
          '“Behold, the Lamb of God, who takes away the sin of the world!” appears here and nowhere else.',
          'There is no voice from heaven; God had told John the sign to watch for in advance.',
          'The Spirit “remained” on Him — for this writer the point is that it stayed, not that it arrived.',
        ],
      },
      {
        id: 'paul',
        name: 'Paul',
        role: 'Never at the Jordan — writing to mixed congregations about what the water now means',
        written: 'c. AD 55–57',
        passage: ref('ROM', 'Romans', '6', 3, 5),
        quote:
          '“We were buried therefore with Him through baptism into death, that just as Christ was raised from the dead through the glory of the Father, so we also might walk in newness of life.”',
        quoteRef: 'Romans 6:4',
        lens: 'Paul does not describe Jesus’ baptism, and he never pretends to have been there. He turns the event outward instead: whatever happened at the river, it is now happening to the people reading his letter.',
        distinctives: [
          'No scene, no river, no dove — Paul writes about your baptism, not about that one.',
          'He reads the water as burial and rising: joined to a death, then to a resurrection.',
          'In Galatians 3:27–28 the same water dissolves the divisions his churches were fighting over — “neither Jew nor Greek… for you are all one in Christ Jesus.”',
          'Preaching in Antioch he mentions John only in passing, as a voice pointing past himself (Acts 13:24–25).',
        ],
        alsoSee: [
          ref('GAL', 'Galatians', '3', 26, 28),
          ref('ACT', 'Acts', '13', 24, 25),
        ],
      },
    ],
    synthesis: {
      heading: 'Same river, five vantage points',
      shared: [
        'The Spirit comes down and rests on Jesus.',
        'Heaven is open — parted, torn, or simply spoken through.',
        'Jesus is named as beloved Son, or as the one who baptizes in the Spirit.',
        'John the Baptist is not the point, and each writer says so in his own way.',
      ],
      differences:
        'They disagree about what is worth telling. Matthew stops to answer an objection; Mark refuses to slow down; Luke wants you in the crowd and at prayer; John never shows you the baptism at all; Paul was not there and says so. The voice from heaven even changes person — “This is my Son” in Matthew, “You are my Son” in Mark and Luke.',
      reflection:
        'These five accounts were copied, read aloud and preserved together, by communities that could easily have chosen one and quietly dropped the rest. They did not. Four differing versions and one outsider’s letter were bound into the same book — which is a decision about how to live with people, not only about how to keep records.',
      passage: ref('GAL', 'Galatians', '3', 26, 28),
      quote:
        '“There is neither Jew nor Greek, there is neither slave nor free man, there is neither male nor female; for you are all one in Christ Jesus.”',
    },
  },

  {
    id: 'crucifixion',
    title: 'The Crucifixion',
    subtitle: 'Outside the city wall',
    intro:
      'All five writers agree that Jesus was executed publicly under Roman authority. Almost everything else — his last words, who carried the cross, what the sky did, who understood — is remembered differently. Watch how much room the tradition left for that.',
    voices: [
      {
        id: 'matthew',
        name: 'Matthew',
        role: 'Reading the cross as an event that shakes Israel’s whole story loose',
        written: 'c. AD 80',
        passage: ref('MAT', 'Matthew', '27', 45, 54),
        quote:
          '“Eli, Eli, lima sabachthani?” That is, “My God, my God, why have you forsaken me?”',
        quoteRef: 'Matthew 27:46',
        lens: 'In Matthew the created world reacts. The land goes dark, the ground shakes, rock splits, and graves open. The confession at the foot of the cross comes from soldiers who are frightened by what they have just felt under their feet.',
        distinctives: [
          'Only Matthew reports the earthquake, the split rocks, and tombs opening.',
          'Only Matthew says holy people were raised and later seen in the city.',
          'The centurion is not alone — “the centurion and those who were with him” are terrified together.',
          'The cry of abandonment is given in its Hebrew form, “Eli”.',
        ],
      },
      {
        id: 'mark',
        name: 'Mark',
        role: 'The barest account, and the hardest to look away from',
        written: 'c. AD 70',
        passage: ref('MRK', 'Mark', '15', 33, 39),
        quote:
          '“Eloi, Eloi, lama sabachthani?” Which is, being interpreted, “My God, my God, why have you forsaken me?”',
        quoteRef: 'Mark 15:34',
        lens: 'Mark gives you darkness, one torn curtain, and a man dying with a question on his lips. There is no earthquake to interpret it for you. The centurion in Mark has nothing to go on except how Jesus cried out and died — and that is enough.',
        distinctives: [
          'The same cry, but in Aramaic — “Eloi” — the sound of the mother tongue.',
          'No earthquake, no opened tombs: darkness, a torn veil, silence.',
          'Mark names Simon of Cyrene as “the father of Alexander and Rufus” (15:21), as though his readers knew the sons personally.',
          'The centurion confesses on the strength of the death alone.',
        ],
        alsoSee: [ref('MRK', 'Mark', '15', 21, 21)],
      },
      {
        id: 'luke',
        name: 'Luke',
        role: 'The account in which mercy keeps moving in both directions',
        written: 'c. AD 85',
        passage: ref('LUK', 'Luke', '23', 33, 47),
        quote:
          '“Father, forgive them, for they don’t know what they are doing.”',
        quoteRef: 'Luke 23:34',
        lens: 'Luke’s Jesus never asks why he has been forsaken. He forgives the people driving the nails, promises Paradise to a condemned man beside him, and dies with a line from a psalm of trust. Even the centurion says something gentler here.',
        distinctives: [
          'Only Luke records the prayer of forgiveness from the cross.',
          'Only Luke tells of the criminal who defends Jesus and is answered, “today you will be with me in Paradise.”',
          'There is no cry of abandonment; the last words are “Father, into your hands I commit my spirit.”',
          'Luke’s centurion says something different again: “Certainly this was a righteous man.”',
          'Simon of Cyrene carries the cross “after Jesus” — behind him, like a disciple.',
        ],
      },
      {
        id: 'john',
        name: 'John',
        role: 'The cross told as a completion rather than a defeat',
        written: 'c. AD 90–100',
        passage: ref('JHN', 'John', '19', 23, 30),
        quote: '“It is finished!”',
        quoteRef: 'John 19:30',
        lens: 'Nothing is done to this Jesus that he does not accept. He carries his own cross, arranges his mother’s future from it, states a need, and declares the work complete. The last word is not a question but a finished sentence.',
        distinctives: [
          'Jesus carries his own cross (19:17) — no Simon of Cyrene in this Gospel.',
          'Only John records the new household made from the cross: “Woman, behold, your son!”',
          'Only John notices the seamless tunic the soldiers refuse to tear.',
          '“I am thirsty,” then “It is finished” — need and completion, in that order.',
        ],
        alsoSee: [ref('JHN', 'John', '19', 17, 17)],
      },
      {
        id: 'paul',
        name: 'Paul',
        role: 'Describing not the scene but the argument it started',
        written: 'c. AD 54–62',
        passage: ref('1CO', '1 Corinthians', '1', 18, 25),
        quote:
          '“But we preach Christ crucified, a stumbling block to Jews and foolishness to Greeks.”',
        quoteRef: '1 Corinthians 1:23',
        lens: 'Paul gives no darkness, no soldiers, no last words. He is writing to a congregation splitting into factions, and what he describes is the offence the cross causes — to his own people and to the Greeks alike — and his refusal to soften it for either.',
        distinctives: [
          'No narrative at all: Paul never describes the execution he preaches.',
          'He names both audiences and concedes the problem to each: a stumbling block to one, foolishness to the other.',
          '“I have been crucified with Christ” (Galatians 2:20) — he reads himself into the event.',
          'Colossians 1:20 makes the cross an act of peacemaking: “having made peace through the blood of his cross.”',
        ],
        alsoSee: [
          ref('GAL', 'Galatians', '2', 20, 20),
          ref('PHP', 'Philippians', '2', 6, 11),
          ref('COL', 'Colossians', '1', 19, 22),
        ],
      },
    ],
    synthesis: {
      heading: 'One death, remembered five ways',
      shared: [
        'Jesus was really executed, publicly, under Roman authority.',
        'He was not alone — criminals beside him, soldiers around him, women watching.',
        'Something in the temple is torn.',
        'Someone who had no reason to say it says something true about him.',
      ],
      differences:
        'The last words differ: a question of abandonment in Matthew and Mark, a prayer of trust in Luke, a declaration of completion in John. The centurion confesses a Son of God in two Gospels and a righteous man in a third. Simon of Cyrene carries the cross in three accounts and is absent from the fourth. Paul reports none of it.',
      reflection:
        'Four people stood at different distances from the same execution, and a fifth only ever heard about it. Their accounts were not harmonised into one official version. When Paul later described the church he used the image of a body: parts that cannot do each other’s work, and cannot do without each other either.',
      passage: ref('1CO', '1 Corinthians', '12', 20, 26),
      quote:
        '“The eye can’t tell the hand, ‘I have no need for you’… When one member suffers, all the members suffer with it.”',
    },
  },

  {
    id: 'resurrection',
    title: 'The Resurrection',
    subtitle: 'On the first day of the week',
    intro:
      'Here the differences are at their sharpest — who came to the tomb, how many messengers were there, who believed whom. The oldest surviving account of all is not in a Gospel, and it leaves out the women the Gospels put first. The early church kept every version anyway.',
    voices: [
      {
        id: 'matthew',
        name: 'Matthew',
        role: 'The empty tomb as public event, with witnesses who did not want to be there',
        written: 'c. AD 80',
        passage: ref('MAT', 'Matthew', '28', 1, 10),
        quote: '“He is not here, for He has risen, just like He said.”',
        quoteRef: 'Matthew 28:6',
        lens: 'Matthew ends as he told the crucifixion: with the ground moving. An angel comes down, rolls the stone away and sits on it, and the guards posted to prevent exactly this become the first people to fall over at it.',
        distinctives: [
          'Only Matthew reports a second earthquake, and an angel who rolls the stone back and then sits on it.',
          'Only Matthew has the guards, who shake and become “like dead men”.',
          'The women meet Jesus on the road and take hold of his feet.',
          'Everything points north: the disciples are to go to Galilee.',
        ],
      },
      {
        id: 'mark',
        name: 'Mark',
        role: 'The account that stops mid-breath',
        written: 'c. AD 70',
        passage: ref('MRK', 'Mark', '16', 1, 8),
        quote: '“They said nothing to anyone; for they were afraid.”',
        quoteRef: 'Mark 16:8',
        lens: 'Three women arrive with spices and a practical worry — who is going to move the stone? They are told he is risen, and then they run away and say nothing. The oldest manuscripts of Mark end right there, with no appearance and no reunion.',
        distinctives: [
          'Not an angel but “a young man… dressed in a white robe”, sitting on the right side.',
          'The message singles out one name: “tell His disciples and Peter” — the one who had denied him.',
          'The women flee in trembling and tell nobody.',
          'Early readers found the ending unbearable; the longer ending at 16:9–20 was added later. Even the first editors disagreed about how this should be told.',
        ],
        alsoSee: [ref('MRK', 'Mark', '16', 9, 20)],
      },
      {
        id: 'luke',
        name: 'Luke',
        role: 'The historian who records that nobody believed the first witnesses',
        written: 'c. AD 85',
        passage: ref('LUK', 'Luke', '24', 1, 12),
        quote:
          '“These words seemed to them to be nonsense, and they didn’t believe them.”',
        quoteRef: 'Luke 24:11',
        lens: 'Luke keeps the embarrassment in. The women bring the news and the apostles dismiss it as nonsense. Later in the same chapter the risen Jesus walks seven miles beside two people who have no idea who he is, and is recognised only when he breaks bread at their table.',
        distinctives: [
          'Two men in dazzling clothing, not one messenger.',
          'Luke names Joanna, a woman from Herod’s household, among the witnesses.',
          'He records the apostles refusing to believe the report — and Peter running to check.',
          'On the Emmaus road, recognition comes at a shared meal, not at the tomb (24:30–31).',
        ],
        alsoSee: [ref('LUK', 'Luke', '24', 28, 35)],
      },
      {
        id: 'john',
        name: 'John',
        role: 'One woman, in the dark, called by name',
        written: 'c. AD 90–100',
        passage: ref('JHN', 'John', '20', 11, 18),
        quote: 'Jesus said to her, “Mary.” She turned and said to Him, “Rabboni!”',
        quoteRef: 'John 20:16',
        lens: 'John narrows everything to one person. Mary Magdalene comes alone while it is still dark, mistakes Jesus for the gardener, and does not recognise a face — she recognises her own name being said.',
        distinctives: [
          'Mary comes alone, before dawn, and finds the stone moved.',
          'Only John records the footrace to the tomb, and the face cloth rolled up by itself (20:3–8).',
          'She takes him for the gardener; recognition comes through a single spoken word.',
          'Only John gives Thomas his doubt a week later, and his answer: “My Lord and my God!”',
        ],
        alsoSee: [
          ref('JHN', 'John', '20', 3, 8),
          ref('JHN', 'John', '20', 24, 29),
        ],
      },
      {
        id: 'paul',
        name: 'Paul',
        role: 'The earliest written account we have, and the one least like the others',
        written: 'c. AD 55',
        passage: ref('1CO', '1 Corinthians', '15', 3, 8),
        quote:
          '“For I delivered to you first of all that which I also received: that Christ died for our sins according to the Scriptures.”',
        quoteRef: '1 Corinthians 15:3',
        lens: 'This was written roughly twenty years before the Gospels, and Paul says he is passing on something he was handed earlier still. There is no tomb, no stone, no morning — only a list of people, most of whom, he points out, are still alive and can be asked.',
        distinctives: [
          'The oldest surviving account of the resurrection, and it is a list rather than a scene.',
          'Cephas, then the twelve, then over five hundred at once, then James, then all the apostles.',
          'The list names only men — while all four Gospels put women at the tomb first. What one writer treats as the heart of the story, another leaves out.',
          'Paul puts himself last, “as to the child born at the wrong time”.',
        ],
      },
    ],
    synthesis: {
      heading: 'Everyone was surprised, and nobody agrees on the details',
      shared: [
        'The tomb was empty on the first day of the week.',
        'Women came to it first, and in four of the five accounts they are the first to know.',
        'The people closest to Jesus were not expecting this and did not handle it well.',
        'The news had to be carried by someone to someone else before it was believed.',
      ],
      differences:
        'One woman in John, three in Mark, a larger group in Luke, two in Matthew. One messenger or two, an angel or a young man. Matthew has the women hold his feet; Mark has them tell nobody at all. Paul’s list of witnesses does not mention them.',
      reflection:
        'These accounts could have been edited into agreement — the differences were obvious to anyone who read them together, and they were read together from very early on. Keeping them meant accepting that the people who loved Jesus most remembered his rising differently. Paul, whose own version differs most, is the one who wrote that a community is not built by settling every disagreement first.',
      passage: ref('ROM', 'Romans', '14', 1, 5),
      quote:
        '“Now accept one who is weak in faith, but not for disputes over opinions… Let each man be fully assured in his own mind.”',
    },
  },
]

/** The welcome card shown before the first moment. */
export const TOUR_INTRO = {
  title: 'One Story, Five Voices',
  subtitle: 'A guided walk through three pivotal moments',
  body: [
    'Matthew, Mark, Luke, John and Paul all wrote about the same events — and they do not tell them the same way. One remembers an earthquake nobody else mentions. One never describes the baptism at all. One was not there for any of it.',
    'This tour visits three moments in turn: the baptism, the crucifixion, and the resurrection. At each stop the reader behind this panel opens the passage and highlights the verses, so you can read the actual text as you go.',
    'The point is not to decide who got it right. It is to notice that a community kept all five — and to ask what it takes to do the same with the people around you.',
  ],
  /** Roughly how long the whole walk takes. */
  duration: 'About 10 minutes · leave whenever you like',
}

/** The closing card shown after the third moment. */
export const TOUR_OUTRO = {
  title: 'Members of one another',
  body: [
    'You have now read fifteen accounts of three events. They disagree about the wording of a voice from heaven, the last words of a dying man, and the number of people standing at an empty tomb.',
    'Not one of these writers was removed from the collection for getting the details differently. They were bound together, read together, and handed on together — disagreements intact.',
    'That is the older habit worth borrowing. Not pretending the differences are not there, and not treating them as a reason to stop carrying one another.',
  ],
  passage: ref('ROM', 'Romans', '15', 5, 7),
  quote:
    '“Therefore accept one another, even as Christ also accepted you, to the glory of God.”',
  furtherReading: [
    ref('GAL', 'Galatians', '6', 2, 2),
    ref('EPH', 'Ephesians', '4', 2, 6),
    ref('ROM', 'Romans', '12', 4, 6),
  ],
}

/* ---------------------------------------------------------------------------
 * Step sequence
 * ------------------------------------------------------------------------- */

export type TourStep =
  | { kind: 'welcome' }
  | { kind: 'moment-intro'; momentIndex: number }
  | { kind: 'voice'; momentIndex: number; voiceIndex: number }
  | { kind: 'synthesis'; momentIndex: number }
  | { kind: 'outro' }

export const TOUR_STEPS: TourStep[] = [
  { kind: 'welcome' },
  ...MOMENTS.flatMap((moment, momentIndex) => [
    { kind: 'moment-intro' as const, momentIndex },
    ...moment.voices.map((_, voiceIndex) => ({
      kind: 'voice' as const,
      momentIndex,
      voiceIndex,
    })),
    { kind: 'synthesis' as const, momentIndex },
  ]),
  { kind: 'outro' },
]

/** Index of the first step of a given moment, used by "skip this moment". */
export function firstStepOfMoment(momentIndex: number): number {
  return TOUR_STEPS.findIndex(
    (s) => s.kind === 'moment-intro' && s.momentIndex === momentIndex,
  )
}

/** The moment a step belongs to, or null for the welcome and closing cards. */
export function momentIndexOfStep(step: TourStep): number | null {
  return step.kind === 'welcome' || step.kind === 'outro'
    ? null
    : step.momentIndex
}

/** The passage a step should open in the reader, if any. */
export function passageOfStep(step: TourStep): PassageRef | null {
  switch (step.kind) {
    case 'voice':
      return MOMENTS[step.momentIndex].voices[step.voiceIndex].passage
    case 'synthesis':
      return MOMENTS[step.momentIndex].synthesis.passage
    case 'outro':
      return TOUR_OUTRO.passage
    default:
      return null
  }
}

/* ---------------------------------------------------------------------------
 * Narration
 * ------------------------------------------------------------------------- */

/**
 * The step read aloud, as short segments — one utterance each, so pausing and
 * moving on stay responsive. Mirrors what is on screen rather than adding a
 * separate script, so listening and reading stay in step.
 */
export function narrationForStep(step: TourStep): string[] {
  switch (step.kind) {
    case 'welcome':
      return [TOUR_INTRO.title, TOUR_INTRO.subtitle, ...TOUR_INTRO.body]

    case 'moment-intro': {
      const moment = MOMENTS[step.momentIndex]
      return [
        `Moment ${step.momentIndex + 1} of ${MOMENTS.length}. ${moment.title}, ${moment.subtitle}.`,
        moment.intro,
      ]
    }

    case 'voice': {
      const voice = MOMENTS[step.momentIndex].voices[step.voiceIndex]
      return [
        `${voice.name}. ${voice.role}.`,
        `Reading ${voice.passage.label}.`,
        `${voice.quote} ${voice.quoteRef}.`,
        `What only ${voice.name} gives you.`,
        ...voice.distinctives,
        voice.lens,
      ]
    }

    case 'synthesis': {
      const { synthesis } = MOMENTS[step.momentIndex]
      return [
        synthesis.heading,
        'All five hold this in common.',
        ...synthesis.shared,
        'Where they part ways.',
        synthesis.differences,
        'And why that matters.',
        synthesis.reflection,
        `${synthesis.quote} ${synthesis.passage.label}.`,
      ]
    }

    case 'outro':
      return [
        TOUR_OUTRO.title,
        ...TOUR_OUTRO.body,
        `${TOUR_OUTRO.quote} ${TOUR_OUTRO.passage.label}.`,
      ]
  }
}

/* ---------------------------------------------------------------------------
 * Per-voice accent colours
 *
 * Full class strings, written out so Tailwind's scanner can see them. The hues
 * stay warm and low-saturation so they sit inside the site's beige/brown
 * palette rather than fighting it, and each has a dark-mode counterpart.
 * ------------------------------------------------------------------------- */

export interface VoiceAccent {
  /** Circular initial badge. */
  badge: string
  /** Left rule on the pull quote. */
  rule: string
  /** Small reference chip. */
  chip: string
  /** Active dot in the voice stepper. */
  dot: string
}

export const VOICE_ACCENTS: Record<VoiceId, VoiceAccent> = {
  matthew: {
    badge:
      'bg-amber-100 text-amber-900 ring-amber-500/40 dark:bg-amber-950/60 dark:text-amber-100 dark:ring-amber-400/40',
    rule: 'border-amber-500/70 dark:border-amber-400/60',
    chip:
      'bg-amber-100/80 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100',
    dot: 'bg-amber-600 dark:bg-amber-400',
  },
  mark: {
    badge:
      'bg-orange-100 text-orange-900 ring-orange-500/40 dark:bg-orange-950/60 dark:text-orange-100 dark:ring-orange-400/40',
    rule: 'border-orange-600/70 dark:border-orange-400/60',
    chip:
      'bg-orange-100/80 text-orange-900 dark:bg-orange-950/50 dark:text-orange-100',
    dot: 'bg-orange-600 dark:bg-orange-400',
  },
  luke: {
    badge:
      'bg-emerald-100 text-emerald-900 ring-emerald-600/40 dark:bg-emerald-950/60 dark:text-emerald-100 dark:ring-emerald-400/40',
    rule: 'border-emerald-600/70 dark:border-emerald-400/60',
    chip:
      'bg-emerald-100/80 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100',
    dot: 'bg-emerald-700 dark:bg-emerald-400',
  },
  john: {
    badge:
      'bg-sky-100 text-sky-900 ring-sky-600/40 dark:bg-sky-950/60 dark:text-sky-100 dark:ring-sky-400/40',
    rule: 'border-sky-600/70 dark:border-sky-400/60',
    chip: 'bg-sky-100/80 text-sky-900 dark:bg-sky-950/50 dark:text-sky-100',
    dot: 'bg-sky-700 dark:bg-sky-400',
  },
  paul: {
    badge:
      'bg-violet-100 text-violet-900 ring-violet-600/40 dark:bg-violet-950/60 dark:text-violet-100 dark:ring-violet-400/40',
    rule: 'border-violet-600/70 dark:border-violet-400/60',
    chip:
      'bg-violet-100/80 text-violet-900 dark:bg-violet-950/50 dark:text-violet-100',
    dot: 'bg-violet-700 dark:bg-violet-400',
  },
}
