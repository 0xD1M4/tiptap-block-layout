import type { EditorView } from '@tiptap/pm/view'

type TRect = { top: number; left: number; width: number; height: number }

export function createDropareaColumns(dropareaWidth = 3) {
  const dropareaHalfWidth = dropareaWidth / 2

  return {
    handleBetweenColumnsDrag(
      e: DragEvent,
    ): undefined | { leftColumnDomNode: Element; rect: TRect } {
      const target = e.target as null | HTMLElement
      const targetType = target?.dataset.type

      if (targetType === 'column-resizer') {
        const leftColumnDomNode = target!.parentElement!
        const rect = this.getBetweenColumnsDroparea(leftColumnDomNode)

        return rect && { leftColumnDomNode, rect }
      }

      if (targetType !== 'columns') return

      for (const child of target!.children) {
        const rightRect = child.getBoundingClientRect()
        if (rightRect.bottom - 1 < e.clientY) return
        if (rightRect.top + 1 > e.clientY) return
        if (rightRect.left + 1 < e.clientX) continue

        const leftColumnDomNode = child.previousElementSibling
        if (!leftColumnDomNode) return

        const rect = this.getBetweenColumnsDroparea(leftColumnDomNode)
        return rect && { leftColumnDomNode, rect }
      }
    },

    getBetweenColumnsDroparea(leftColumnDomNode: Element): undefined | TRect {
      const rightColumnDomNode = leftColumnDomNode.nextElementSibling
      if (!rightColumnDomNode) return

      const leftRect = leftColumnDomNode.getBoundingClientRect()
      const rightRect = rightColumnDomNode.getBoundingClientRect()

      return {
        top: leftRect.top,
        left: (rightRect.left + leftRect.right) / 2 - dropareaHalfWidth,
        height: leftRect.height,
        width: dropareaWidth,
      }
    },

    handleSideColumnDrag(
      view: EditorView,
      e: DragEvent,
    ):
      | undefined
      | {
          dropTargetDomNode: HTMLElement
          side: 'left' | 'right'
          rect: TRect
        } {
      // NOTE: Continuing only if drag event is happening on the side of the document
      // This can be checked by making sure that cursor is over currentTarget
      if (e.target !== e.currentTarget) return

      const node = view.dom.firstElementChild
      const rect = node!.getBoundingClientRect()

      let left = 0
      let side = null as null | 'left' | 'right'

      if (rect.left - e.clientX > 20) {
        side = 'left'
        left = rect.left + 1
      } else if (e.clientX - rect.right > 8) {
        side = 'right'
        left = rect.right - 1
      }

      if (!side) return

      const columnSide = this.getColumnSideDroparea(view, { left, top: e.clientY }, side)
      return columnSide && { dropTargetDomNode: columnSide.node, rect: columnSide.rect, side }
    },
    getColumnSideDroparea(
      view: EditorView,
      coords: { left: number; top: number },
      side: 'left' | 'right',
    ) {
      const pos = view.posAtCoords(coords)
      if (!pos) return

      let node = view.nodeDOM(pos.inside) as null | HTMLElement
      if (!node) return

      const listDomNode = node.closest('.tiptap > ol, .tiptap > ul') as null | HTMLElement
      if (listDomNode) {
        node = listDomNode
      } else if (node.dataset.type === 'column') {
        node = node.parentElement!
      }

      // if (BlockActions.ctx.hovered?.blockDomNode === node) {
      if (node.classList.contains('ProseMirror-selectednode')) {
        return
      }

      const nodeRect = node.getBoundingClientRect()

      return {
        node,
        rect: {
          top: nodeRect.top,
          left: side === 'left' ? nodeRect.left - 5 : nodeRect.right + 2,
          width: dropareaWidth,
          height: nodeRect.height,
        },
      }
    },
  }
}
