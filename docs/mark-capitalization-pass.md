# Mark capitalization pass

Applied 2026-07-22 via `scripts/apply-mark-capitalization.js` (explicit fixes + programmatic Jesus narrative rules).

## Approach

Mark uses lowercase `he` throughout WEB narrative for Jesus. This pass capitalizes **He/Him/His** when the referent is Jesus, while keeping lowercase for humans (John the Baptist, demoniac, Bartimaeus, leper, Pilate, Joseph of Arimathea, etc.).

## Pilot chapters (style guide)

| Chapter | Key distinction |
|---------|-----------------|
| **2:8** | Jesus perceives in **His spirit** (not Holy Spirit) |
| **5:6–8** | Demoniac → **he**; Jesus commands → **He said to him** |
| **5:30** | Power went out from **Him** — **Himself** |
| **8:12** | **He** sighed deeply in **His spirit** |

## Notable fixes

- Passion narrative (14–15): **He/Him/His** for Jesus; centurion and Joseph stay lowercase
- **10:47–52** Bartimaeus: all **he/him** (human)
- **1:45** Leper went out: **he** not He
- **1:25** Demon cast out: **him** not Him

## Validate

```bash
node scripts/validate-capitalization.js
```

Gold chapters: Mark 2, Mark 5.

## Next

Matthew, Luke, John, Acts.
