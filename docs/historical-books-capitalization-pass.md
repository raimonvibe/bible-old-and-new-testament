# Historical books capitalization pass (Joshua–Esther)

Applied 2026-07-22 via conservative OT rules after the Torah pass.

## Problem

Historical narrative often mentions Yahweh in the same sentence as human actors (Joshua, David, Elisha). Blanket “divine-only sentence” capitalization wrongly elevates **He** for humans (e.g. Joshua **He** caused Yahweh’s ark to go around the city).

## Approach

1. **`scripts/lib/ot-capitalization-rules.js`** — improvements:
   - **`conservative` mode** — capitalize subject pronouns only after God/Yahweh in the clause (no blanket divine-only pass).
   - **Sentence-wide human check** — if a human name appears anywhere before the pronoun in the sentence, keep lowercase (fixes “Joshua tore… before Yahweh’s ark… **he** and the elders”).
   - Expanded **HUMAN_OR_CREATURE** for judges, kings, elders, Israel, etc.
2. **`scripts/apply-historical-capitalization.js`** — Joshua through Esther; explicit post-pass fixes where quoted divine speech needs **He** despite a human speaker in the sentence.

## Pilot chapters

| Chapter | Key distinction |
|---------|-----------------|
| **Joshua 1** | **He has given you** / **He was with Moses** (God); Moses gave you (human context, no cap) |
| **Joshua 7** | Joshua **he and the elders** before Yahweh’s ark |
| **Joshua 8** | **He commanded Joshua** (Yahweh); Joshua burned Ai (**he** human) |
| **1 Kings 8** | Solomon quotes: Yahweh **He would dwell**; Solomon **he said** |

## Notable patterns

- Military narrative: Joshua/David **he** struck, **he** left remaining — lowercase even when “as Yahweh commanded” follows.
- Divine quote within human speech: explicit fix for “Yahweh has said that **He** would dwell”.
- **him** stays lowercase for human objects (same as Torah).

## Validate

```bash
node scripts/validate-capitalization.js
```

Gold chapters: Joshua 1, 7, 8; 1 Kings 8.

## Next

OT Prophets (Isaiah–Malachi), then the final sentence-initial pass documented in `docs/final-sentence-capitalization-pass.md`.
