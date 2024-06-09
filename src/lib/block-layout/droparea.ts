import type { EditorView } from '@tiptap/pm/view'
import { createDropareaColumns } from './droparea-columns.js'
import { createDropareaBlock } from './droparea-block.js'

type TSideColumn = {
  dropTargetDomNode: Element
  side: 'left' | 'right'
}

type TBetweenColumns = {
  leftColumnDomNode: Element
}

export function createDroparea() {
  const dropareaWidth = 3
  const color = '#000000'

  let domNode = null as null | HTMLElement

  const DropareaBlock = createDropareaBlock(dropareaWidth)
  const DropareaColumns = createDropareaColumns(dropareaWidth)
  const ctx = {
    sideColumn: null as null | TSideColumn,
    betweenColumns: null as null | TBetweenColumns,
  }

  return {
    ctx,
    init(view: EditorView) {
      domNode = document.createElement('div')

      domNode.style.position = 'fixed'
      domNode.style.zIndex = '50'
      domNode.style.pointerEvents = 'none'
      domNode.style.background = color

      this.hide()
      view?.dom?.parentElement?.appendChild(domNode)

      const onScroll = () => this.hide()
      window.addEventListener('scroll', onScroll)

      return {
        destroy: () => {
          window.removeEventListener('scroll', onScroll)
          domNode?.remove?.()
          domNode = null
        },
      }
    },

    hide() {
      ctx.betweenColumns = null
      ctx.sideColumn = null

      domNode?.classList.add('hide')
    },
    show() {
      domNode?.classList.remove('hide')
    },

    onDocumentDrop() {
      this.hide()
    },

    onDocumentDragOver(view: EditorView, e: DragEvent) {
      if (view.editable === false) return

      const sideColumn = DropareaColumns.handleSideColumnDrag(view, e)
      if (sideColumn) {
        ctx.sideColumn = sideColumn
        return this.drawRect(sideColumn.rect)
      }
      ctx.sideColumn = null

      const betweenColumns = DropareaColumns.handleBetweenColumnsDrag(e)
      if (betweenColumns) {
        ctx.betweenColumns = betweenColumns
        return this.drawRect(betweenColumns.rect)
      }
      ctx.betweenColumns = null

      const block = DropareaBlock.handleBlockDrag(view, e)
      if (block) {
        return this.drawRect(block.rect)
      }

      return this.hide()
    },

    drawRect(rect: { left: number; top: number; width: number; height: number }) {
      if (!domNode) return

      domNode.style.left = rect.left / 1 + 'px'
      domNode.style.top = rect.top / 1 + 'px'
      domNode.style.width = rect.width / 1 + 'px'
      domNode.style.height = rect.height / 1 + 'px'

      this.show()
    },
  }
}
