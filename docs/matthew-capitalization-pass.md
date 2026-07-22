# Matthew capitalization pass

Applied 2026-07-22 via `scripts/apply-matthew-capitalization.js` (explicit fixes + programmatic Jesus narrative rules) and `scripts/fix-matthew-capitalization-followup.js` (human addressee and passion corrections).

## Approach

Matthew uses lowercase `he` throughout WEB narrative for Jesus. This pass capitalizes **He/Him/His** when the referent is Jesus, while keeping lowercase for humans (Herod, Joseph, John the Baptist, Peter when addressed, Judas, Pilate, Joseph of Arimathea, parable characters, etc.).

## Pilot chapters (style guide)

| Chapter | Key distinction |
|---------|-----------------|
| **5:1–2** | Sermon on the Mount — **He** sat down; **His disciples** came to **Him** |
| **17:2–3** | Transfiguration — **His** face and garments; Moses and Elijah with **Him** |
| **17:5** | Peter still speaking — **While he was still speaking** (human) |
| **26:34** | Jesus to Peter — **Jesus said to him** |
| **27:27–31** | Passion — soldiers mock **Him**; **His** head, **His** clothes |
| **27:42** | Mockery of Christ — **He saved others, but He can't save Himself** |

## Notable fixes

- **4:10** Satan — **him** not Him
- **8:3–7** Leper and centurion — Jesus **He/Him**; leper/servant **him**
- **11:2–3** John in prison — **he** sent; asks **Are you He who comes**
- **15:6** Pharisee corban quote — **he shall not honor his father** (human)
- **18:2** Little child — **set him** in the middle (not Him)
- **21:7** Triumphal entry — **He sat** on them (donkey)
- **26:47–58** Arrest — **While He was still speaking**; Peter's **his hand**; **followed Him**
- **27:54** Centurion's men — **with him** watching (soldiers, not Him)

## Validate

```bash
node scripts/validate-capitalization.js
```

Gold chapters: Matthew 5, Matthew 17.

## Next

Luke, John, Acts.
