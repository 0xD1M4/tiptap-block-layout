import { Editor, Extension } from '@tiptap/core'
import { Plugin, Transaction } from '@tiptap/pm/state'
import { createDragHandle } from './drag-handle.js'
import { createBlockActions } from './block-actions.js'
import { createDroparea } from './droparea.js'
import { createDropController } from './drop-controller.js'
import { createInlineNodeCursor } from './inline-node-cursor.js'

type TOptions = Partial<{ dropareaColor: string }>

function BlockLayoutPlugin({ editor, options }: { editor: Editor; options?: TOptions }) {
  const BlockActions = createBlockActions()
  const Droparea = createDroparea(options?.dropareaColor)
  const DragHandle = createDragHandle(editor, BlockActions)
  const DropController = createDropController(DragHandle.ctx, Droparea.ctx)
  const InlineNodeCursor = createInlineNodeCursor()

  return new Plugin({
    view: (view) => {
      const BlockActionsView = BlockActions.init(view)
      const DragHandleView = DragHandle.init(view)
      const DropareaView = Droparea.init(view)

      return {
        destroy: () => {
          BlockActionsView.destroy()
          DragHandleView.destroy()
          DropareaView.destroy()
        },
      }
    },
    appendTransaction(transactions, prevState, nextState) {
      let appended = null as null | Transaction

      appended = DropController.appendTransaction(transactions, prevState, nextState)
      if (appended) return appended

      appended = InlineNodeCursor.appendTransaction(transactions, prevState, nextState)
      if (appended) return appended

      return null
    },
    props: {
      handleDOMEvents: {
        mousemove(view, e) {
          BlockActions.onDocumentMouseMove(view, e)
        },

        keydown(view, e) {
          BlockActions.hide()

          InlineNodeCursor.onDocumentKeyDown(e)
        },

        dragover(view, e) {
          Droparea.onDocumentDragOver(view, e)
        },

        drop(view, e) {
          const result = DropController.onDocumentDrop(view, e)

          Droparea.onDocumentDrop()

          return result
        },
      },
    },
  })
}

const BlockLayout = Extension.create<TOptions, any>({
  name: 'BlockLayout',

  addOptions() {
    return {}
  },

  addProseMirrorPlugins() {
    return this.editor.isEditable ? [BlockLayoutPlugin(this)] : []
  },
})

export default BlockLayout
