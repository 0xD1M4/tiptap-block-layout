# tiptap-block-layout

> Block layout support for Tiptap 2: global drag handler, new column on side drop, resizable columns.

## Installation

```bash
pnpm add tiptap-block-layout
```

## Usage

```js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import BlockLayout, { Columns, Column } from 'tiptap-block-layout'

new Editor({
  element: document.querySelector('.element'),
  extensions: [
    StarterKit.configure({
      dropcursor: false,
      gapcursor: false,
    }),
    Columns,
    Column,
    BlockLayout,
  ],
  content: '<p>Hello World!</p>',
})
```

## TODO

- [x] Global block controls (incl. drag handler)
- [x] Block's drop zone
- [x] Columns resizing
- [x] Creating columns by dropping blocks on left/right side and in-between columns
- [x] Support sublist item's drop on the column
- [x] BUG: Column drop on itself results in column deletion
- [ ] TODO: Correctly unwrap list when dragged out of column
