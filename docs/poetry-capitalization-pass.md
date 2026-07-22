# Poetry capitalization pass (Job–Song of Solomon)

Applied 2026-07-22 via poetry-aware OT rules after Torah and Historical passes.

## Problem

Poetry (especially Psalms) often uses **he/his** for God across line breaks without repeating Yahweh in every verse chunk. Standard verse-by-verse rules miss Psalms 23 (**He** makes me lie down). Wisdom texts also mix divine and human subjects (Proverbs 3, Ecclesiastes 8).

## Approach

1. **`scripts/lib/ot-capitalization-rules.js`** — `applyOtPoetryRules()`:
   - Run full OT sentence rules on each verse chunk (Torah-style, not conservative).
   - Track **divine vs human referent** across verse chunks in a chapter.
   - **Divine carry-forward**: after “Yahweh is my shepherd”, capitalize **he/his** in following chunks.
   - **Human guard**: decapitalize when chunk names Job, David, wicked, fool, “Blessed is the man”, etc.
   - Added **wicked/fool/sinner/sluggard** to human detection.
2. **`scripts/apply-poetry-capitalization.js`** — Job, Psalms, Proverbs, Ecclesiastes, Song of Solomon.

## Pilot chapters

| Chapter | Key distinction |
|---------|-----------------|
| **Psalms 23** | **He makes me lie down** / **His name’s sake** (Yahweh across verses) |
| **Psalms 1** | Blessed **man** → **he** will be like a tree (human) |
| **Psalms 46** | **He** makes wars cease (God) |
| **Proverbs 3** | Yahweh loves, **He** corrects |
| **Job 1** | Job’s **his possessions** (human narrative) |

## Notable patterns

- Psalm attributions (“A Psalm by David”) do not block divine referent from a later “Yahweh is my…”
- Job dialogue and narrative: **Job**/**he** lowercase; divine speech in Job still capped when Yahweh is subject.
- Ecclesiastes: **wicked**/**he** stays lowercase (“neither shall **he** lengthen days”).

## Validate

```bash
node scripts/validate-capitalization.js
```

Gold chapters: Psalms 1, 23, 46; Proverbs 3; Job 1.

## Next

OT Prophets (Isaiah–Malachi) — see `prophets-capitalization-pass.md`. Next: final sentence-initial pass.
