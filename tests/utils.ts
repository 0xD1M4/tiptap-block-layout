import { expect, type Page } from '@playwright/test'
import beautify from 'js-beautify'
import { CONTENT } from '../src/routes/content.js'

export async function getEditorHtml(page: Page): Promise<string> {
  // @ts-expect-error
  const handle = await page.evaluateHandle(() => window.getEditorHtml)

  return ((await handle.evaluate((fn) => fn())) as string)
    .replaceAll(' style=""', '')
    .replaceAll(' style="flex-grow:6"', '')
}

export async function expectEditorHTML(page: Page, expected: string) {
  const html = await getEditorHtml(page)

  await expect(beautify.html(html)).toBe(beautify.html(expected))
}

const normalizeHTML = (value: string) => value.trim().replace(/>(\s+)</g, '><')

export async function expectDiffHtml(page: Page, [oldHtml, newHtml]: [string, string]) {
  const html = await getEditorHtml(page)

  const url = await page.url()
  const content = new URL(url).searchParams.get('content')!

  const [firstHalf, secondHalf] = normalizeHTML(content).split(normalizeHTML(oldHtml))
  const expected = firstHalf + newHtml + secondHalf

  await expect(beautify.html(html)).toBe(beautify.html(expected))
}

export async function openEditor(page: Page, content = CONTENT) {
  await page.goto('/?content=' + encodeURIComponent(content))

  await page.waitForTimeout(100)
}
