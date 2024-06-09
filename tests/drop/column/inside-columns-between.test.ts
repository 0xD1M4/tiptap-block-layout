import { test, type Page } from '@playwright/test'
import { expectDiffHtml, openEditor } from '../../utils.js'
import { dragBlock } from '../utils.js'
import { DOUBLE_COLUMNS_CONTENT, THREE_COLUMNS_CONTENT } from '../../../src/routes/content.js'
// import { LIST_AFTER_COLUMNS_CONTENT, THREE_COLUMNS_CONTENT } from '../../src/routes/content.js'

test.describe('Drop - Column - Between drop', () => {
  test.describe('Inside same columns', () => {
    test('Left side drop', async ({ page }) => {
      await openEditor(page)

      await dragBlock(page, {
        from: 'Column 1',
        to: 'Column 1',
        position: 'between-after-left',
      })

      await expectDiffHtml(page, [
        `
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
</div>
    `,
        `
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
</div>
    `,
      ])
    })

    test('Right side drop (first column)', async ({ page }) => {
      await openEditor(page, THREE_COLUMNS_CONTENT)

      await dragBlock(page, {
        from: 'Column 1',
        to: 'Column 2',
        position: 'between-after-left',
      })

      await expectDiffHtml(page, [
        `
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
  <div data-type="column"><p>Column 3</p></div>
</div>
    `,
        `
<div data-type="columns">
  <div data-type="column"><p>Column 2</p></div>
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 3</p></div>
</div>
    `,
      ])
    })

    test('Right side drop (last column)', async ({ page }) => {
      await openEditor(page, THREE_COLUMNS_CONTENT)

      await dragBlock(page, {
        from: 'Column 3',
        to: 'Column 1',
        position: 'between-after-left',
      })

      await expectDiffHtml(page, [
        `
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
  <div data-type="column"><p>Column 3</p></div>
</div>
    `,
        `
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 3</p></div>
  <div data-type="column"><p>Column 2</p></div>
</div>
    `,
      ])
    })
  })

  test.describe('Into different columns', () => {
    test('Unwrapping old columns', async ({ page }) => {
      await openEditor(page, DOUBLE_COLUMNS_CONTENT)

      await dragBlock(page, {
        from: 'Column 1',
        to: 'Column 2.1',
        position: 'between-after-left',
      })

      await expectDiffHtml(page, [
        `
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
</div>
<div data-type="columns">
  <div data-type="column"><p>Column 2.1</p></div>
  <div data-type="column"><p>Column 2.2</p></div>
  <div data-type="column"><p>Column 2.3</p></div>
</div>
        `,
        `
<p>Column 2</p>
<div data-type="columns">
  <div data-type="column"><p>Column 2.1</p></div>
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2.2</p></div>
  <div data-type="column"><p>Column 2.3</p></div>
</div>
        `,
      ])
    })

    test('Keeping old columns', async ({ page }) => {
      await openEditor(page, DOUBLE_COLUMNS_CONTENT)

      await dragBlock(page, {
        from: 'Column 2.1',
        to: 'Column 1',
        position: 'between-after-left',
      })

      await expectDiffHtml(page, [
        `
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
</div>
<div data-type="columns">
  <div data-type="column"><p>Column 2.1</p></div>
  <div data-type="column"><p>Column 2.2</p></div>
  <div data-type="column"><p>Column 2.3</p></div>
</div>
        `,
        `
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2.1</p></div>
  <div data-type="column"><p>Column 2</p></div>
</div>
<div data-type="columns">
  <div data-type="column"><p>Column 2.2</p></div>
  <div data-type="column"><p>Column 2.3</p></div>
</div>
        `,
      ])
    })
  })
})
