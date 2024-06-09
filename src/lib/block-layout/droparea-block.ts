import type { EditorView } from '@tiptap/pm/view'
import type { Node } from '@tiptap/pm/model'
import { dropPoint } from '@tiptap/pm/transform'

type TRect = { top: number; left: number; width: number; height: number }

export function createDropareaBlock(dropareaWidth = 3) {
  const dropareaHalfWidth = dropareaWidth / 2

  return {
    handleBlockDrag(view: EditorView, e: DragEvent): undefined | { pos: number; rect: TRect } {
      const $pos = view.posAtCoords({ top: e.clientY, left: e.clientX })
      if (!$pos) return

      if ($pos.inside === -1 && $pos.pos === 0) {
        $pos.inside = 0
      }

      const node = $pos.inside >= 0 && view.state.doc.nodeAt($pos.inside)
      if (!node) return

      const isDisabled = checkIsDropCursorDisabled(view, e, node, $pos)
      if (isDisabled) return

      let { pos } = $pos
      if (view.dragging?.slice) {
        const point = dropPoint(view.state.doc, pos, view.dragging.slice)
        if (point !== null) pos = point
      }

      const rect = this.getBlockDroparea(view, pos)

      return rect && { pos, rect }
    },

    getBlockDroparea(view: EditorView, pos: number): undefined | TRect {
      const $pos = view.state.doc.resolve(pos)

      // Processing only block nodes
      if ($pos.parent.inlineContent) return

      const { nodeBefore, nodeAfter } = $pos
      if (!nodeAfter && !nodeBefore) return

      const domNode = view.nodeDOM(pos - (nodeBefore?.nodeSize ?? 0))
      if (!domNode) return

      const rect = (domNode as HTMLElement).getBoundingClientRect()

      return {
        left: rect.left,
        top: (nodeBefore ? rect.bottom : rect.top) - dropareaHalfWidth,
        width: rect.right - rect.left,
        height: dropareaHalfWidth,
      }
    },
  }
}

function checkIsDropCursorDisabled(
  view: EditorView,
  e: DragEvent,

  node: Node,
  $pos: ReturnType<EditorView['posAtCoords']>,
) {
  const disableDropCursor = node.type.spec.disableDropCursor

  return typeof disableDropCursor === 'function'
    ? disableDropCursor(view, $pos, e)
    : disableDropCursor
}
