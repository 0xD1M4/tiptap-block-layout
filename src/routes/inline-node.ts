import { mergeAttributes, Node } from '@tiptap/core'
import { SvelteNodeViewRenderer } from 'tiptap-svelte-adapter'
import InlineComponent from './InlineComponent.svelte'

export default Node.create({
  name: 'inline-node',

  group: 'inline',

  inline: true,
  selectable: false,

  addAttributes() {
    return {
      'data-id': { default: '' },
      style: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-type="inline-node"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'inline-node' })]
  },

  addNodeView() {
    return SvelteNodeViewRenderer(InlineComponent)
  },
})
