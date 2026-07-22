# Luke, John, and Acts capitalization pass

Applied 2026-07-22 via book-specific scripts and `scripts/fix-luke-john-acts-followup.js`.

## Scripts

| Book | Script | Approach |
|------|--------|----------|
| **Luke** | `apply-luke-capitalization.js` | Explicit synoptic fixes + programmatic Jesus narrative rules |
| **John** | `apply-john-capitalization.js` | John 1 Logos explicit rules + programmatic ch. 3–21 + post-fixes |
| **Acts** | `apply-acts-capitalization.js` | Explicit Jesus/Christ references only (no blanket he→He) |

Shared programmatic rules: `scripts/lib/gospel-capitalization-rules.js`

## Key distinctions

### Luke
- Synoptic parallel to Mark/Matthew for ministry and passion
- **Luke 4** — temptation: **He** hungry; devil to **Him**; **Jesus answered him** (Satan)
- **Luke 15** — sinners came to **Him**; parable characters stay lowercase
- **Luke 18** — unjust judge and tax collector: **he**/**his** (not He/His)
- **Luke 23** — Herod **he**; Jesus **He**/**Him** in mockery and crucifixion

### John
- **John 1** — Word/Logos: **through Him**, **In Him was life**, **His glory**; John Baptist stays **he**
- **John 13–21** — **Jesus said to him** for Peter, Philip, Thomas, Judas, Pilate
- **John 14:23** — generic believer in Jesus' speech: **he will keep my word** (not He)
- **John 19** — **He went out, bearing His cross**

### Acts
- Narrative **he** = Peter, Paul, Stephen, etc. — do not capitalize
- **Acts 1** — ascension: **He commanded**, **He was taken up**, **received Him**
- **Acts 7** — Abraham: **he was in Mesopotamia** (human)
- **Acts 10** — **hanging Him on a tree** (Christ)

## Validate

```bash
node scripts/validate-capitalization.js
```

Gold chapters: Luke 4, John 1, Acts 1.

## Next

Old Testament (Law → Poetry → Prophets).
