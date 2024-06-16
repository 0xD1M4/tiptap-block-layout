import { test, type Page } from '@playwright/test'
import { expectDiffHtml, openEditor } from '../../utils.js'
import { dragBlock } from '../utils.js'
import { OL_COLUMN_CONTENT } from '../../../src/routes/content.js'
// import { LIST_AFTER_COLUMNS_CONTENT, THREE_COLUMNS_CONTENT } from '../../src/routes/content.js'

test.describe('Drop - Append column with only ordered list', () => {
  test.describe('First column', () => {
    test('Drop at the top of a column', async ({ page }) => {
      await openEditor(page, OL_COLUMN_CONTENT)

      await dragBlock(page, {
        from: 'Paragraph 1',
        to: 'Column list item 1',
        position: 'exact-above',
      })

      await expectDiffHtml(page, [
        `
<p>Paragraph 1</p>
<div data-type="columns">
  <div data-type="column">
    <ol><li><p>Column list item 1</p></li></ol>
  </div>
  <div data-type="column"><p>Column 1</p></div>
    `,
        `
<div data-type="columns">
  <div data-type="column">
    <p>Paragraph 1</p>
    <ol><li><p>Column list item 1</p></li></ol>
  </div>
  <div data-type="column"><p>Column 1</p></div>
    `,
      ])
    })

    test('Drop at the bottom of a column', async ({ page }) => {
      await openEditor(page, OL_COLUMN_CONTENT)

      await dragBlock(page, {
        from: 'Paragraph 1',
        to: 'Column list item 1',
        position: 'exact-below',
      })

      await expectDiffHtml(page, [
        `
<p>Paragraph 1</p>
<div data-type="columns">
  <div data-type="column">
    <ol><li><p>Column list item 1</p></li></ol>
  </div>
  <div data-type="column"><p>Column 1</p></div>
    `,
        `
<div data-type="columns">
  <div data-type="column">
    <ol><li><p>Column list item 1</p></li></ol>
    <p>Paragraph 1</p>
  </div>
  <div data-type="column"><p>Column 1</p></div>
    `,
      ])
    })
  })

  test.describe('Last column', () => {
    test('Drop at the top of a column', async ({ page }) => {
      await openEditor(page, OL_COLUMN_CONTENT)

      await dragBlock(page, {
        from: 'Paragraph 2',
        to: 'Column 2',
        position: 'exact-above',
      })

      await expectDiffHtml(page, [
        `
  <div data-type="column"><p>Column 2</p></div>
</div>
<p>Paragraph 2</p>
    `,

        `
  <div data-type="column">
    <p>Paragraph 2</p>
    <p>Column 2</p>
  </div>
</div>
    `,
      ])
    })

    test('Drop at the bottom of a column', async ({ page }) => {
      await openEditor(page, OL_COLUMN_CONTENT)

      await dragBlock(page, {
        from: 'Paragraph 2',
        to: 'Column 2',
        position: 'exact-below',
      })

      await expectDiffHtml(page, [
        `
  <div data-type="column"><p>Column 2</p></div>
</div>
<p>Paragraph 2</p>
    `,

        `
  <div data-type="column">
    <p>Column 2</p>
    <p>Paragraph 2</p>
  </div>
</div>
    `,
      ])
    })
  })
})
