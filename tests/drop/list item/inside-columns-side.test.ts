import { test, type Page } from '@playwright/test'
import { expectDiffHtml, openEditor } from '../../utils.js'
import { dragBlock } from '../utils.js'

test.describe('Drop - List item - Side drop', () => {
  test.describe('Ordered list', () => {
    test('Left side', async ({ page }) => {
      await openEditor(page)

      await dragBlock(page, {
        from: 'Sublist item 1',
        to: 'Column 1',
        position: 'out-left',
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
  <div data-type="column">
    <ol><li><p>Sublist item 1</p></li></ol>
  </div>
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
      <li><p>Sublist item 2</p></li>
    `,
      ])
    })

    test('Right side', async ({ page }) => {
      await openEditor(page)

      await dragBlock(page, {
        from: 'Sublist item 1',
        to: 'Column 2',
        position: 'out-right',
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
  <div data-type="column"><p>Column 2</p></div>
  <div data-type="column">
    <ol><li><p>Sublist item 1</p></li></ol>
  </div>
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
