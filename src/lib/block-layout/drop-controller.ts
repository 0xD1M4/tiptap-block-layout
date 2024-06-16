import type { EditorView } from '@tiptap/pm/view'
import { NodeSelection, TextSelection, type EditorState, type Transaction } from 'prosemirror-state'
import type { Node, ResolvedPos } from '@tiptap/pm/model'
import type { createDroparea } from './droparea.js'
import type { createDragHandle } from './drag-handle.js'

import { adjustColumnSizes } from '$lib/nodes/columns.js'
import { findWrapping } from '@tiptap/pm/transform'

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

      if (dropCtx.block) {
        shouldPreventDefault = this.handleBlockDrop(view, dropCtx.block, e)
      } else if (dropCtx.sideColumn) {
        shouldPreventDefault = this.handleSideColumnDrop(view, dropCtx.sideColumn)
      } else if (dropCtx.betweenColumns) {
        shouldPreventDefault = this.handleBetweenColumnsDrop(view, dropCtx.betweenColumns)
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

      // TODO: Correctly unwrap column when list was dragged
      if (parentColumnNode.firstChild?.type.name.includes('List')) {
        return false
      }

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

      const dragParentNode = selection.$anchor.parent
      let dragNode = dragParentNode.nodeAt(selection.$anchor.parentOffset)!

      if (dragNode.type.name === 'listItem') {
        dragNode = dragParentNode.type.createAndFill({ ...dragParentNode.attrs }, dragNode)!
      }

      // const cutContent = tr.doc.cut(selection.from, selection.to)
      const content = [dragNode]
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

      const dragParentNode = selection.$anchor.parent
      let dragNode = dragParentNode.nodeAt(selection.$anchor.parentOffset)!

      if (dragNode.type.name === 'listItem') {
        dragNode = dragParentNode.type.createAndFill({ ...dragParentNode.attrs }, dragNode)!
      }

      // TODO: Handle drops from inside columns
      const newColumnNode = schema.nodes.column.createAndFill(null, dragNode)
      if (newColumnNode) tr.insert(pos + columnNode.nodeSize, newColumnNode)

      if (dragCtx.dragging) this.handleColumnDrop(view, dragCtx.dragging)

      tr.deleteSelection()

      view.dispatch(tr)

      return true
    },

    // https://github.com/ProseMirror/prosemirror-view/blob/d3e9dcabe253707654978a9da9be9b9ce78db38d/src/input.ts#L699
    handleBlockDrop(view: EditorView, data: NonNullable<TDropCtx['block']>, e: DragEvent): boolean {
      if (data.node === dragCtx.dragging?.blockNode) {
        return true
      }

      let dragging = view.dragging
      view.dragging = null

      let slice = dragging && dragging.slice

      if (!slice) return false
      if (!e.dataTransfer) return false

      const move = true

      const tr = view.state.tr
      const insertPos = data.pos

      if (move) {
        const { node } = dragging as any
        if (node) node.replace(tr)
        else tr.deleteSelection()
      }

      const pos = tr.mapping.map(data.pos)
      const isNode = slice.openStart == 0 && slice.openEnd == 0 && slice.content.childCount == 1
      const beforeInsert = tr.doc

      if (isNode) tr.replaceRangeWith(pos, pos, slice.content.firstChild!)
      else tr.replaceRange(pos, pos, slice)

      if (tr.doc.eq(beforeInsert)) {
        if (dragCtx.dragging) this.handleColumnDrop(view, dragCtx.dragging)
        return true
      }

      const $pos = tr.doc.resolve(pos)
      if (
        isNode &&
        NodeSelection.isSelectable(slice.content.firstChild!) &&
        $pos.nodeAfter?.sameMarkup(slice.content.firstChild!)
      ) {
        tr.setSelection(new NodeSelection($pos))
      } else {
        let end = tr.mapping.map(insertPos)
        tr.mapping.maps[tr.mapping.maps.length - 1].forEach((_from, _to, _newFrom, newTo) => {
          end = newTo
        })
        tr.setSelection(selectionBetween(view, $pos, tr.doc.resolve(end)))
      }

      if (dragCtx.dragging) this.handleColumnDrop(view, dragCtx.dragging)

      view.focus()
      view.dispatch(tr.setMeta('uiEvent', 'drop'))

      return true
    },
  }
}

function selectionBetween(
  view: EditorView,
  $anchor: ResolvedPos,
  $head: ResolvedPos,
  bias?: number,
) {
  return (
    view.someProp('createSelectionBetween', (f) => f(view, $anchor, $head)) ||
    TextSelection.between($anchor, $head, bias)
  )
}
