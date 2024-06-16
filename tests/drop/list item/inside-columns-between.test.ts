import { test, type Page } from '@playwright/test'
import { expectDiffHtml, openEditor } from '../../utils.js'
import { dragBlock } from '../utils.js'
import { DOUBLE_COLUMNS_CONTENT, THREE_COLUMNS_CONTENT } from '../../../src/routes/content.js'
// import { LIST_AFTER_COLUMNS_CONTENT, THREE_COLUMNS_CONTENT } from '../../src/routes/content.js'

test.describe('Drop - List item - Between drop', () => {
  test.describe('Ordered list', () => {
    test('Sublist item', async ({ page }) => {
      await openEditor(page)

      await dragBlock(page, {
        from: 'Sublist item 1',
        to: 'Column 1',
        position: 'between-after-left',
      })

      await expectDiffHtml(page, [
        `
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
</div>
<p>Paragraph 2</p>
<p>Paragraph 3</p>
<ol>
  <li>
    <p>Numbered item 1</p>
  </li>
  <li>
    <p>Numbered item 2</p>
    <ol>
      <li><p>Sublist item 1</p></li>
      <li><p>Sublist item 2</p></li>
    `,
        `
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column">
    <ol><li><p>Sublist item 1</p></li></ol>
  </div>
  <div data-type="column"><p>Column 2</p></div>
</div>
<p>Paragraph 2</p>
<p>Paragraph 3</p>
<ol>
  <li>
    <p>Numbered item 1</p>
  </li>
  <li>
    <p>Numbered item 2</p>
    <ol>
      <li><p>Sublist item 2</p></li>
    `,
      ])
    })
  })
})
