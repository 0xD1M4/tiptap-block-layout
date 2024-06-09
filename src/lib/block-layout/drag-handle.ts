import type { Editor } from '@tiptap/core'
import type { EditorView } from '@tiptap/pm/view'
import type { createBlockActions } from './block-actions.js'

// @ts-ignore
import { __serializeForClipboard } from '@tiptap/pm/view'
import { NodeSelection } from 'prosemirror-state'

type TBlockData = ReturnType<typeof createBlockActions>
type TDragging = TBlockData['ctx']['hovered']

export function createDragHandle(editor: Editor, BlockActions: TBlockData) {
  let domNode = null as null | HTMLElement
  const ctx = { dragging: null } as { dragging: TDragging }

  function onDragHandleDragStart(event: DragEvent, view: EditorView) {
    view.focus()

    if (!event.dataTransfer) return
    if (!BlockActions.ctx.hovered) return

    const { hovered } = BlockActions.ctx
    const { blockDomNode, posOfBlockNode } = hovered

    setTimeout(() => BlockActions.hide(), 40)

    const selection = NodeSelection.create(view.state.doc, posOfBlockNode)
    view.dispatch(view.state.tr.setSelection(selection))

    const slice = view.state.selection.content()
    const { dom, text } = __serializeForClipboard(view, slice)

    event.dataTransfer.clearData()
    event.dataTransfer.setData('text/html', dom.innerHTML)
    event.dataTransfer.setData('text/plain', text)
    event.dataTransfer.effectAllowed = 'copyMove'

    event.dataTransfer.setDragImage(blockDomNode, 0, 0)

    ctx.dragging = hovered
    view.dragging = { slice, move: event.ctrlKey }
  }

  return {
    ctx,
    init(view: EditorView) {
      domNode = document.createElement('div')
      domNode.draggable = true
      domNode.classList.add('global-drag-handle')

      BlockActions.ctx.domNode?.appendChild(domNode)

      const onDragStart = (e: DragEvent) => onDragHandleDragStart(e, view)

      function onClick() {
        if (!BlockActions.ctx.hovered) return

        editor.commands.setNodeSelection(BlockActions.ctx.hovered.posOfBlockNode)
        editor.commands.focus()
      }

      domNode.addEventListener('dragstart', onDragStart)
      domNode.addEventListener('click', onClick)

      return {
        destroy: () => {
          domNode?.removeEventListener('dragstart', onDragStart)
          domNode?.removeEventListener('click', onClick)
          domNode?.remove?.()
          domNode = null
        },
      }
    },
  }
}
