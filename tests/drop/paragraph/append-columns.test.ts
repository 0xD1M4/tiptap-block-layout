import { test, type Page } from '@playwright/test'
import { expectDiffHtml, openEditor } from '../../utils.js'
import { dragBlock } from '../utils.js'
import { THREE_COLUMNS_CONTENT } from '../../../src/routes/content.js'
// import { LIST_AFTER_COLUMNS_CONTENT, THREE_COLUMNS_CONTENT } from '../../src/routes/content.js'

test.describe('Drop - Side drop - Append columns', () => {
  test.describe('Paragraph and Columns', () => {
    test('Left side', async ({ page }) => {
      await openEditor(page)

      await dragBlock(page, {
        from: 'Paragraph 1',
        to: 'Column 1',
        position: 'out-left',
      })

      await expectDiffHtml(page, [
        `
<p>Paragraph 1</p>
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
</div>
    `,
        `
<div data-type="columns">
  <div data-type="column"><p>Paragraph 1</p></div>
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
</div>
    `,
      ])
    })

    test('Right side', async ({ page }) => {
      await openEditor(page)

      await dragBlock(page, {
        from: 'Paragraph 1',
        to: 'Column 2',
        position: 'out-right',
      })

      await expectDiffHtml(page, [
        `
<p>Paragraph 1</p>
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
</div>
    `,
        `
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
  <div data-type="column"><p>Paragraph 1</p></div>
</div>
    `,
      ])
    })

    test('Between columns', async ({ page }) => {
      await openEditor(page)

      await dragBlock(page, {
        from: 'Paragraph 1',
        to: 'Column 1',
        position: 'between-after-left',
      })

      await expectDiffHtml(page, [
        `
<p>Paragraph 1</p>
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
    `,
        `
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Paragraph 1</p></div>
    `,
      ])
    })

    test('Between columns (1-2 of 3 cols)', async ({ page }) => {
      await openEditor(page, THREE_COLUMNS_CONTENT)

      await dragBlock(page, {
        from: 'Paragraph 1',
        to: 'Column 1',
        position: 'between-after-left',
      })

      await expectDiffHtml(page, [
        `
<p>Paragraph 1</p>
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
    `,
        `
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Paragraph 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
    `,
      ])
    })

    test('Between columns (2-3 of 3 cols)', async ({ page }) => {
      await openEditor(page, THREE_COLUMNS_CONTENT)

      await dragBlock(page, {
        from: 'Paragraph 1',
        to: 'Column 2',
        position: 'between-after-left',
      })

      await expectDiffHtml(page, [
        `
<p>Paragraph 1</p>
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
  <div data-type="column"><p>Column 3</p></div>
    `,
        `
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
  <div data-type="column"><p>Paragraph 1</p></div>
  <div data-type="column"><p>Column 3</p></div>
    `,
      ])
    })
  })
})
