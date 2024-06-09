import { Editor, Node, mergeAttributes } from '@tiptap/core'
import { NodeSelection, Transaction } from 'prosemirror-state'

export const Columns = Node.create({
  name: 'columns',
  group: 'block',
  content: 'column+',

  isolating: true,
  draggable: false,
  selectable: false,

  parseHTML() {
    return [{ tag: 'div[data-type="columns"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'columns' }), 0]
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { state, dispatch } = editor.view
        const { schema, tr } = state

        // NOTE: Selection is not a collapsed caret
        if (tr.selection.$anchor !== tr.selection.$head) return false
        if (tr.selection.$anchor.parentOffset > 0) return false

        const rootParentNode = tr.selection.$head.node(-1)
        const posOfParentNode = tr.selection.head - 1
        const indexOfParentNode = tr.selection.$head.index(-1)
        const parentNode = tr.selection.$head.parent

        if (rootParentNode.type.name === 'listItem') {
          if (indexOfParentNode === 0) {
            const wasUnwrapped = editor.commands.toggleWrap('listItem')
            if (wasUnwrapped === false) {
              editor.commands.liftListItem('listItem')
            }
          } else {
            editor.commands.joinTextblockBackward()
          }
          return true
        }

        if (rootParentNode.type.name === 'column' && indexOfParentNode === 0) {
          return liftColumn(editor, posOfParentNode, rootParentNode)
        }

        if (indexOfParentNode <= 0) return false

        const nodeBefore = rootParentNode.child(indexOfParentNode - 1)

        if (nodeBefore.type.spec.group?.includes('list')) {
          editor.commands.joinTextblockBackward()
          return true
        }

        if (nodeBefore.type.name !== 'columns') return false

        // const posOfColumnsNode = posOfParentNode - nodeBefore.nodeSize
        // const posOfLastColumnNode = posOfParentNode - nodeBefore.lastChild!.nodeSize

        // console.log(state.doc.nodeAt(posOfLastColumnNode))

        tr.setSelection(NodeSelection.create(tr.doc, posOfParentNode))
        tr.deleteSelection()

        tr.insert(posOfParentNode - 2, parentNode)

        dispatch(tr)

        editor.commands.focus(posOfParentNode - 1)
        editor.commands.joinTextblockBackward()

        return true
      },
    }
  },
})

function liftColumn(editor: Editor, posOfParentNode: number, rootParentNode: Node) {
  const { dispatch } = editor.view
  const { tr } = editor.view.state

  let posOfColumnsNode = tr.selection.$head.posAtIndex(0, -2) - 1
  let posOfFocus = posOfParentNode - 1

  const isFirstColumn = posOfFocus - 1 === posOfColumnsNode

  const columnsNode = tr.doc.nodeAt(posOfColumnsNode)!
  const shouldUnwrapColumns = columnsNode.content.childCount <= 2

  tr.delete(posOfParentNode - 1, posOfParentNode - 1 + rootParentNode.nodeSize)
  tr.insert(posOfParentNode - 2, rootParentNode.content)

  posOfColumnsNode = tr.mapping.map(posOfColumnsNode)
  if (shouldUnwrapColumns) {
    const columnsNode = tr.doc.nodeAt(posOfColumnsNode)!

    tr.delete(posOfColumnsNode, posOfColumnsNode + columnsNode.nodeSize)
    tr.insert(posOfColumnsNode - 1, columnsNode.child(0).content)

    if (isFirstColumn === false) posOfFocus -= 2
  } else {
    adjustColumnSizes(tr, posOfColumnsNode)
  }

  dispatch(tr)

  editor.commands.focus(posOfFocus)
  editor.commands.joinTextblockBackward() // TODO: use prosemirror-commands joinTextblockBackward instead of editor.commands

  return true
}

export const getMaxSize = (childCount: number) => childCount * 6 - 2 * (childCount - 1)
export function adjustColumnSizes(tr: Transaction, posOfColumnsNode: number) {
  const columnsNode = tr.doc.nodeAt(posOfColumnsNode)
  if (!columnsNode || columnsNode.type.name !== 'columns') return tr

  // const maxSize = getMaxSize(columnsNode.childCount)

  columnsNode.descendants((node, pos) => {
    // const style = node.attrs.style || ''
    // const size = parseInt(style.split('flex-grow:')[1], 10)

    // if (size > maxSize) {
    //   tr = tr.setNodeAttribute(posOfColumnsNode + pos + 1, 'style', 'flex-grow:' + maxSize)
    // }

    tr = tr.setNodeAttribute(posOfColumnsNode + pos + 1, 'style', 'flex-grow:' + 6)

    return false
  })

  return tr
}
