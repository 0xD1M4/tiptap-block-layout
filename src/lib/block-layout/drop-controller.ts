import type { EditorView } from '@tiptap/pm/view'
import type { EditorState, Transaction } from 'prosemirror-state'
import type { Node } from '@tiptap/pm/model'
import type { createDroparea } from './droparea.js'
import type { createDragHandle } from './drag-handle.js'

import { adjustColumnSizes } from '$lib/nodes/columns.js'

type TDropCtx = ReturnType<typeof createDroparea>['ctx']
type TDragCtx = ReturnType<typeof createDragHandle>['ctx']

export function createDropController(dragCtx: TDragCtx, dropCtx: TDropCtx) {
  let droppedColumn = null as null | {
    columnNode: Node
    posOfColumnNode: number
  }

  return {
    onDocumentDrop(view: EditorView, e: DragEvent) {
      let shouldPreventDefault = false

      if (dropCtx.sideColumn) {
        shouldPreventDefault = this.handleSideColumnDrop(view, dropCtx.sideColumn)
      } else if (dropCtx.betweenColumns) {
        shouldPreventDefault = this.handleBetweenColumnsDrop(view, dropCtx.betweenColumns)
      } else if (dragCtx.dragging) {
        shouldPreventDefault = this.handleColumnDrop(view, dragCtx.dragging)
      }

      if (shouldPreventDefault) e.preventDefault()
      return shouldPreventDefault
    },

    appendTransaction(
      transactions: readonly Transaction[],
      prevState: EditorState,
      nextState: EditorState,
    ) {
      if (droppedColumn) {
        let { posOfColumnNode } = droppedColumn
        posOfColumnNode = transactions.reduce((pos, tr) => tr.mapping.map(pos), posOfColumnNode)

        const pos$ = nextState.doc.resolve(posOfColumnNode)
        const columnNode = nextState.doc.nodeAt(posOfColumnNode)
        const columnsNode = pos$.node()

        let tr: Transaction

        if (columnsNode.childCount > 2) {
          tr = nextState.tr.delete(posOfColumnNode, posOfColumnNode + columnNode!.nodeSize)
          tr = adjustColumnSizes(tr, pos$.pos - pos$.parentOffset - 1)
        } else {
          const posOfColumnsNode = pos$.pos - pos$.parentOffset - 1

          tr = nextState.tr
            .delete(posOfColumnsNode, posOfColumnsNode + columnsNode.nodeSize)
            .insert(posOfColumnsNode - 1, columnsNode.child(Math.abs(1 - pos$.index())).content)
        }

        droppedColumn = null
        return tr
      }

      return null
    },

    handleColumnDrop(view: EditorView, dragging: NonNullable<TDragCtx['dragging']>): boolean {
      const { posOfBlockNode, blockDomNode } = dragging

      const parentColumnDomNode = blockDomNode.closest('[data-type="column"]')
      if (!parentColumnDomNode) return false

      const posOfParentColumnNode = view.posAtDOM(parentColumnDomNode, 0) - 1
      const parentColumnNode = view.state.doc.nodeAt(posOfParentColumnNode)
      if (!parentColumnNode || parentColumnNode.childCount > 1) return false

      droppedColumn = {
        columnNode: parentColumnNode,
        posOfColumnNode: posOfParentColumnNode,
      }

      return false
    },

    handleSideColumnDrop(view: EditorView, data: NonNullable<TDropCtx['sideColumn']>): boolean {
      // NOTE: Offseting to parent position
      let posOfDropTarget = view.posAtDOM(data.dropTargetDomNode, 0) - 1
      if (posOfDropTarget < 0) return false

      const { schema, selection, tr } = view.state

      // const cutContent = tr.doc.cut(selection.from, selection.to)
      const content = [selection.$anchor.parent.nodeAt(selection.$anchor.parentOffset)!]
      // const cutContent = tr.doc.cut(selection.from, selection.to)
      // const newColumnNode = schema.nodes.column.createAndFill(null, cutContent.content)
      const newColumnNode = schema.nodes.column.createAndFill(null, content)
      if (!newColumnNode) return false

      if (dragCtx.dragging) this.handleColumnDrop(view, dragCtx.dragging)
      tr.deleteSelection()
      posOfDropTarget = tr.mapping.map(posOfDropTarget)

      const dropTargetNode = tr.doc.nodeAt(posOfDropTarget)
      if (!dropTargetNode) return false

      if (dropTargetNode.type.name === 'columns') {
        posOfDropTarget += data.side === 'left' ? 1 : dropTargetNode.nodeSize - 1

        tr.insert(posOfDropTarget, newColumnNode)
      } else {
        const wrapColumn = schema.nodes.column.create(null, dropTargetNode)
        const wrapNode = schema.nodes.columns.create(
          null,
          data.side === 'left' ? [newColumnNode, wrapColumn] : [wrapColumn, newColumnNode],
        )

        tr.replaceWith(posOfDropTarget, posOfDropTarget + dropTargetNode.nodeSize, wrapNode)
      }

      view.dispatch(tr)

      return true
    },

    handleBetweenColumnsDrop(
      view: EditorView,
      data: NonNullable<TDropCtx['betweenColumns']>,
    ): boolean {
      const pos = view.posAtDOM(data.leftColumnDomNode, 0) - 1 // NOTE: -1 to access column node
      if (pos < 0) return false

      const columnNode = view.state.doc.nodeAt(pos)
      if (!columnNode || columnNode.type.name !== 'column') return false

      const { schema, selection, tr } = view.state

      // TODO: Handle drops from inside columns
      const newColumnNode = schema.nodes.column.createAndFill(null, view.state.selection.node)
      if (newColumnNode) tr.insert(pos + columnNode.nodeSize, newColumnNode)

      if (dragCtx.dragging) this.handleColumnDrop(view, dragCtx.dragging)

      tr.deleteSelection()

      view.dispatch(tr)

      return true
    },
  }
}
