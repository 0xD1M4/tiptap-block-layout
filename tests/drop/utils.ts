import type { Page } from '@playwright/test'

type TData = {
  from: string
  to: string
  yOffset?: number
  xOffset?: number
  position?:
    | 'out-left'
    | 'out-right'
    | 'left'
    | 'center'
    | 'right'
    | 'above'
    | 'below'
    | 'between-after-left'
    | 'exact-above'
    | 'exact-below'
}

async function moveMouseToPosition(
  page: Page,
  rect: { x: number; y: number; width: number; height: number },
  data: TData,
) {
  const editorRect = await page.locator('.tiptap').boundingBox()
  const editorWidth = editorRect!.x + editorRect!.width

  switch (data.position || 'center') {
    case 'out-left':
      return await page.mouse.move(editorRect!.x + 2, rect.y + rect.height / 2)

    case 'out-right':
      return await page.mouse.move(editorWidth - 2, rect.y + rect.height / 2)

    case 'between-after-left': {
      const rect = await page.locator('[data-type="column"]', { hasText: data.to }).boundingBox()
      if (!rect) throw Error('Invalid drop column handle')

      return await page.mouse.move(rect.x + rect.width + 4, rect.y + rect.height / 2)
    }

    case 'above':
      return await page.mouse.move(rect.x + 10, rect.y + 3)

    case 'below':
      return await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2 + 2)

    case 'exact-above':
      return await page.mouse.move(rect.x + 10 + (data.xOffset ?? 0), rect.y + 0.5)

    case 'exact-below':
      return await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height)

    default:
      return await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2)
  }
}

export async function dragBlock(page: Page, data: TData) {
  await page.getByText(data.from).hover()

  await page.locator('.global-drag-handle').hover()
  await page.mouse.down()

  await page.mouse.move(0, 200)

  const toHandle = await page.getByText(data.to).elementHandle()
  const rect = await toHandle?.boundingBox()
  if (!rect) throw Error('Invalid drop target handle')

  await moveMouseToPosition(page, rect, data)

  await page.mouse.up()
}
