# Read selection falls back to full page (bug + fix)

**Affects:** `ReadAloudToolbar` + `useReadAloud` + `lib/readAloud` (same pattern in [book-of-mormon](https://github.com/raimonvibe/book-of-mormon)).

## Symptom

User highlights text, clicks **Read selection**, and speech starts — but the **entire page** is read (all verses/sections), not only the highlight.

## Root cause

### 1. Click clears the browser selection

`mousedown` / `click` on the toolbar button moves focus to the button. `window.getSelection()` is then **collapsed** before `getSelectionChunk()` runs.

### 2. Silent fallback to page mode

In `hooks/useReadAloud.ts`, `start('selection')` did:

```ts
if (readMode === 'selection') {
  const selected = getSelectionChunk()
  if (selected) list = [selected]
  else activeMode = 'page'  // ← bug: user asked for selection, got full page
}

if (activeMode === 'page') {
  list = getReadableChunks(root)
}
```

So a failed selection read looked successful because full-page reading still started.

## Fix (apply in any project using this reader)

### A. Cache selection on `selectionchange` (`lib/readAloud.ts`)

- On each `selectionchange`, if selection is non-collapsed and inside `#main-content`, store `{ text, element }` in a module-level cache.
- `getSelectionChunk()`: use live selection first; if collapsed, return **cached** selection.

```ts
document.addEventListener('selectionchange', updateSelectionCache)
```

(Wire listener in `useReadAloud` mount / unmount.)

### B. Do not fall back to page mode (`hooks/useReadAloud.ts`)

```ts
if (readMode === 'selection') {
  const selected = getSelectionChunk()
  if (!selected) return false
  list = [selected]
} else {
  list = getReadableChunks(root)
}
```

Show hint: *"Highlight some text on the page first, then try again."*

### C. Preserve selection on button press (`ReadAloudToolbar.tsx`)

On the **Read selection** button:

```tsx
onPointerDown={(e) => e.preventDefault()}
```

Prevents focus steal that clears the highlight when possible.

## Verification

1. Open a chapter, highlight one verse or sentence.
2. Open Listen → **Read selection**.
3. Expect: **1 / 1** progress, status **(selection)**, only highlighted text spoken.
4. With nothing highlighted: hint shown, **no** speech (not full chapter).

## Files changed in bible-old-and-new-testament

- `lib/readAloud.ts` — cache + `updateSelectionCache()`
- `hooks/useReadAloud.ts` — listener, no page fallback
- `components/ReadAloudToolbar.tsx` — `onPointerDown` preventDefault

## book-of-mormon checklist

- [ ] Copy cache helpers into `lib/readAloud.ts`
- [ ] Register `selectionchange` in `hooks/useReadAloud.ts`
- [ ] Remove `else activeMode = 'page'` fallback in `start()`
- [ ] Add `onPointerDown` on Read selection button in `components/ReadAloudToolbar.tsx`
