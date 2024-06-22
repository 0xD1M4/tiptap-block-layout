<script lang="ts">
  import { NodeViewWrapper } from 'tiptap-svelte-adapter'

  let { view } = $props()
</script>

<NodeViewWrapper>
  <span>Inline node {view.$.node.attrs['data-id']}</span>
</NodeViewWrapper>
