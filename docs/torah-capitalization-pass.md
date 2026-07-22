# Torah capitalization pass (Genesis–Deuteronomy)

Applied 2026-07-22 via contextual OT rules after reverting the Old Testament to a lowercase WEB baseline.

## Problem

The earlier `capitalize-divine-pronouns-conservative.js` script capitalized **every** pronoun in any verse mentioning God/Yahweh. That over-capitalized humans (e.g. Moses **He** led the flock; Joseph **He** was prosperous).

## Approach

1. **`scripts/revert-ot-baseline.js`** — reset OT pronouns to lowercase (OT file only; NT untouched).
2. **`scripts/lib/ot-capitalization-rules.js`** — verse/sentence rules:
   - **Divine-only** sentences → capitalize **He/His/Himself** (subject forms).
   - **Mixed** sentences → capitalize subject pronouns after God/Yahweh **unless** a human/creature name appears earlier in the clause.
   - Never capitalize **We/Us/Our** in divine speech (Gen 1:26 “our image”).
   - **him** stays lowercase unless explicit (usually human object).
3. **`scripts/apply-torah-capitalization.js`** — applies rules to Genesis through Deuteronomy.

## Pilot chapters (style guide)

| Chapter | Key distinction |
|---------|-----------------|
| **Genesis 1** | **He** called “night”; **He created him** (man lowercase) |
| **Genesis 2** | **His work**; **He rested** |
| **Genesis 3** | Serpent **he said**; Yahweh to Adam **said to him** |
| **Exodus 3** | Moses **he led**; angel appeared to **him** |

## Notable patterns

- Joseph/Pharaoh/Moses narratives: lowercase **he/him/his** when human is subject.
- Yahweh said to **him** (Moses, Abraham): human object stays lowercase.
- God–human mixed clauses: “Yahweh was with Joseph, and **he** was prosperous.”

## Validate

```bash
node scripts/validate-capitalization.js
```

Gold chapters: Genesis 1–3, Exodus 3.

## Next

Historical books (Joshua–Esther) — see `historical-books-capitalization-pass.md`. Next: Poetry, then Prophets.
