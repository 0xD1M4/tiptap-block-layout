import { test, type Page } from '@playwright/test'
import { expectDiffHtml, openEditor } from '../../utils.js'
import { dragBlock } from '../utils.js'
import { DOUBLE_COLUMNS_CONTENT, THREE_COLUMNS_CONTENT } from '../../../src/routes/content.js'
// import { LIST_AFTER_COLUMNS_CONTENT, THREE_COLUMNS_CONTENT } from '../../src/routes/content.js'

test.describe('Drop - Column', () => {
  test.describe('Inside same columns', () => {
    test('Left side drop', async ({ page }) => {
      await openEditor(page)

      await dragBlock(page, {
        from: 'Column 1',
        to: 'Column 1',
        position: 'out-left',
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

    test('Right side drop', async ({ page }) => {
      await openEditor(page)

      await dragBlock(page, {
        from: 'Column 1',
        to: 'Column 2',
        position: 'out-right',
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
  <div data-type="column"><p>Column 2</p></div>
  <div data-type="column"><p>Column 1</p></div>
</div>
    `,
      ])
    })
  })

  test.describe('Creating new columns', () => {
    test('Left side drop', async ({ page }) => {
      await openEditor(page)

      await dragBlock(page, {
        from: 'Column 1',
        to: 'Paragraph 1',
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
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Paragraph 1</p></div>
</div>
<p>Column 2</p>
    `,
      ])
    })

    test('Right side drop', async ({ page }) => {
      await openEditor(page)

      await dragBlock(page, {
        from: 'Column 1',
        to: 'Paragraph 1',
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
  <div data-type="column"><p>Paragraph 1</p></div>
  <div data-type="column"><p>Column 1</p></div>
</div>
<p>Column 2</p>
    `,
      ])
    })
  })

  test.describe('Into different columns', () => {
    test.describe('Unwrapping old columns', () => {
      test('Left side drop', async ({ page }) => {
        await openEditor(page, DOUBLE_COLUMNS_CONTENT)

        await dragBlock(page, {
          from: 'Column 1',
          to: 'Column 2.1',
          position: 'out-left',
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
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2.1</p></div>
  <div data-type="column"><p>Column 2.2</p></div>
  <div data-type="column"><p>Column 2.3</p></div>
</div>
        `,
        ])
      })

      test('Right side drop', async ({ page }) => {
        await openEditor(page, DOUBLE_COLUMNS_CONTENT)

        await dragBlock(page, {
          from: 'Column 1',
          to: 'Column 2.1',
          position: 'out-right',
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
  <div data-type="column"><p>Column 2.2</p></div>
  <div data-type="column"><p>Column 2.3</p></div>
  <div data-type="column"><p>Column 1</p></div>
</div>
        `,
        ])
      })
    })

    test.describe('Keeping old columns', () => {
      test('Left side drop', async ({ page }) => {
        await openEditor(page, DOUBLE_COLUMNS_CONTENT)

        await dragBlock(page, {
          from: 'Column 2.1',
          to: 'Column 1',
          position: 'out-left',
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
  <div data-type="column"><p>Column 2.1</p></div>
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
</div>
<div data-type="columns">
  <div data-type="column"><p>Column 2.2</p></div>
  <div data-type="column"><p>Column 2.3</p></div>
</div>
        `,
        ])
      })

      test('Right side drop', async ({ page }) => {
        await openEditor(page, DOUBLE_COLUMNS_CONTENT)

        await dragBlock(page, {
          from: 'Column 2.1',
          to: 'Column 1',
          position: 'out-right',
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
  <div data-type="column"><p>Column 2</p></div>
  <div data-type="column"><p>Column 2.1</p></div>
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
})
