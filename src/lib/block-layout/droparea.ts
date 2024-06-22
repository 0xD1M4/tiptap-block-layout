import type { EditorView } from '@tiptap/pm/view'
import type { Node } from '@tiptap/pm/model'
import { createDropareaColumns } from './droparea-columns.js'
import { createDropareaBlock } from './droparea-block.js'

type TSideColumn = {
  dropTargetDomNode: Element
  side: 'left' | 'right'
}

type TBetweenColumns = {
  leftColumnDomNode: Element
}

type TBlock = {
  node: Node
  domNode: HTMLElement
  pos: number
}

const DEFAULT_CTX = { sideColumn: null, betweenColumns: null, block: null } as {
  sideColumn: null | TSideColumn
  betweenColumns: null | TBetweenColumns
  block: null | TBlock
}

export function createDroparea(color = '#000000') {
  const dropareaWidth = 5

  let domNode = null as null | HTMLElement

  const DropareaBlock = createDropareaBlock(dropareaWidth)
  const DropareaColumns = createDropareaColumns()
  const ctx = { ...DEFAULT_CTX }

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

      const hide = () => this.hide()
      window.addEventListener('scroll', hide)
      window.addEventListener('dragend', hide)

      return {
        destroy: () => {
          window.removeEventListener('scroll', hide)
          window.removeEventListener('dragend', hide)
          domNode?.remove?.()
          domNode = null
        },
      }
    },

    hide() {
      ctx.betweenColumns = null
      ctx.sideColumn = null

      domNode?.classList.add('hidden')
    },
    show() {
      domNode?.classList.remove('hidden')
    },

    onDocumentDrop() {
      this.hide()
    },

    applyCtx<GCtxKey extends keyof typeof ctx>(key: GCtxKey, value: (typeof ctx)[GCtxKey]) {
      Object.assign(ctx, DEFAULT_CTX, { [key]: value })
    },

    onDocumentDragOver(view: EditorView, e: DragEvent) {
      if (view.editable === false) return

      const sideColumn = DropareaColumns.handleSideColumnDrag(view, e)
      if (sideColumn) {
        this.applyCtx('sideColumn', sideColumn)
        return this.drawRect(sideColumn.rect)
      }
      ctx.sideColumn = null

      const betweenColumns = DropareaColumns.handleBetweenColumnsDrag(e)
      if (betweenColumns) {
        this.applyCtx('betweenColumns', betweenColumns)
        return this.drawRect(betweenColumns.rect)
      }
      ctx.betweenColumns = null

      const block = DropareaBlock.handleBlockDrag(view, e)
      if (block) {
        this.applyCtx('block', block)
        return this.drawRect(block.rect)
      }
      ctx.block = null

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
