# Prophets capitalization pass (Isaiah–Malachi)

Applied 2026-07-22 via a split approach after Torah, Historical, and Poetry passes.

## Problem

Prophetic books mix oracle poetry (Isaiah 40), vision narrative (Ezekiel 8), and human-centered story (Jonah, Daniel). One rule set does not fit all: poetry carry-forward over-caps Jonah (**He** went down to Joppa); conservative rules miss Isaiah 40 (**He** will feed His flock).

## Approach

1. **`scripts/lib/ot-capitalization-rules.js`**
   - `applyOtProphetPoetryRules()` — poetry carry-forward with prophet-specific human guards (Hezekiah, Nebuchadnezzar, Sennacherib, king of Assyria, etc.).
   - `applyOtProphetRules(content, { conservative })` — conservative narrative rules for Daniel and Jonah only.
2. **`scripts/apply-prophets-capitalization.js`**
   - **Conservative**: Daniel, Jonah
   - **Oracle/poetry**: Isaiah, Jeremiah, Lamentations, Ezekiel, Hosea, Joel, Amos, Obadiah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi

## Pilot chapters

| Chapter | Key distinction |
|---------|-----------------|
| **Isaiah 40** | **He** will feed **His** flock (God across poetic lines) |
| **Isaiah 37** | Assyrian king **he** will not come; Hezekiah **he** tore his clothes |
| **Jonah 1** | Jonah **he** went down / **he** said (human narrative) |
| **Ezekiel 8** | **Then He said** to me (Yahweh in vision) |
| **Jeremiah 1** | Yahweh stretched out **His** hand |

## Notable patterns

- Oracle books: divine referent carries across verse chunks after “Yahweh says” or “Yahweh is my…”.
- Human guards block cap for named kings/prophets in narrative (Hezekiah, Nebuchadnezzar, Jonah).
- Quoted speech about the king of Assyria keeps **he** lowercase even when Yahweh speaks.

## Validate

```bash
node scripts/validate-capitalization.js
```

Gold chapters: Isaiah 37, 40; Jeremiah 1; Ezekiel 8; Jonah 1.

## Next

Final sentence-initial capitalization pass across the whole Bible (`docs/final-sentence-capitalization-pass.md`).
