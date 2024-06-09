import { Node, mergeAttributes } from '@tiptap/core'

export const Column = Node.create({
  name: 'column',
  group: 'column',
  content: 'block+',

  isolating: true,
  draggable: false,

  parseHTML() {
    return [{ tag: 'div[data-type="column"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'column' }), 0]
  },
  addAttributes() {
    return {
      style: { default: '' },
    }
  },

  // https://github.com/ueberdosis/tiptap/issues/361
  addNodeView() {
    return ({ editor, getPos, HTMLAttributes }) => {
      const dom = document.createElement('div')
      dom.dataset.type = 'column'
      dom.setAttribute('style', HTMLAttributes.style || '')

      const content = document.createElement('div')
      content.style.display = 'contents'

      const resizer = document.createElement('div')
      resizer.dataset.type = 'column-resizer'
      resizer.style.userSelect = 'none'

      dom.append(content, resizer)

      resizer.addEventListener('pointerdown', (eventDown) => {
        // resizer.requestPointerLock()
        const xStart = eventDown.clientX

        const parent = dom.parentNode as HTMLElement
        const sibling = dom.nextElementSibling as HTMLElement

        const currentFr = +window.getComputedStyle(dom).flexGrow
        const siblingFr = +window.getComputedStyle(sibling).flexGrow

        const frInPx = parent.clientWidth / (parent.childElementCount * 6)

        function onPointerUp() {
          resizer.releasePointerCapture(eventDown.pointerId)
          resizer.removeEventListener('pointermove', onPointerMove)

          const pos = getPos()
          if (!pos) return

          const currentNode = editor.view.state.doc.nodeAt(pos)
          if (!currentNode) return
          const { tr } = editor.view.state

          tr.setNodeAttribute(pos, 'style', 'flex-grow:' + dom.style.flexGrow)
          tr.setNodeAttribute(
            pos + currentNode.nodeSize,
            'style',
            'flex-grow:' + sibling.style.flexGrow,
          )

          editor.view.dispatch(tr)
        }

        function onPointerMove(eventMove: MouseEvent) {
          eventMove.preventDefault()
          eventMove.stopPropagation()

          const diff = eventMove.clientX - xStart
          const change = Math.round(diff / frInPx)

          const newCurrentFr = currentFr + change
          const newSiblingFr = siblingFr - change

          if (newCurrentFr < 2 /* || newCurrentFr > 10 */) return
          if (newSiblingFr < 2 /* || newSiblingFr > 10 */) return

          dom.style.flexGrow = `${newCurrentFr}`
          sibling.style.flexGrow = `${newSiblingFr}`
        }

        resizer.setPointerCapture(eventDown.pointerId)
        resizer.addEventListener('pointerup', onPointerUp, { once: true })
        resizer.addEventListener('pointermove', onPointerMove)
      })

      return {
        dom,
        contentDOM: content,

        update(node) {
          if (dom) {
            dom.setAttribute('style', node.attrs.style)
            return true
          }
        },

        ignoreMutation: () => true,
      }
    }
  },
})
