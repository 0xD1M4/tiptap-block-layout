export function getDomNodeLeftOffset(domNode: HTMLElement): number {
  const listDomNode = domNode.closest('ol') || domNode.closest('ul')
  if (!listDomNode) return 0

  const { paddingLeft, marginLeft } = window.getComputedStyle(listDomNode)

  return parseFloat(paddingLeft) + parseFloat(marginLeft)
}
