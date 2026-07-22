# Romans capitalization pass

Contextual capitalization for the entire book of Romans (chapters 1–16), applied 2026-07-22.

## Method

- Manual rule set from `docs/capitalization-style-guide.md`
- Applied via `scripts/apply-romans-capitalization.js` (28+ replacements)
- Validated with gold files in `scripts/gold/`

## Highlights by chapter

| Chapter | Key fixes |
|---------|-----------|
| **1** | God’s promise / invisible attributes → He, His |
| **2** | True Jew is **he**, not He (human category) |
| **4** | Abraham **he** vs God **He/Him** who justifies |
| **6** | United with Christ → Him, His |
| **8** | Golden chain (He foreknew…), Spirit **Himself**, v9 he/He disambiguation |
| **9** | *(pilot — see romans-9-capitalization-pilot.md)* |
| **10** | Believe/call on **Him** (Lord/Christ) |
| **11** | Elijah **he**; doxology **Him** (God) |
| **13** | Human rulers → **he**, not He |
| **14** | Weak/strong believers → **him/he** (removed script over-capitalization) |
| **15** | Scripture quotes → **He/Him** for Christ |

## Validate

```bash
node scripts/validate-capitalization.js
```

## Next batch

Pauline epistles: 1 Corinthians → Philemon, then Gospels.
