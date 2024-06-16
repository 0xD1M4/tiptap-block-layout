import { Editor, Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { createDragHandle } from './drag-handle.js'
import { createBlockActions } from './block-actions.js'
import { createDroparea } from './droparea.js'
import { createDropController } from './drop-controller.js'

function BlockLayoutPlugin({ editor }: { editor: Editor }) {
  const BlockActions = createBlockActions()
  const Droparea = createDroparea()
  const DragHandle = createDragHandle(editor, BlockActions)
  const DropController = createDropController(DragHandle.ctx, Droparea.ctx)

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
      let appended = null

      appended = DropController.appendTransaction(transactions, prevState, nextState)
      if (appended) return appended

      return null
    },
    props: {
      handleDOMEvents: {
        mousemove(view, e) {
          BlockActions.onDocumentMouseMove(view, e)
        },

        keydown() {
          BlockActions.hide()
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

const BlockLayout = Extension.create({
  name: 'BlockLayout',

  addOptions() {
    return {}
  },

  addProseMirrorPlugins() {
    return this.editor.isEditable ? [BlockLayoutPlugin(this)] : []
  },
})

export default BlockLayout
