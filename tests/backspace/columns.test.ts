import { test } from '@playwright/test'
import { expectDiffHtml, openEditor } from '../utils.js'
import { LIST_AFTER_COLUMNS_CONTENT, THREE_COLUMNS_CONTENT } from '../../src/routes/content.js'

test.describe('Backspace', () => {
  test.describe('Cursor at the start of a block', () => {
    test('Merging Paragraph to Column before', async ({ page }) => {
      await openEditor(page)

      await page.getByText('Paragraph 2').selectText()

      await page.keyboard.down('ArrowLeft')
      await page.keyboard.down('Backspace')

      await expectDiffHtml(page, [
        `
  <div data-type="column"><p>Column 2</p></div>
</div>
<p>Paragraph 2</p>
    `,
        `
  <div data-type="column"><p>Column 2Paragraph 2</p></div>
</div>
    `,
      ])
    })
  })

  test.describe('Cursor at the start of the last Column', () => {
    test('2 columns (unwrapping Columns)', async ({ page }) => {
      await openEditor(page)

      await page.getByText('Column 2').selectText()

      await page.keyboard.down('ArrowLeft')
      await page.keyboard.down('Backspace')

      await expectDiffHtml(page, [
        `
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
</div>
    `,
        `
<p>Column 1Column 2</p>
    `,
      ])
    })

    test('3 columns (merging and keeping Columns)', async ({ page }) => {
      await openEditor(page, THREE_COLUMNS_CONTENT)

      await page.getByText('Column 3').selectText()

      await page.keyboard.down('ArrowLeft')
      await page.keyboard.down('Backspace')

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
  <div data-type="column"><p>Column 2Column 3</p></div>
</div>
    `,
      ])
    })
  })

  test.describe('Cursor at the start of the first Column', () => {
    test('2 columns (unwrapping Columns)', async ({ page }) => {
      await openEditor(page)

      await page.getByText('Column 1').selectText()

      await page.keyboard.down('ArrowLeft')
      await page.keyboard.down('Backspace')

      await expectDiffHtml(page, [
        `
<p>Paragraph 1</p>
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
</div>
    `,
        `
<p>Paragraph 1Column 1</p>
<p>Column 2</p>
    `,
      ])
    })

    test('3 columns (merging last two and keeping Columns)', async ({ page }) => {
      await openEditor(page, THREE_COLUMNS_CONTENT)

      await page.getByText('Column 1').selectText()

      await page.keyboard.down('ArrowLeft')
      await page.keyboard.down('Backspace')

      await expectDiffHtml(page, [
        `
<p>Paragraph 1</p>
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
  <div data-type="column"><p>Column 3</p></div>
</div>
  `,
        `
<p>Paragraph 1Column 1</p>
<div data-type="columns">
  <div data-type="column"><p>Column 2</p></div>
  <div data-type="column"><p>Column 3</p></div>
</div>
  `,
      ])
    })
  })
})
