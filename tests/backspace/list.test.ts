import { test } from '@playwright/test'
import { expectDiffHtml, openEditor } from '../utils.js'
import { LIST_AFTER_COLUMNS_CONTENT, THREE_COLUMNS_CONTENT } from '../../src/routes/content.js'

test.describe('Backspace', () => {
  test.describe('Cursor at the start of a block', () => {
    test('Converting first OL listItem to paragraph before Columns', async ({ page }) => {
      await openEditor(page, LIST_AFTER_COLUMNS_CONTENT)

      await page.getByText('Numbered item 1').selectText()

      await page.keyboard.down('ArrowLeft')
      await page.keyboard.down('Backspace')

      await expectDiffHtml(page, [
        `
<ol>
  <li>
    <p>Numbered item 1</p>
  </li>
    `,
        `
<p>Numbered item 1</p>
<ol>
    `,
      ])
    })

    test('Converting second OL listItem to paragraph', async ({ page }) => {
      await openEditor(page, LIST_AFTER_COLUMNS_CONTENT)

      await page.getByText('Numbered item 2').selectText()

      await page.keyboard.down('ArrowLeft')
      await page.keyboard.down('Backspace')

      await expectDiffHtml(page, [
        `
<ol>
  <li>
    <p>Numbered item 1</p>
  </li>
  <li>
    <p>Numbered item 2</p>
    <ol>
      <li><p>Sublist item 1</p></li>
      <li><p>Sublist item 2</p></li>
      <li><p>Sublist item 3</p></li>
    </ol>
  </li>
</ol>`,

        `
<ol>
  <li>
    <p>Numbered item 1</p>
  </li>
</ol>
<p>Numbered item 2</p>
<ol>
  <li><p>Sublist item 1</p></li>
  <li><p>Sublist item 2</p></li>
  <li><p>Sublist item 3</p></li>
</ol>
`,
      ])
    })

    test('Converting first sublists item to Paragraph', async ({ page }) => {
      await openEditor(page, LIST_AFTER_COLUMNS_CONTENT)

      await page.getByText('Sublist item 1').selectText()

      await page.keyboard.down('ArrowLeft')
      await page.keyboard.down('Backspace')

      await expectDiffHtml(page, [
        `
 <ol>
      <li><p>Sublist item 1</p></li>
        `,
        `
<p>Sublist item 1</p>
 <ol>
        `,
      ])
    })

    test('Converting second sublists item to Paragraph', async ({ page }) => {
      await openEditor(page, LIST_AFTER_COLUMNS_CONTENT)

      await page.getByText('Sublist item 2').selectText()

      await page.keyboard.down('ArrowLeft')
      await page.keyboard.down('Backspace')

      await expectDiffHtml(page, [
        `
<li><p>Sublist item 2</p></li>
        `,
        `
</ol>
<p>Sublist item 2</p>       
<ol>
        `,
      ])
    })

    test('Converting last sublists item to Paragraph', async ({ page }) => {
      await openEditor(page, LIST_AFTER_COLUMNS_CONTENT)

      await page.getByText('Sublist item 3').selectText()

      await page.keyboard.down('ArrowLeft')
      await page.keyboard.down('Backspace')

      await expectDiffHtml(page, [
        `
<li><p>Sublist item 3</p></li>
</ol>
        `,
        `
</ol>
<p>Sublist item 3</p>       
        `,
      ])
    })
  })
})
