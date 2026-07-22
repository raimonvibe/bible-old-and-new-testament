# Bible Capitalization Style Guide

This app uses the **World English Bible (WEB)** as its base text and applies **NASB/NKJV-style reverential capitalization** on top. Original Hebrew and Greek had no upper/lower case; every capital letter is an interpretive choice.

## Target style

Capitalize pronouns when they refer to:

- **God the Father**
- **Jesus Christ**
- **The Holy Spirit** (when treated as a Person)

Do **not** change WEB wording — capitalization only.

## Divine pronouns — capitalize

| Words | When |
|-------|------|
| `He`, `Him`, `His`, `Himself` | Referent is God, Jesus, or the Holy Spirit as Person |
| `You`, `Your`, `Yours` | Direct address **to** God or Christ (e.g. Psalms, prayer) — apply cautiously inside nested quotes |

## Divine pronouns — lowercase

| Case | Example |
|------|---------|
| Human antecedent | Rom 9:16 — “not of **him** who wills, nor of **him** who runs” |
| Named person | Abraham, Moses, Pharaoh, Paul, Jacob, Esau |
| Generic man | “if a man walks in the day, **he** doesn’t stumble” |
| Believers / groups | “us, whom **He** also called” — **us** stays lowercase; **He** (God) is capitalized |
| Demonic / animal | Usually lowercase unless clearly referring to Jesus |

## Sentence-initial pronouns (English grammar)

Capitalize the first word of a sentence normally — including pronouns — even when the referent is human:

- Acts 19:3 — **He** said, “Into what then were you baptized?” (Paul; sentence start)
- Mid-sentence, same human — lowercase: “…the multitude, **he** departed from them” (Acts 19:9)

This is **grammar**, not reverential capitalization. Do not lowercase sentence-initial pronouns to match WEB’s all-lowercase habit.

## First person plural — do NOT capitalize

Keep `We`, `Us`, `Our` lowercase even in divine speech:

- Gen 1:26 — “Let **us** make man in **our** image”
- Paul’s “we” and congregation speech

## Spirit vs spirit

| Capitalize `Spirit` | Lowercase `spirit` |
|---------------------|-------------------|
| Holy Spirit as Person | Human spirit / inner disposition |
| `Holy Spirit`, `Spirit of God`, `Spirit of Christ` | “poor in spirit”, “spirit is willing” |
| Prophetic “in the Spirit” (Rev 1:10, 21:10) | Flesh vs spirit contrast (Gal 5, Rom 7) |
| | Jesus’ human spirit: “in **His** spirit” (Mark 2:8) — **His** divine, **spirit** human |

When uncertain, prefer lowercase and add to the flagged-verses list for manual review.

## Already correct — do not change

- Proper names and titles: God, Yahweh, Jesus, Christ, Lord (when divine)
- `Son of God`, `Son of Man` (established title patterns)
- Existing WEB `Spirit` where clearly the Holy Spirit

## Hard zones (extra review)

1. **Coronation psalms** — earthly king vs Messiah (Ps 2, 45)
2. **OT theophanies** — Angel of Yahweh
3. **Quoted OT inside NT** — track referent inside the quote
4. **Same-verse referent switch** — Rom 9:16, Rom 4:2, Rom 8:29–34
5. **Hostile speech about Jesus** — NASB still capitalizes based on who Jesus **is**; we follow NASB unless noted

## Workflow

1. Revert chapter to WEB baseline pronouns if needed (`scripts/revert-divine-pronouns.js` — whole file only at start)
2. AI/contextual review per chapter using this guide
3. Record changes with verse-level reasons
4. Run `node scripts/validate-capitalization.js` for gold chapters
5. Do **not** re-run regex capitalize scripts after AI pass
6. **Final sentence-initial pass** — complete; see `docs/final-sentence-capitalization-pass.md`

## Gold-standard pilot chapters

| Chapter | Why |
|---------|-----|
| **Romans 9** | Mixed theology, human vs divine pronouns in same verse |
| Romans 8 | Spirit/flesh, long divine discourse |
| Genesis 1–3 | “Let us”, Eden narrative |
| Mark 2 + 5 | Jesus’ spirit vs Holy Spirit; demoniac |
| Galatians 5 | Spirit vs spirit debate |

## References

- [WEB FAQ — why pronouns are lowercase](https://ebible.org/eng-web/webfaq.htm)
- [Bill Mounce — divine pronoun capitalization debate](https://zondervanacademic.com/blog/should-we-capitalize-divine-pronouns-mondays-with-mounce-305)
- [Wartburg Project — Spirit vs spirit in Gal 5](https://wartburgproject.org/faqs/2022/07/capitalizing-spirit-in-galatians-5)
