import { test, type Page } from '@playwright/test'
import { expectDiffHtml, openEditor } from '../../utils.js'
import { dragBlock } from '../utils.js'
import { THREE_COLUMNS_CONTENT } from '../../../src/routes/content.js'
// import { LIST_AFTER_COLUMNS_CONTENT, THREE_COLUMNS_CONTENT } from '../../src/routes/content.js'

test.describe('Drop - Column', () => {
  test.describe('Out of columns and unwrap', () => {
    test('Dropping above', async ({ page }) => {
      await openEditor(page)

      await dragBlock(page, {
        from: 'Column 1',
        to: 'Paragraph 1',
        position: 'below',
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
<p>Paragraph 1</p>
<p>Column 1</p>
<p>Column 2</p>
    `,
      ])
    })

    test('Dropping below', async ({ page }) => {
      await openEditor(page)

      await dragBlock(page, {
        from: 'Column 1',
        to: 'Paragraph 2',
        position: 'above',
      })

      await expectDiffHtml(page, [
        `
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
</div>
<p>Paragraph 2</p>
    `,
        `
<p>Column 2</p>
<p>Column 1</p>
<p>Paragraph 2</p>
    `,
      ])
    })
  })
})
