import type { Node } from '@tiptap/pm/model'
import { TextSelection, type EditorState, type Transaction } from 'prosemirror-state'

export const ZERO_WIDTH_JOINER = '‍'

const checkIsCustomInlineNode = (node?: Node | null) => node?.isInline && !node.isText

export function createInlineNodeCursor() {
  let isArrowLeftEvent = false

  return {
    onDocumentKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        isArrowLeftEvent = true
        return true
      }
    },

    appendTransaction(
      transactions: readonly Transaction[],
      prevState: EditorState,
      nextState: EditorState,
    ): null | Transaction {
      // NOTE: There is a selection, not a collapsed caret
      if (prevState.selection.$anchor !== prevState.selection.$head) {
        return null
      }

      let appended = null as null | Transaction

      appended = this.handleRedundantJoiner(transactions, prevState, nextState)
      if (appended) return appended

      const prevSelection = prevState.selection.$anchor
      const nextSelection = nextState.selection.$anchor

      const nextNode = nextSelection.doc.nodeAt(nextSelection.pos)

      if (isArrowLeftEvent) {
        isArrowLeftEvent = false

        const leftPos = prevSelection.pos - 1
        if (leftPos === nextSelection.pos) return null

        const leftNode = nextSelection.doc.nodeAt(leftPos)
        if (checkIsCustomInlineNode(leftNode)) {
          return this.insertJoiner(nextState.tr, leftPos)
        }
      }

      if (checkIsCustomInlineNode(nextNode)) {
        if (nextSelection.parentOffset === 0) {
          return this.insertJoiner(nextState.tr, nextSelection.pos)
        }

        const leftPos = nextSelection.pos - 1
        const leftNode = nextSelection.doc.nodeAt(leftPos)
        if (checkIsCustomInlineNode(leftNode)) {
          return this.insertJoiner(nextState.tr, nextSelection.pos)
        }
      }

      return appended
    },

    insertJoiner(tr: Transaction, pos: number) {
      tr = tr.insertText(ZERO_WIDTH_JOINER, pos)
      tr = tr.setSelection(TextSelection.create(tr.doc, pos))

      return tr
    },

    handleRedundantJoiner(
      transactions: readonly Transaction[],
      prevState: EditorState,
      nextState: EditorState,
    ) {
      const prevSelection = prevState.selection.$anchor
      const nextSelection = nextState.selection.$anchor

      let prevPos = prevSelection.pos
      const prevStateNode = prevState.doc.nodeAt(prevPos)

      const nextPos = nextSelection.pos
      const nextStateNode = nextState.doc.nodeAt(nextPos)

      if (prevStateNode === nextStateNode) return null

      if (prevStateNode?.text === ZERO_WIDTH_JOINER) {
        transactions.forEach((tr) => (prevPos = tr.mapping.map(prevPos)))

        const tr = nextState.tr.delete(prevPos, prevPos + 1)
        tr.setSelection(TextSelection.create(tr.doc, nextPos))

        return tr
      }

      return null
    },
  }
}
