# Final pass: sentence-initial capitalization

**When to run:** After the entire app is done — all OT and NT **reverential** capitalization passes complete (Law, History, Poetry, Prophets, Gospels, Acts, Epistles, Revelation).

**Purpose:** WEB keeps pronouns lowercase everywhere, including at sentence starts. Our reverential passes fix **who** gets He/Him/His (God vs human). This final pass fixes **where** ordinary English grammar requires a capital — the first word of each sentence — without undoing mid-sentence reverential rules.

These are **two separate layers:**

| Layer | Rule | Example |
|-------|------|---------|
| 1. Reverential (already done per book) | He/Him/His for God, Jesus, Spirit as Person | “…for **He** is God’s Son” |
| 2. Sentence-initial (this pass) | Capitalize first word of every sentence | “**He** said, …” (Paul at sentence start) |

---

## Scope

### Capitalize at sentence start

- The **first word** after a strong sentence boundary: **And**, **For**, **But**, **The**, **He**, etc.
- Boundaries used (safe): `.` `!` `?` then whitespace/quotes, and `[n]` verse markers
- **Not** bare newlines or semicolons (avoids breaking poetry/prophets line layout)

### Do NOT capitalize (keep as-is)

- **Mid-sentence** words (reverential and grammar): “…the multitude, **he** departed”
- **Divine speech exclusions:** Gen 1:26 “Let **us**… **our** image” (`us`/`our` never capitalized at sentence start)
- Words **inside nested quotes** that are mid-sentence in the quoted speech (context review)
- Proper nouns already capitalized
- Acrostic / poetry layout where WEB intentionally uses lowercase for literary form (Psalms, Song of Solomon — flag for manual review)

### Do not confuse with reverential caps

Sentence-initial **He** for Paul is **grammar**, not worship capitalization. Mid-sentence **he** for Paul stays lowercase. Both can appear in the same chapter (Acts 19).

---

## Sentence boundary detection (for script)

Chapter `content` strings use `[n]` verse markers and mixed `\n` spacing. Proposed boundaries:

1. **Strong breaks:** `. ` `! ` `? ` followed by a letter or `[`
2. **Verse starts:** `\[\d+\]\s+` when preceded by `.` `?` `!` or `\n` ending prior sentence
3. **Weak breaks (flag only):** `\n    ` poetry / dialogue continuations — do not auto-cap without review

**Exclude false positives:**

- Abbreviations: `Mr.`, `etc.`, `i.e.`, `No.` (context-dependent — use conservative list)
- Decimal numbers, verse references inside text
- Ellipsis `…` 
- Quoted speech continuing after `,”` — next sentence may start inside same verse

---

## Implementation plan

### Phase 1 — Audit script (read-only)

Create `scripts/audit-sentence-initial-caps.js`:

- Scan `data/old-testament-data.json` and `data/new-testament-data.json`
- Split into sentences using rules above
- Report candidates where first word matches `/^(he|him|his|she|her|they|them|it|we|us|our)\b/i` (lowercase)
- Output: book, chapter, verse ref, snippet, suggested fix
- `--json` flag for machine-readable report; default human-readable summary + counts

### Phase 2 — Apply script (conservative auto-fix)

Create `scripts/apply-sentence-initial-caps.js`:

- Only capitalize **first character** of sentence if it matches allowed lowercase starters
- **Never** change mid-sentence pronouns
- `--dry-run` default; `--apply` to write
- Skip chapters in `scripts/sentence-cap-exclude.json` (manual overrides, poetry pilots)

### Phase 3 — Manual review queue

Auto-fix will miss or mis-handle:

- Psalms / Proverbs / Song of Solomon (line breaks ≠ sentences)
- Prophetic oracle blocks
- Letters without verse-like sentence structure
- Acts 19-style: verify **They said** vs **he said** after dialogue line breaks

Export audit report → review flagged rows → add explicit fixes to gold files or exclude list.

### Phase 4 — Gold validation

Add gold files under `scripts/gold/sentence/` (or extend existing):

| File | Tests |
|------|--------|
| `acts-19-sentence.json` | **He** said (v3); **he** departed mid-sentence (v9); **They** said |
| `genesis-1-sentence.json` | Let **us** / **our** unchanged |
| `romans-9-sentence.json` | Mid-sentence **him** who wills unchanged |

Extend `scripts/validate-capitalization.js` to load gold from both `gold/` and `gold/sentence/` (or single catalog).

---

## Execution order (end of project)

```
1. Complete all book-by-book reverential passes
2. node scripts/audit-sentence-initial-caps.js > reports/sentence-audit.txt
3. Review top false-positive patterns; tune boundary rules
4. node scripts/apply-sentence-initial-caps.js --dry-run
5. Manual review of poetry / prophets sample
6. node scripts/apply-sentence-initial-caps.js --apply
7. node scripts/validate-capitalization.js  (reverential + sentence gold)
8. Spot-check in app UI (read-aloud, verse display)
9. Single commit: "Apply sentence-initial capitalization pass (final)"
```

**Do not** run sentence-initial pass before reverential work is finished — it would fight mid-sentence rules and create churn.

**Do not** re-run reverential regex scripts after this pass — only fix sentence starts.

---

## Success criteria

- [x] No sentence begins with lowercase `he`, `she`, `they`, `it` (except documented exclusions)
- [x] Mid-sentence human pronouns still lowercase (Rom 9:16, Acts 19:9)
- [x] Divine speech **us/our** still lowercase (Gen 1:26)
- [x] All existing reverential gold files still pass
- [x] New sentence gold files pass
- [ ] App read-aloud / display unchanged except corrected sentence starts

---

## Applied (2026-07-22)

**Pass 1 — pronouns:** 2,719 pronouns at sentence/verse starts.

**Pass 2 — all words (safe):** 3,388 additional words (`And`, `For`, `But`, `The`, …) using strong boundaries only.

```bash
node scripts/audit-sentence-initial-caps.js      # 0 remaining at safe boundaries
node scripts/apply-sentence-initial-caps.js --apply
node scripts/validate-capitalization.js            # 39 gold files
```

**Results:** 6,107 total sentence-start fixes; **0** lowercase words remain at safe boundaries.

**Safe rules:** only after `. ! ?` (skipping abbreviations) and `[n]` verse markers; **no** bare newline breaks (protects Psalms, Isaiah, etc.). Never capitalizes `us`/`our`.

---

## Related docs

- `docs/capitalization-style-guide.md` — reverential rules + sentence-initial section
- Per-book pass docs (`docs/*-capitalization-pass.md`)
