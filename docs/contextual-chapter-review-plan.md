# Contextual Chapter Review Plan

Full-Bible capitalization review: read every chapter in context, decide referents, edit, and lock in tricky cases with gold files.

**Order:** First book of the Old Testament → last book of the New Testament (Protestant canon, as in this app).

| Start | End |
|-------|-----|
| **Genesis** | **Revelation** |

**Scope:** 66 books · **1,190 chapters** (OT 930 + NT 260)

**Style rules:** [capitalization-style-guide.md](./capitalization-style-guide.md)

**Why this plan:** Bulk scripts (`apply-*-capitalization.js`) cannot reliably judge referent across verse boundaries, implied divine subjects, legal speech, or parables. Genesis 5:2 (`he named` → `He named`) and Acts 25:19 (`against Him` → `against him`) are examples of errors only context catches.

---

## Principles

1. **Read before edit** — Read the entire chapter once before changing anything.
2. **Context over regex** — Ask *who is the grammatical subject or object?* not *does this verse contain “God”?*
3. **Minimal diffs** — Change only what the chapter requires.
4. **No re-running bulk scripts** on reviewed books — programmatic passes can undo careful fixes.
5. **Gold on hard verses** — Add `scripts/gold/<book>-<chapter>.json` when mixed referents make regression likely.
6. **Commit per book** (or small batch) — One book finished → validate → commit → push.

---

## Rules (quick reference)

| Form | When |
|------|------|
| **He / Him / His** | God, Jesus, or Holy Spirit as Person |
| **he / him / his** | Humans, animals, devil (unless clearly Christ), generic “man” |
| **Lord** | Divine title (God, Jesus, “the Lord”) |
| **lord** | Human master, noble, formal address (e.g. Festus → Caesar: “my lord”) |
| Sentence start after `. ! ?` or `[n]` | Capitalize first word (grammar — even for human subjects) |
| **us / our** in divine speech | Stay lowercase (Gen 1:26) |

When uncertain, prefer lowercase for pronouns and add a gold `mustContain` / `mustNotContain` pair after deciding.

---

## Workflow (per chapter)

```text
1. Load chapter (readable text, verse numbers visible)
2. Read full chapter in order
3. Flag every He/he, Him/him, His/his, Lord/lord — note referent
4. Apply edits to data/old-testament-data.json or data/new-testament-data.json
5. Add scripts/gold/<book>-<chapter>.json if tricky
6. Mark chapter reviewed in scripts/review/progress.json (when tracker exists)
7. After book complete: node scripts/validate-capitalization.js → commit → push
```

### What to watch for

**Likely under-capitalized (should be uppercase)**

- God continues as subject without repeating “God/Yahweh” in that verse (Gen 5:1–2).
- Relative clauses: “whom **he** had formed” when Yahweh formed (Gen 2:8).
- Poetry: implied divine “he” without the divine name in the same line (Ps 16:8).

**Likely over-capitalized (should be lowercase)**

- Human object in legal/narrative speech (“against **him**” = Paul, not Jesus — Acts 25:19).
- Quoted speech about a historical human (e.g. David in Jesus’ quote — Luke 6:3).
- Parable characters (landowner, king, steward) — usually lowercase.

**Often correct — do not “fix” blindly**

- Genealogy: “Adam… **he** became the father”.
- Passion narrative: “deliver **Him**” when Jesus is meant.
- Mixed referents in one verse when both are intentional: “**He** put the man whom **He** had formed” (both Yahweh).

---

## Book order and chapter counts

Review in this exact sequence. Check off each book when all chapters are reviewed.

### Old Testament (39 books · 930 chapters)

| # | Book | Chapters | Status |
|---|------|----------|--------|
| 1 | Genesis | 50 | ✓ reviewed |
| 2 | Exodus | 40 | ✓ reviewed |
| 3 | Leviticus | 27 | |
| 4 | Numbers | 36 | |
| 5 | Deuteronomy | 34 | |
| 6 | Joshua | 24 | |
| 7 | Judges | 21 | |
| 8 | Ruth | 4 | |
| 9 | 1 Samuel | 31 | |
| 10 | 2 Samuel | 24 | |
| 11 | 1 Kings | 22 | |
| 12 | 2 Kings | 25 | |
| 13 | 1 Chronicles | 29 | |
| 14 | 2 Chronicles | 36 | |
| 15 | Ezra | 10 | |
| 16 | Nehemiah | 13 | |
| 17 | Esther | 10 | |
| 18 | Job | 42 | |
| 19 | Psalms | 151 | |
| 20 | Proverbs | 31 | |
| 21 | Ecclesiastes | 12 | |
| 22 | Song of Solomon | 8 | |
| 23 | Isaiah | 66 | |
| 24 | Jeremiah | 52 | |
| 25 | Lamentations | 5 | |
| 26 | Ezekiel | 48 | |
| 27 | Daniel | 12 | |
| 28 | Hosea | 14 | |
| 29 | Joel | 3 | |
| 30 | Amos | 9 | |
| 31 | Obadiah | 1 | |
| 32 | Jonah | 4 | |
| 33 | Micah | 7 | |
| 34 | Nahum | 3 | |
| 35 | Habakkuk | 3 | |
| 36 | Zephaniah | 3 | |
| 37 | Haggai | 2 | |
| 38 | Zechariah | 14 | |
| 39 | Malachi | 4 | |

### New Testament (27 books · 260 chapters)

| # | Book | Chapters | Status |
|---|------|----------|--------|
| 40 | Matthew | 28 | |
| 41 | Mark | 16 | |
| 42 | Luke | 24 | |
| 43 | John | 21 | |
| 44 | Acts | 28 | |
| 45 | Romans | 16 | |
| 46 | 1 Corinthians | 16 | |
| 47 | 2 Corinthians | 13 | |
| 48 | Galatians | 6 | |
| 49 | Ephesians | 6 | |
| 50 | Philippians | 4 | |
| 51 | Colossians | 4 | |
| 52 | 1 Thessalonians | 5 | |
| 53 | 2 Thessalonians | 3 | |
| 54 | 1 Timothy | 6 | |
| 55 | 2 Timothy | 4 | |
| 56 | Titus | 3 | |
| 57 | Philemon | 1 | |
| 58 | Hebrews | 13 | |
| 59 | James | 5 | |
| 60 | 1 Peter | 5 | |
| 61 | 2 Peter | 3 | |
| 62 | 1 John | 5 | |
| 63 | 2 John | 1 | |
| 64 | 3 John | 1 | |
| 65 | Jude | 1 | |
| 66 | Revelation | 22 | |

---

## Phases (optional grouping)

Phases follow the same canonical order; they are milestones for commits and progress, not a change in sequence.

| Phase | Books | Chapters | Focus |
|-------|--------|----------|--------|
| **1** | Genesis – Deuteronomy | 187 | Creation summaries, Torah narrative, mixed divine/human |
| **2** | Joshua – Esther | 249 | Historical narrative, kings, Yahweh + humans |
| **3** | Job – Song of Solomon | 244 | Poetry, wisdom, implied divine “he” |
| **4** | Isaiah – Malachi | 250 | Prophets, oracles, kings vs Yahweh |
| **5** | Matthew – Acts | 117 | Gospels + Acts: Jesus, humans, parables, trials |
| **6** | Romans – Revelation | 143 | Epistles + Revelation: Christ, Lord/lord |

---

## Pilot: Genesis 1–11

Start here before continuing through the rest of Genesis.

| Chapter | Notes |
|---------|--------|
| Gen 1 | Creation; Gen 1:26 **us/our** lowercase |
| Gen 2 | Yahweh God; check “whom **He** had formed”, rib narrative |
| Gen 3 | Serpent, Adam, Eve; Yahweh speech |
| Gen 4–5 | Human genealogy; Gen 5:2 divine **He named** |
| Gen 6–9 | Flood; Gen 6:6 grief referent |
| Gen 10–11 | Nations, Babel, Abraham prelude |

Existing gold: `scripts/gold/genesis-1.json`, `genesis-2.json`, `genesis-3.json`, `genesis-5.json`.

---

## Session sizing

| Pace | Chapters / session | Approx. sessions for full Bible |
|------|-------------------|----------------------------------|
| Focused | 15–25 | 50–80 |
| Moderate | 8–15 | 80–150 |
| Light | 1 book (varies) | 66 book-sized sessions |

Prefer **one book per session** when chapters are few (Ruth, Jude, Philemon). Split long books (Genesis, Psalms, Isaiah) across multiple sessions.

---

## Quality gates

**After each book**

- [ ] Every chapter read in order
- [ ] Pronoun and Lord/lord audit done
- [ ] `node scripts/validate-capitalization.js` passes
- [ ] Commit message: `Contextual capitalization review: <Book>`
- [ ] Push to `main`

**After each phase**

- Spot-check 2–3 random chapters from the phase
- Update this doc: mark **Status** column for completed books

**When all 66 books are done**

- Full validation pass
- Update [capitalization-style-guide.md](./capitalization-style-guide.md) with any new edge-case rules discovered
- Do not re-run bulk `apply-*-capitalization.js` on reviewed data

---

## Supporting tooling (to add as review proceeds)

| File | Purpose |
|------|---------|
| `scripts/review/print-chapter.js` | Pretty-print one chapter for reading |
| `scripts/review/flag-chapter.js` | List pronouns and Lord/lord with verse refs |
| `scripts/review/progress.json` | Per-chapter `pending` / `reviewed` |
| `scripts/review/summary.js` | Progress % by book and testament |

Regex flag lists are **hints only** — always confirm by reading the chapter.

---

## Definition of done (per chapter)

- [ ] Full chapter read in canonical context
- [ ] Every flagged pronoun and Lord/lord resolved
- [ ] JSON updated
- [ ] Gold file added if verse is regression-prone
- [ ] Chapter marked reviewed in progress tracker

---

## Related docs

- [capitalization-style-guide.md](./capitalization-style-guide.md) — authoritative rules
- [torah-capitalization-pass.md](./torah-capitalization-pass.md) — earlier programmatic pass (do not re-run after review)
- `scripts/gold/` — validation fixtures
- `scripts/validate-capitalization.js` — run after edits

---

*Last updated: July 2026 · Review order: Genesis → Revelation*
