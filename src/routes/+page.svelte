<script lang="ts">
  import StarterKit from '@tiptap/starter-kit'
  import Editor from 'tiptap-svelte-adapter'
  import BlockLayout, { Columns, Column } from '$lib/index.js'
  import { CONTENT } from './content.js'

  const content = new URLSearchParams(location.search).get('content') || CONTENT

  let EditorRef: Editor

  $effect(() => {
    const editor = EditorRef.getEditor()
    if (!editor) return

    // @ts-expect-error
    window.getEditorHtml = () => editor.getHTML()
  })
</script>

<main>
  <Editor
    bind:this={EditorRef}
    options={{
      extensions: [
        StarterKit.configure({
          dropcursor: false,
          gapcursor: false,
        }),
        Columns,
        Column,
        BlockLayout,
      ],

      content,
    }}
  ></Editor>
</main>

<style>
  :global {
    p,
    ol,
    ul,
    li {
      margin: 0;
    }

    .hide {
      display: none;
    }
  }

  main :global {
    .tiptap {
      display: flex;
      flex-direction: column;
      padding: 24px 48px;
    }

    .global-drag-actions {
      position: absolute;
    }

    ul,
    ol {
      padding-left: 24px;
    }

    ul li {
      list-style: disc;
    }
    ol li {
      list-style: decimal;
    }

    .global-drag-handle {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 25 25' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M9.5 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm1.5 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM15.5 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm1.5 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM15.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z' fill='%23121923'/%3E%3C/svg%3E");
      background-size: 20px 24px;
      background-repeat: no-repeat;
      background-position: center;
      width: 20px;
      height: 24px;
      z-index: 50;
      cursor: grab;
    }

    [data-type='columns'] {
      border: 1px solid red;
      gap: 16px;
      display: flex;
    }

    [data-type='column'] {
      border: 1px solid green;
      position: relative;
      min-width: 0;

      flex: 6;
      transition: flex-grow 180ms ease;

      &:last-child > [data-type='column-resizer'] {
        display: none;
      }
    }

    [data-type='column-resizer'] {
      position: absolute;
      top: -7px;
      bottom: -7px;
      right: -12px;
      width: 6px;
      border-radius: 8px;
      background: #c8c8c8;
      opacity: 0.3;

      cursor: col-resize;
      z-index: 100;

      &:hover {
        opacity: 1;
      }
    }
  }
</style>
