/**
 * Data for the guided tour: "Wonders and Hope".
 *
 * Fourteen miracles — seven from the Old Testament, seven from the New —
 * chosen for being widely known and for showing the same thing from many
 * angles: power meeting a situation that had already run out of options.
 * Every reference and quotation was checked against the World English Bible
 * text shipped in data/old-testament-data.json and data/new-testament-data.json,
 * so the pull quotes match what the reader shows.
 *
 * Structured the same way as lib/guidedTour.ts (see that file for the pattern
 * this one follows): a welcome card, two sections each with an intro, a run of
 * item cards, and a closing synthesis, then an outro. The unit here is a single
 * miracle rather than five perspectives on one event, so each card carries a
 * plain-language explanation and closes with a question connecting it to the
 * reader's own life — the throughline is hope, not disagreement.
 */

import { chapterIdOf, ref, type PassageRef } from './guidedTour'

export type TestamentId = 'old' | 'new'

export type MiracleId =
  | 'red-sea'
  | 'manna'
  | 'jericho'
  | 'elijah-fire'
  | 'fiery-furnace'
  | 'lions-den'
  | 'jonah'
  | 'cana'
  | 'calming-storm'
  | 'feeding-five-thousand'
  | 'walking-on-water'
  | 'lazarus'
  | 'bleeding-woman'
  | 'peters-rescue'

export interface Miracle {
  id: MiracleId
  /** e.g. "Parting of the Red Sea" */
  title: string
  /** e.g. "The shore of the Red Sea, at the edge of Egypt" */
  location: string
  testament: TestamentId
  passage: PassageRef
  /** Verbatim WEB quotation used as the pull quote. */
  quote: string
  quoteRef: string
  /** Short, plain-language, notable details of the scene. */
  details: string[]
  /** Beginner-friendly paragraph: what actually happened. */
  whatHappened: string
  /** Why this shows divine power overcoming impossibility, and hope. */
  hopeMeaning: string
  /** Invites the reader to connect the miracle to their own life. */
  reflectionQuestion: string
  /** Extra places to read, offered as secondary links. */
  alsoSee?: PassageRef[]
}

export interface TestamentSection {
  id: TestamentId
  /** e.g. "Old Testament Wonders" */
  title: string
  /** e.g. "Seven signs among the people of Israel" */
  subtitle: string
  /** Opening card for the section. */
  intro: string
  miracles: Miracle[]
  /** Closing card for the section: the pattern underneath, and what it asks of us. */
  synthesis: {
    heading: string
    /** What these miracles have in common. */
    patterns: string[]
    /** The hope-themed closing thought. */
    reflection: string
    passage: PassageRef
    quote: string
  }
}

export const TESTAMENT_SECTIONS: TestamentSection[] = [
  {
    id: 'old',
    title: 'Old Testament Wonders',
    subtitle: 'Seven signs among the people of Israel',
    intro:
      'Long before Jesus, the story of Israel is already full of the same message: help shows up exactly when hope runs out. These seven wonders — a sea, a desert, a wall, a fire, a furnace, a den of lions, and a fish — each say it a different way: no situation is too sealed shut.',
    miracles: [
      {
        id: 'red-sea',
        title: 'Parting of the Red Sea',
        location: 'The shore of the Red Sea, at the edge of Egypt',
        testament: 'old',
        passage: ref('EXO', 'Exodus', '14', 21, 31),
        quote:
          'The children of Israel went into the middle of the sea on the dry ground; and the waters were a wall to them on their right hand and on their left.',
        quoteRef: 'Exodus 14:22',
        details: [
          "Pharaoh's entire army — chariots, horses, soldiers — was closing in from behind, with the sea blocking every other way out.",
          'Moses simply raised his hand, and a strong wind blew all night until the sea floor was dry enough to walk on.',
          'The same waters that opened for Israel closed again over the army chasing them.',
        ],
        whatHappened:
          "The people of Israel had just escaped slavery in Egypt, and now they were trapped — the sea in front of them, Pharaoh's army closing in behind. There was nowhere to run. Then the sea itself opened a path, and an entire nation walked across on dry ground.",
        hopeMeaning:
          "This is the miracle so many other Bible writers point back to, because it says something so simple: the situation that looked completely sealed shut wasn't. When every visible option is gone, that isn't the same as being out of options.",
        reflectionQuestion:
          "Is there a place in your life right now that feels sealed shut on every side — where you can't see a way through?",
      },
      {
        id: 'manna',
        title: 'Manna from Heaven',
        location: 'The wilderness of Sin, on the way to Sinai',
        testament: 'old',
        passage: ref('EXO', 'Exodus', '16', 4, 15),
        quote: 'It is the bread which Yahweh has given you to eat.',
        quoteRef: 'Exodus 16:15',
        details: [
          "The people had just complained they'd rather have stayed slaves in Egypt than starve in the desert.",
          'Every morning, a thin flaky substance appeared on the ground with the dew — enough for that day, no more.',
          'It kept appearing every single day for the next forty years, until they no longer needed it.',
        ],
        whatHappened:
          'Free, but hungry, with no fields to farm in the desert, the people ran out of food within weeks of their escape. So a strange bread began appearing on the ground each morning — as much as each family needed for that one day, and no more.',
        hopeMeaning:
          "This isn't a one-time rescue; it's daily provision, repeated for forty years. Hope here doesn't look like one dramatic moment — it looks like showing up again and again, exactly enough, exactly on time.",
        reflectionQuestion:
          'What would it look like to trust for just today, instead of trying to secure your whole future at once?',
      },
      {
        id: 'jericho',
        title: 'The Walls of Jericho',
        location: 'Jericho, the first fortified city inside the promised land',
        testament: 'old',
        passage: ref('JOS', 'Joshua', '6', 15, 20),
        quote:
          'When the people heard the sound of the trumpet, the people shouted with a great shout, and the wall fell down flat, so that the people went up into the city, every man straight in front of him, and they took the city.',
        quoteRef: 'Joshua 6:20',
        details: [
          "Jericho's walls were high, thick, and built to withstand a siege — there was no obvious way in.",
          'Instead of attacking, Israel was told to march silently around the city once a day for six days, then seven times on the seventh.',
          'There was no battering ram and no ladder. The walls simply fell, all at once, on cue.',
        ],
        whatHappened:
          "Jericho stood in the way of Israel entering the land they'd been promised — a walled city built to keep armies out. Rather than fighting their way in, Israel was told to walk, in silence, for a week, and then shout. That's it. And the wall came down.",
        hopeMeaning:
          "There's no strategy here a general would recommend. The instructions look pointless right up until the moment they work. Sometimes faith looks exactly like that — doing the small, unimpressive thing you've been asked to do, long before you can see why.",
        reflectionQuestion:
          "Is there something small and unimpressive you keep putting off, because it doesn't look like it could possibly be enough?",
      },
      {
        id: 'elijah-fire',
        title: 'Fire from Heaven at Mount Carmel',
        location: 'Mount Carmel, during a public contest with the prophets of Baal',
        testament: 'old',
        passage: ref('1KI', '1 Kings', '18', 36, 39),
        quote:
          "Then Yahweh's fire fell and consumed the burnt offering, the wood, the stones, and the dust; and it licked up the water that was in the trench.",
        quoteRef: '1 Kings 18:38',
        details: [
          'Elijah stood alone against 450 prophets of a rival god, in front of a watching crowd.',
          'He soaked his altar in water three times first, to remove any doubt about how it caught fire.',
          'When the fire fell, it consumed rock and water along with the sacrifice.',
        ],
        whatHappened:
          "For years, the nation had been worshiping a foreign god alongside — or instead of — the God of Israel. Elijah, one man against hundreds of the other god's prophets, built an altar, soaked it in water, and prayed a short prayer out loud. Fire fell from the sky and burned it all up — wood, stone, water and all.",
        hopeMeaning:
          "Elijah wasn't hoping for a miracle out of desperation for himself — he was standing alone for something he believed was true, in front of people who thought he was finished. Sometimes hope means being willing to be the only one standing, and trusting that being right doesn't require being popular.",
        reflectionQuestion:
          'When was the last time you held onto what you believed, even though you felt like the only one who did?',
      },
      {
        id: 'fiery-furnace',
        title: 'The Fiery Furnace',
        location: 'Babylon, in the court of King Nebuchadnezzar',
        testament: 'old',
        passage: ref('DAN', 'Daniel', '3', 16, 27),
        quote:
          'Look, I see four men loose, walking in the middle of the fire, and they are unharmed. The appearance of the fourth is like a son of the gods.',
        quoteRef: 'Daniel 3:25',
        details: [
          'Shadrach, Meshach, and Abednego refused to bow to a golden statue, on pain of death.',
          '"If it happens, our God is able to deliver us... but if not, we still won\'t bow" — their answer didn\'t wait for a guaranteed rescue.',
          'The furnace was so hot it killed the guards who threw them in, yet the three men walked around inside it, untouched, with a fourth figure beside them.',
        ],
        whatHappened:
          "Three men refused to worship a statue they didn't believe in, even under threat of being burned alive. The king had them thrown into a furnace heated seven times hotter than normal. When he looked in, expecting to see nothing left, he saw four men walking around, completely unharmed.",
        hopeMeaning:
          '"But if not" is the most remarkable line in this story, and it comes before the miracle. They committed to their faith without knowing whether the rescue was coming. Hope here is not a guarantee that the fire won\'t happen — it\'s the confidence that you won\'t be facing it alone if it does.',
        reflectionQuestion:
          "Could you say \"but if not\" about the thing you're currently hoping for — and still hold on to your faith either way?",
      },
      {
        id: 'lions-den',
        title: "Daniel in the Lions' Den",
        location: 'Babylon, in the den of lions beneath the palace',
        testament: 'old',
        passage: ref('DAN', 'Daniel', '6', 16, 23),
        quote:
          "My God has sent his angel, and has shut the lions' mouths, and they have not hurt me, because innocence was found in me before him; and also before you, O king, I have done no harm.",
        quoteRef: 'Daniel 6:22',
        details: [
          'Daniel kept praying openly, three times a day, even after a law was passed making it a capital offense.',
          'The king who sentenced him spent the whole night fasting, unable to sleep, hoping Daniel would somehow survive.',
          "In the morning, Daniel wasn't just alive — there wasn't a single mark on him.",
        ],
        whatHappened:
          'A group of officials, jealous of Daniel, tricked the king into signing a law that made praying to anyone but the king illegal. Daniel kept praying anyway, exactly as he always had, and was thrown into a den of lions overnight as the penalty. He walked out the next morning completely unharmed.',
        hopeMeaning:
          "Daniel didn't stop an ordinary habit — daily prayer — just because it became dangerous. The miracle wasn't a reward for something dramatic; it was protection over something quietly faithful, repeated for years before anyone was watching that closely.",
        reflectionQuestion:
          'Is there something quietly faithful you keep doing, even when it costs you something to keep doing it?',
      },
      {
        id: 'jonah',
        title: 'Jonah and the Great Fish',
        location: 'The Mediterranean Sea, then the shores near Nineveh',
        testament: 'old',
        passage: ref('JON', 'Jonah', '1', 15, 17),
        quote:
          'Yahweh prepared a huge fish to swallow up Jonah, and Jonah was in the belly of the fish three days and three nights.',
        quoteRef: 'Jonah 1:17',
        details: [
          "Jonah wasn't running toward a disaster — he was running away from a job God had given him.",
          'He was thrown overboard by the sailors as a last resort, expecting to drown.',
          "Three days later, the fish brought him back to dry land, and he finally went where he'd been asked to go.",
        ],
        whatHappened:
          "Told to warn a hostile foreign city, Jonah sailed the opposite direction instead. A storm nearly sank the ship, and Jonah — realizing it was his fault — had the sailors throw him overboard. Rather than letting him drown, God sent a great fish to swallow him, and three days later it left him safely on shore.",
        hopeMeaning:
          "This is the one Old Testament wonder aimed at someone actively running away. It's easy to assume hope is only for people doing everything right. Jonah's story says otherwise: even a second chance, handed to someone mid-flight from their calling, still counts as rescue.",
        reflectionQuestion:
          "Is there something you know you're supposed to be doing, but have been quietly running from?",
        alsoSee: [ref('JON', 'Jonah', '2', 1, 10)],
      },
    ],
    synthesis: {
      heading: 'The pattern behind these seven wonders',
      patterns: [
        "Every one of them happens at the exact point where human effort has run out — not before.",
        "God's people are almost always asked to do one very ordinary thing first: stretch out a hand, march in silence, keep praying, gather what falls.",
        'None of these are private. Someone else always sees, and the story gets told for centuries.',
        'Hope, across the Old Testament, rarely means being kept away from danger. It means God arriving in the middle of it.',
      ],
      reflection:
        "Seven very different kinds of trouble — an army closing in, an empty stomach, a fortified wall, a fight nobody else would join, a furnace built to kill, a den of lions, three days inside a fish — and every single time, the miracle lands at the last possible moment, never a moment before it was needed. That timing isn't an accident. It's the whole point: help rarely arrives early, but it does arrive.",
      passage: ref('PSA', 'Psalms', '46', 1, 3),
      quote: 'God is our refuge and strength, a very present help in trouble.',
    },
  },

  {
    id: 'new',
    title: 'New Testament Wonders',
    subtitle: 'Seven signs through Jesus and the early church',
    intro:
      "In the Gospels and the book of Acts, the wonders get closer and more personal — a wedding about to be quietly ruined, a storm you're actually sitting in, a friend who has actually died. These seven moments show the same hope from nearer up: God present not just for a whole nation, but for one ordinary person, in one particular impossible moment.",
    miracles: [
      {
        id: 'cana',
        title: 'Water into Wine at Cana',
        location: 'Cana of Galilee, at a wedding celebration',
        testament: 'new',
        passage: ref('JHN', 'John', '2', 1, 11),
        quote:
          'Everyone serves the good wine first, and when the guests have drunk freely, then that which is worse. You have kept the good wine until now!',
        quoteRef: 'John 2:10',
        details: [
          'Running out of wine mid-celebration was a real social embarrassment for the family hosting.',
          'Jesus\'s mother didn\'t ask for a miracle — she just told the servants, "Whatever he says to you, do it."',
          'Six large stone jars — roughly 120 to 180 gallons in total — were filled with water, and it came out as wine.',
        ],
        whatHappened:
          'At a wedding, the wine ran out — a small disaster by any measure, but an embarrassing one for the family hosting it. Jesus told the servants to fill enormous stone water jars, and when they poured a cup out to serve, it had become wine — and remarkably good wine at that.',
        hopeMeaning:
          "Not every miracle in this tour starts with someone in mortal danger. This one starts with an ordinary problem on an ordinary day. It shows something worth remembering: the same power that can split a sea is also willing to show up for a wedding that's about to be quietly ruined.",
        reflectionQuestion:
          "Do you only bring the big crises to God, or is there a small, ordinary worry you've been carrying alone?",
      },
      {
        id: 'calming-storm',
        title: 'Jesus Calms the Storm',
        location: 'The Sea of Galilee, in a small fishing boat',
        testament: 'new',
        passage: ref('MRK', 'Mark', '4', 37, 41),
        quote:
          'He awoke and rebuked the wind, and said to the sea, "Peace! Be still!" The wind ceased and there was a great calm.',
        quoteRef: 'Mark 4:39',
        details: [
          'The storm was strong enough that experienced fishermen were convinced they were about to die.',
          'Jesus was asleep in the boat, seemingly unbothered by the same waves terrifying everyone else.',
          "He didn't calm the disciples first — he spoke directly to the wind and the water.",
        ],
        whatHappened:
          'Caught in a sudden, violent storm on the lake, the disciples — several of them experienced fishermen — panicked and woke Jesus, convinced the boat was going down. He stood up, spoke three words to the storm, and the wind and waves went completely still.',
        hopeMeaning:
          "What's easy to miss is that Jesus was in the boat the whole time, storm and all — just asleep. Hope doesn't always mean the danger never touches you. Sometimes it means the one who can calm it was already there before you noticed.",
        reflectionQuestion:
          'In your current storm, does it feel like you\'re facing it alone — or is it possible help has been closer than you realized?',
      },
      {
        id: 'feeding-five-thousand',
        title: 'Feeding the Five Thousand',
        location: 'A remote hillside near the Sea of Galilee',
        testament: 'new',
        passage: ref('JHN', 'John', '6', 9, 13),
        quote:
          'Jesus took the loaves, and having given thanks, He distributed to the disciples, and the disciples to those who were sitting down, likewise also of the fish as much as they desired.',
        quoteRef: 'John 6:11',
        details: [
          "The only food anyone could find was a boy's small lunch — five barley loaves and two fish.",
          'More than five thousand people ate until they were full.',
          "Afterward, the leftovers filled twelve baskets — more than they'd started with.",
        ],
        whatHappened:
          'A crowd of thousands had followed Jesus out to a remote hillside with no food and no way to buy any. A boy offered up his small lunch — five loaves, two fish — and Jesus used it to feed the entire crowd, with baskets of food left over.',
        hopeMeaning:
          "The miracle didn't start with abundance. It started with one child's small lunch, offered without knowing what it would become. Hope often begins the same way — not with enough, but with whatever little you actually have, handed over.",
        reflectionQuestion:
          "What's the \"five loaves and two fish\" in your own hands right now — the small thing that doesn't feel like nearly enough?",
      },
      {
        id: 'walking-on-water',
        title: 'Jesus Walks on Water',
        location: 'The Sea of Galilee, in the middle of the night',
        testament: 'new',
        passage: ref('MAT', 'Matthew', '14', 25, 31),
        quote:
          'Immediately Jesus stretched out His hand, took hold of Him, and said to Him, "You of little faith, why did you doubt?"',
        quoteRef: 'Matthew 14:31',
        details: [
          'The disciples were miles from shore, fighting strong headwinds, when they saw a figure walking toward them on the sea.',
          'Peter is the only one who asked to try it himself — and he did walk, for a moment.',
          'He only began to sink once he noticed the wind and got afraid, not before.',
        ],
        whatHappened:
          'Exhausted from rowing against the wind all night, the disciples saw what they thought was a ghost walking toward their boat across the water. It was Jesus. Peter asked to come out and meet him — and for a few steps, he did — until he noticed how strong the wind was and started to sink.',
        hopeMeaning:
          "Peter didn't fail because he tried. He only faltered once his attention moved from Jesus to the size of the wind. The hand that caught him was already reaching out before he'd even finished asking for help.",
        reflectionQuestion:
          "What are you looking at right now — the wind, or the hand that's already reaching for you?",
      },
      {
        id: 'lazarus',
        title: 'Raising Lazarus',
        location: 'Bethany, just outside Jerusalem',
        testament: 'new',
        passage: ref('JHN', 'John', '11', 39, 44),
        quote: '"Lazarus, come out!"',
        quoteRef: 'John 11:43',
        details: [
          'Jesus arrived four days after Lazarus had died — deliberately, and after his sisters had already sent for him.',
          'Martha\'s first words to Jesus were part grief, part accusation: "if you had been here, my brother wouldn\'t have died."',
          'Lazarus came out still bound hand and foot in his grave wrappings, his face wrapped in a cloth — Jesus had to tell the crowd to untie him.',
        ],
        whatHappened:
          'By the time Jesus reached Bethany, his close friend Lazarus had already been dead and buried for four days — long past any hope of recovery, by every normal measure. Jesus asked for the tomb to be opened, called Lazarus by name, and he walked out alive.',
        hopeMeaning:
          "Jesus didn't arrive in time to prevent the death — he arrived after it, on purpose, and grieved it fully before doing anything about it. Hope here isn't the absence of loss. It's what's still possible even after the moment everyone else has already called \"too late.\"",
        reflectionQuestion:
          "Is there something in your life you've already decided is too late to hope for?",
      },
      {
        id: 'bleeding-woman',
        title: "The Woman Healed by Touching Jesus' Cloak",
        location: 'A crowded roadside in Galilee',
        testament: 'new',
        passage: ref('MRK', 'Mark', '5', 25, 34),
        quote:
          'Daughter, your faith has made you well. Go in peace, and be cured of your disease.',
        quoteRef: 'Mark 5:34',
        details: [
          'She had been ill for twelve years, and had spent everything she owned on doctors, only to get worse.',
          "She didn't ask Jesus for anything out loud — she reached through the crowd and touched the edge of his clothing.",
          'Jesus stopped and looked for her specifically, even in a crowd pressing in from every side.',
        ],
        whatHappened:
          'A woman who had suffered a chronic illness for twelve years — and spent everything she had trying to get better — pushed through a dense crowd, too afraid or ashamed to ask out loud, and just touched the edge of Jesus\'s cloak. She was healed instantly, and Jesus stopped to find her.',
        hopeMeaning:
          "Twelve years of being unseen, unheard, and overlooked ends with Jesus stopping an entire crowd just to notice her. Hope isn't only for the miracles everyone is watching. It reaches the person who was too tired, or too embarrassed, to ask for help out loud.",
        reflectionQuestion:
          "Is there a need you've been carrying quietly, too tired or embarrassed to say out loud?",
      },
      {
        id: 'peters-rescue',
        title: "Peter's Rescue from Prison",
        location: 'A prison cell in Jerusalem, the night before a planned execution',
        testament: 'new',
        passage: ref('ACT', 'Acts', '12', 6, 10),
        quote:
          'an angel of the Lord stood by Him, and a light shone in the cell. He struck Peter on the side and woke Him up, saying, "Stand up quickly!" His chains fell off His hands.',
        quoteRef: 'Acts 12:7',
        details: [
          'Peter was guarded by sixteen soldiers and chained between two of them, the night before he was due to be executed.',
          'He was asleep when the angel arrived — not awake and anxiously waiting for rescue.',
          "The prison's iron gate to the city opened on its own, with no one touching it.",
        ],
        whatHappened:
          'The night before Peter was due to be publicly executed, chained between two guards inside a heavily secured prison, an angel appeared, woke him up, and simply told him to get dressed and follow. His chains fell off, the guarded doors opened by themselves, and he walked out into the street.',
        hopeMeaning:
          'This story happens after Jesus had already died and risen — proof the pattern didn\'t stop with him. The same kind of rescue that split a sea and calmed a storm kept showing up for ordinary people in impossible, locked situations, long after the Gospels ended.',
        reflectionQuestion:
          'What locked door in your life feels the most impossible to open right now?',
      },
    ],
    synthesis: {
      heading: 'What changes, and what doesn\'t',
      patterns: [
        'The setting keeps shrinking: from a whole nation escaping an empire, down to one wedding, one boat, one hillside, one sickbed, one prison cell.',
        'Faith is almost always described as small right before it\'s rewarded — "if I just touch his clothes," "you of little faith."',
        'Jesus, and later his followers, are physically present in the worst moment — not arriving to explain it afterward.',
        'Every single rescue becomes something someone else needed to hear about — a crowd, a sister, a church, and now, you, reading it.',
      ],
      reflection:
        'The same hand that once split a sea now reaches into a wedding, a fishing boat, a hungry crowd, a house in mourning, a locked cell. The scale changed — from a nation to a person — but the pattern didn\'t. Whatever feels too small or too far gone to matter to anyone else has not turned out to be too small to matter here.',
      passage: ref('HEB', 'Hebrews', '13', 8, 8),
      quote: 'Jesus Christ is the same yesterday, today, and forever.',
    },
  },
]

/** The welcome card shown before the first section. */
export const MIRACLE_INTRO = {
  title: 'Wonders and Hope',
  subtitle: 'Fourteen moments when the impossible gave way',
  body: [
    'From a sea that refused to close over fleeing families, to a friend called back out of a tomb four days gone — the Bible is full of moments that should have ended in disaster, and didn\'t.',
    'This tour walks through fourteen of them: seven from the Old Testament, seven from the New. At each stop, the reader behind this panel opens the passage, so you can read the actual words for yourself.',
    'After each one, there\'s a short question. Not a quiz — just an invitation to notice where your own life might be asking for the same kind of hope.',
  ],
  duration: 'About 12–15 minutes · leave whenever you like',
}

/** The closing card shown after the last section. */
export const MIRACLE_OUTRO = {
  title: 'Hope has a history',
  body: [
    'Fourteen times, in fourteen very different kinds of trouble, hope showed up exactly when it was needed, and not one moment sooner.',
    'None of these stories erase the hard part. The sea was still terrifying to stand in front of. The tomb still smelled of death. The storm was still real while it lasted. The hope in each one isn\'t that the hard thing never happened — it\'s that the hard thing didn\'t get the final word.',
    'If you\'re in the middle of something that feels impossible right now, that\'s the exact place every person in this tour started too.',
  ],
  passage: ref('ROM', 'Romans', '15', 13, 13),
  quote:
    'Now may the God of hope fill you with all joy and peace in believing, that you may abound in hope in the power of the Holy Spirit.',
  furtherReading: [
    ref('LAM', 'Lamentations', '3', 22, 23),
    ref('PSA', 'Psalms', '121', 1, 2),
    ref('ISA', 'Isaiah', '41', 10, 10),
  ],
}

/* ---------------------------------------------------------------------------
 * Step sequence — mirrors TourStep in lib/guidedTour.ts, with "section"
 * standing in for "moment" and "miracle" standing in for "voice".
 * ------------------------------------------------------------------------- */

export type MiracleTourStep =
  | { kind: 'welcome' }
  | { kind: 'section-intro'; sectionIndex: number }
  | { kind: 'miracle'; sectionIndex: number; miracleIndex: number }
  | { kind: 'section-synthesis'; sectionIndex: number }
  | { kind: 'outro' }

export const MIRACLE_STEPS: MiracleTourStep[] = [
  { kind: 'welcome' },
  ...TESTAMENT_SECTIONS.flatMap((section, sectionIndex) => [
    { kind: 'section-intro' as const, sectionIndex },
    ...section.miracles.map((_, miracleIndex) => ({
      kind: 'miracle' as const,
      sectionIndex,
      miracleIndex,
    })),
    { kind: 'section-synthesis' as const, sectionIndex },
  ]),
  { kind: 'outro' },
]

/** Index of the first step of a given section, used by "skip this section". */
export function firstStepOfSection(sectionIndex: number): number {
  return MIRACLE_STEPS.findIndex(
    (s) => s.kind === 'section-intro' && s.sectionIndex === sectionIndex,
  )
}

/** The section a step belongs to, or null for the welcome and closing cards. */
export function sectionIndexOfStep(step: MiracleTourStep): number | null {
  return step.kind === 'welcome' || step.kind === 'outro'
    ? null
    : step.sectionIndex
}

/** The passage a step should open in the reader, if any. */
export function passageOfMiracleStep(step: MiracleTourStep): PassageRef | null {
  switch (step.kind) {
    case 'miracle':
      return TESTAMENT_SECTIONS[step.sectionIndex].miracles[step.miracleIndex]
        .passage
    case 'section-synthesis':
      return TESTAMENT_SECTIONS[step.sectionIndex].synthesis.passage
    case 'outro':
      return MIRACLE_OUTRO.passage
    default:
      return null
  }
}

/** Re-export so components only need one place to build reader targets. */
export { chapterIdOf }

/* ---------------------------------------------------------------------------
 * Narration
 * ------------------------------------------------------------------------- */

export function narrationForMiracleStep(step: MiracleTourStep): string[] {
  switch (step.kind) {
    case 'welcome':
      return [MIRACLE_INTRO.title, MIRACLE_INTRO.subtitle, ...MIRACLE_INTRO.body]

    case 'section-intro': {
      const section = TESTAMENT_SECTIONS[step.sectionIndex]
      return [
        `Section ${step.sectionIndex + 1} of ${TESTAMENT_SECTIONS.length}. ${section.title}, ${section.subtitle}.`,
        section.intro,
      ]
    }

    case 'miracle': {
      const miracle =
        TESTAMENT_SECTIONS[step.sectionIndex].miracles[step.miracleIndex]
      return [
        `${miracle.title}. ${miracle.location}.`,
        `Reading ${miracle.passage.label}.`,
        `${miracle.quote} ${miracle.quoteRef}.`,
        miracle.whatHappened,
        miracle.hopeMeaning,
        'Something to consider.',
        miracle.reflectionQuestion,
      ]
    }

    case 'section-synthesis': {
      const { synthesis } = TESTAMENT_SECTIONS[step.sectionIndex]
      return [
        synthesis.heading,
        ...synthesis.patterns,
        synthesis.reflection,
        `${synthesis.quote} ${synthesis.passage.label}.`,
      ]
    }

    case 'outro':
      return [
        MIRACLE_OUTRO.title,
        ...MIRACLE_OUTRO.body,
        `${MIRACLE_OUTRO.quote} ${MIRACLE_OUTRO.passage.label}.`,
      ]
  }
}

/* ---------------------------------------------------------------------------
 * Accent colours — one per testament rather than one per item, since every
 * miracle in a section is a variation on the same hope rather than a
 * distinct viewpoint. Full class strings so Tailwind's scanner can see them.
 * ------------------------------------------------------------------------- */

export interface TestamentAccent {
  badge: string
  rule: string
  chip: string
  dot: string
}

export const TESTAMENT_ACCENTS: Record<TestamentId, TestamentAccent> = {
  old: {
    badge:
      'bg-yellow-100 text-yellow-900 ring-yellow-500/40 dark:bg-yellow-950/60 dark:text-yellow-100 dark:ring-yellow-400/40',
    rule: 'border-yellow-500/70 dark:border-yellow-400/60',
    chip:
      'bg-yellow-100/80 text-yellow-900 dark:bg-yellow-950/50 dark:text-yellow-100',
    dot: 'bg-yellow-600 dark:bg-yellow-400',
  },
  new: {
    badge:
      'bg-teal-100 text-teal-900 ring-teal-500/40 dark:bg-teal-950/60 dark:text-teal-100 dark:ring-teal-400/40',
    rule: 'border-teal-600/70 dark:border-teal-400/60',
    chip: 'bg-teal-100/80 text-teal-900 dark:bg-teal-950/50 dark:text-teal-100',
    dot: 'bg-teal-700 dark:bg-teal-400',
  },
}
