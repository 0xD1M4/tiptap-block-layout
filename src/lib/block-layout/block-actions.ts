import type { Node } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'

import { getDomNodeLeftOffset } from './utils.js'

export function createBlockActions() {
  const ctx = {
    domNode: null,
    hovered: null,
  } as {
    domNode: null | HTMLElement
    hovered: null | {
      blockDomNode: HTMLElement
      blockNode: Node
      posOfBlockNode: number
    }
  }

  return {
    ctx,
    init(view: EditorView) {
      ctx.domNode = document.createElement('div')
      ctx.domNode.classList.add('global-drag-actions', 'hidden')

      view?.dom?.parentElement?.appendChild(ctx.domNode)

      const onScroll = () => this.hide()
      window.addEventListener('scroll', onScroll)

      return {
        destroy: () => {
          window.removeEventListener('scroll', onScroll)
          ctx.domNode?.remove?.()
          ctx.domNode = null
        },
      }
    },
    hide() {
      ctx.hovered = null
      ctx.domNode?.classList.add('hidden')
    },
    show(hovered: NonNullable<(typeof ctx)['hovered']>) {
      ctx.hovered = hovered
      ctx.domNode?.classList.remove('hidden')
    },

    onDocumentMouseMove(view: EditorView, event: MouseEvent) {
      if (!view.editable) return
      if (!ctx.domNode) return

      const targetPos = view.posAtCoords({ top: event.clientY, left: event.clientX + 50 })?.inside
      if (typeof targetPos !== 'number' || targetPos < 0) {
        return this.hide()
      }

      const result = findHoveredBlockNode(view, targetPos)
      if (!result) return this.hide()

      const { posOfBlockNode, blockNode } = result

      const blockDomNode = view.nodeDOM(posOfBlockNode) as null | HTMLElement
      if (!blockDomNode) return this.hide()

      const offsetLeft = getDomNodeLeftOffset(blockDomNode)
      const { left, top } = blockDomNode.getBoundingClientRect()

      ctx.domNode.style.top = top + window.scrollY - 2 + 'px'
      ctx.domNode.style.left = left - offsetLeft - 25 + 'px'

      this.show({ blockDomNode, posOfBlockNode, blockNode })
    },
  }
}

function findHoveredBlockNode(
  view: EditorView,
  posOfBlockNode: number,
):
  | undefined
  | {
      posOfBlockNode: number
      blockNode: Node
    } {
  let blockNode = view.state.doc.nodeAt(posOfBlockNode)

  while (
    posOfBlockNode > 0 &&
    blockNode &&
    (blockNode.isBlock === false || blockNode.type.spec.draggable === false)
  ) {
    blockNode = view.state.doc.nodeAt(--posOfBlockNode)
  }

  if (!blockNode) return

  if (blockNode.type.name === 'orderedList' || blockNode.type.name === 'unorderedList') {
    return
  }

  const isColumnsNode = blockNode.type.name === 'columns'
  if (isColumnsNode || blockNode.type.name === 'column') {
    posOfBlockNode += isColumnsNode ? 2 : 1
    blockNode = view.state.doc.nodeAt(posOfBlockNode)!
  }

  if (posOfBlockNode > 0) {
    const parentPos = posOfBlockNode - 1
    const parentBlockNode = view.state.doc.nodeAt(parentPos)

    if (parentBlockNode?.type.name === 'listItem' && parentBlockNode.childCount === 1) {
      blockNode = parentBlockNode
      posOfBlockNode = parentPos
    }
  }

  return {
    blockNode,
    posOfBlockNode,
  }
}
