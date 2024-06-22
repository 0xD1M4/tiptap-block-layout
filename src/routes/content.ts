export const CONTENT = `
<p>Paragraph 1</p>
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
      <li><p>Sublist item 3</p></li>
    </ol>
  </li>
</ol>
`

export const THREE_COLUMNS_CONTENT = `
<p>Paragraph 1</p>
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
  <div data-type="column"><p>Column 3</p></div>
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
      <li><p>Sublist item 3</p></li>
    </ol>
  </li>
</ol>
`

export const DOUBLE_COLUMNS_CONTENT = `
<p>Paragraph 2</p>
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
</div>
<div data-type="columns">
  <div data-type="column"><p>Column 2.1</p></div>
  <div data-type="column"><p>Column 2.2</p></div>
  <div data-type="column"><p>Column 2.3</p></div>
</div>
<p>Paragraph 3</p>
`

export const LIST_AFTER_COLUMNS_CONTENT = `
<p>Paragraph 1</p>
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
  <div data-type="column"><p>Column 3</p></div>
</div>
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
`

export const OL_COLUMN_CONTENT = `
<p>Paragraph 1</p>
<div data-type="columns">
  <div data-type="column">
    <ol><li><p>Column list item 1</p></li></ol>
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
      <li><p>Sublist item 1</p></li>
      <li><p>Sublist item 2</p></li>
      <li><p>Sublist item 3</p></li>
    </ol>
  </li>
</ol>
`

export const COLUMNS_FIRST_CONTENT = `
<div data-type="columns">
  <div data-type="column"><p>Column 1</p></div>
  <div data-type="column"><p>Column 2</p></div>
</div>
<p>Paragraph 1</p>
`

export const INLINE_CONTENT = `
<p>Paragraph 1</p>
<p>Paragraph 2<span data-type="inline-node" data-id="0"></span><span data-type="inline-node" data-id="1"></span></p>
<p><span data-type="inline-node" data-id="2"></span>Paragraph 3</p>
`
