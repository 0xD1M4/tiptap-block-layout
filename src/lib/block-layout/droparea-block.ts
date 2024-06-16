import type { EditorView } from '@tiptap/pm/view'
import type { Node } from '@tiptap/pm/model'
import { getDomNodeLeftOffset } from './utils.js'

type TRect = { top: number; left: number; width: number; height: number }

export function createDropareaBlock(dropareaWidth = 5) {
  const dropareaHalfWidth = dropareaWidth / 2

  return {
    handleBlockDrag(
      view: EditorView,
      e: DragEvent,
    ): undefined | { pos: number; node: Node; domNode: HTMLElement; rect: TRect } {
      const $pos = view.posAtCoords({ top: e.clientY, left: e.clientX })
      if (!$pos) return

      let domNode = (
        $pos.inside === -1 ? view.dom : view.nodeDOM($pos.inside)
      ) as null | HTMLElement

      if (domNode === view.dom) {
        domNode = ($pos.pos <= 0 ? domNode.firstChild : domNode.lastChild) as null | HTMLElement
      }

      if (!domNode) return

      const pos = view.posAtDOM(domNode, 0) - 1
      const node = view.state.doc.nodeAt(pos)

      if (!node) return

      return this.getBlockDroparea({ pos, node, domNode }, e.clientY)
    },
    getBlockDroparea(block: { pos: number; node: Node; domNode: HTMLElement }, mouseY: number) {
      let { pos, node, domNode } = block
      const { right, left, top, bottom } = domNode.getBoundingClientRect()
      const isTopHalf = mouseY < (top + bottom) / 2

      const leftOffset = node.type.name === 'listItem' ? getDomNodeLeftOffset(domNode) : 0

      if (node.type.name === 'column') {
        pos += isTopHalf ? 1 : -1
      }

      return {
        node,
        domNode,

        pos: isTopHalf ? pos : pos + node.nodeSize,

        rect: {
          left: left - leftOffset,
          top: (isTopHalf ? top : bottom) - dropareaHalfWidth,
          width: right - left + leftOffset,
          height: dropareaHalfWidth,
        },
      }
    },
  }
}
