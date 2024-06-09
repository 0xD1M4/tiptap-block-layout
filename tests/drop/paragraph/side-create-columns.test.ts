import { test, type Page } from '@playwright/test'
import { expectDiffHtml, openEditor } from '../../utils.js'
import { dragBlock } from '../utils.js'
// import { LIST_AFTER_COLUMNS_CONTENT, THREE_COLUMNS_CONTENT } from '../../src/routes/content.js'

test.describe('Drop - Side drop - Create new columns', () => {
  test.describe('Paragraph to Paragraph', () => {
    test('Left side', async ({ page }) => {
      await openEditor(page)

      await dragBlock(page, {
        from: 'Paragraph 2',
        to: 'Paragraph 3',
        position: 'out-left',
      })

      await expectDiffHtml(page, [
        `
<p>Paragraph 2</p>
<p>Paragraph 3</p>
    `,
        `
<div data-type="columns">
  <div data-type="column"><p>Paragraph 2</p></div>
  <div data-type="column"><p>Paragraph 3</p></div>
</div>
    `,
      ])
    })

    test('Right side', async ({ page }) => {
      await openEditor(page)

      await dragBlock(page, {
        from: 'Paragraph 2',
        to: 'Paragraph 3',
        position: 'out-right',
      })

      await expectDiffHtml(page, [
        `
<p>Paragraph 2</p>
<p>Paragraph 3</p>
    `,
        `
<div data-type="columns">
  <div data-type="column"><p>Paragraph 3</p></div>
  <div data-type="column"><p>Paragraph 2</p></div>
</div>
    `,
      ])
    })
  })

  test.describe('Paragraph to List', () => {
    test('Left side', async ({ page }) => {
      await openEditor(page)

      await dragBlock(page, {
        from: 'Paragraph 3',
        to: 'Numbered item 1',
        position: 'out-left',
      })

      await expectDiffHtml(page, [
        `
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
      <li><p>Sublist item 3</p></li>
    </ol>
  </li>
</ol>
    `,
        `
<div data-type="columns">
  <div data-type="column"><p>Paragraph 3</p></div>
  <div data-type="column">
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
</ol>
  </div>
</div>
    `,
      ])
    })

    test('Right side', async ({ page }) => {
      await openEditor(page)

      await dragBlock(page, {
        from: 'Paragraph 3',
        to: 'Numbered item 1',
        position: 'out-right',
      })

      await expectDiffHtml(page, [
        `
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
      <li><p>Sublist item 3</p></li>
    </ol>
  </li>
</ol>
    `,
        `
<div data-type="columns">
  <div data-type="column">
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
    </ol>
  </div>
  <div data-type="column"><p>Paragraph 3</p></div>
</div>
    `,
      ])
    })
  })
})
