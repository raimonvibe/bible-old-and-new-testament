# Divine pronoun capitalization scripts

These scripts adjust He/Him/His/Himself in the Bible JSON so that only pronouns referring to God or Jesus are capitalized.

## Commands to run (in order)

Run from the **project root** (parent of `scripts` and `data`):

```bash
# 1. Back up data first (e.g. copy data/*.json or commit to git)

# 2. Optional: dry-run to see effect without writing
node scripts/revert-divine-pronouns.js --dry-run
node scripts/capitalize-divine-pronouns-conservative.js --dry-run
node scripts/uncapitalize-human-pronouns.js --dry-run

# 3. Run for real — in this exact order
node scripts/revert-divine-pronouns.js
node scripts/capitalize-divine-pronouns-conservative.js
node scripts/uncapitalize-human-pronouns.js
```

Or from the **scripts** folder:

```bash
cd scripts
node revert-divine-pronouns.js
node capitalize-divine-pronouns-conservative.js
node uncapitalize-human-pronouns.js
```

Order matters: revert → conservative capitalize → uncapitalize human. Do not skip steps or reorder.

## Scripts

| Script | Purpose |
|--------|--------|
| `revert-divine-pronouns.js` | Sets all He/Him/His/Himself to lowercase. Use to start from a clean slate. |
| `capitalize-divine-pronouns-conservative.js` | Capitalizes only in verses that contain a divine referent (God, Yahweh, Jesus, etc.). Does **not** capitalize the following verse (reduces false positives). |
| `uncapitalize-human-pronouns.js` | (1) Lowercases He/Him/His/Himself in verses with no divine referent. (2) Applies a list of phrase replacements where the pronoun clearly refers to a human (e.g. “the man and His wife” → “his wife”). |

## Dry run

Each script supports `--dry-run` (no files written):

```bash
node revert-divine-pronouns.js --dry-run
node capitalize-divine-pronouns-conservative.js --dry-run
node uncapitalize-human-pronouns.js --dry-run
```

## Original script

`capitalize-divine-pronouns.js` is the original script (capitalizes in divine verses **and** the next verse). It over-capitalizes when the subject switches to a human. Prefer the conservative script + uncapitalize pass instead.
