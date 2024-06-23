import type { EditorView } from '@tiptap/pm/view'
import type { Node } from '@tiptap/pm/model'
import { getDomNodeLeftOffset } from './utils.js'

type TRect = { top: number; left: number; width: number; height: number }

type TDropBlock = { pos: number; node: Node; domNode: HTMLElement; rect: TRect }

export function createDropareaBlock(dropareaWidth = 5) {
  const dropareaHalfWidth = dropareaWidth / 2

  return {
    handleBlockDrag(view: EditorView, e: DragEvent): undefined | TDropBlock {
      const bottomColumnsBlock = this.handleBottomColumnsDrag(view, e)
      if (bottomColumnsBlock) return bottomColumnsBlock

      const $pos = view.posAtCoords({ top: e.clientY, left: e.clientX })
      if (!$pos) return

      let domNode = (
        $pos.inside === -1 ? view.dom : view.nodeDOM($pos.inside)
      ) as null | HTMLElement

      if (domNode === view.dom) {
        domNode = ($pos.pos <= 0 ? domNode.firstChild : domNode.lastChild) as null | HTMLElement
      }

      if (!domNode) return

      let pos = $pos.pos === 0 ? 0 : view.posAtDOM(domNode, 0)
      if (pos < 0) return

      let node = view.state.doc.nodeAt(pos)
      if (!node || node.isBlock === false) {
        node = pos > 0 ? view.state.doc.nodeAt(--pos) : null
      }

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

    handleBottomColumnsDrag(view: EditorView, e: DragEvent): undefined | TDropBlock {
      const target = e.target as null | HTMLElement
      const columnsNode = target?.closest('[data-type="columns"]') as null | HTMLElement
      if (!columnsNode) return

      const { bottom } = columnsNode.getBoundingClientRect()
      if (e.clientY < bottom - 3 || e.clientY > bottom + 4) return

      let pos = view.posAtDOM(columnsNode, 0)
      if (pos < 0) return

      let node = view.state.doc.nodeAt(pos)

      if (node?.type.name === 'columns') {
        pos += 1
      } else if (pos > 0 && node?.type.name === 'column') {
        node = view.state.doc.nodeAt(pos - 1)
      } else {
        return
      }

      if (!node) return

      return this.getBlockDroparea({ pos, node, domNode: columnsNode }, e.clientY)
    },
  }
}
