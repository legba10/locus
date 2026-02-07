import { test, expect } from '@playwright/test'

test('Homepage: logo animates as single unit (desktop hover/click)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')

  const logo = page.locator('.header .logo').first()
  const logoImg = logo.locator('.header-logo-img').first()
  const logoText = logo.locator('.header-logo-text').first()

  await expect(logo).toBeVisible()
  await expect(logoImg).toBeVisible()
  await expect(logoText).toHaveText('LOCUS')

  // Hover: transform is applied to container (not image)
  await logo.hover()
  const hoverTransform = await logo.evaluate((el) => getComputedStyle(el).transform)
  const imgHoverTransform = await logoImg.evaluate((el) => getComputedStyle(el).transform)
  expect(hoverTransform).not.toBe('none')
  expect(imgHoverTransform).toBe('none')

  // Click (press): container scales down; image still has no transform
  const layoutBefore = await logo.evaluate((el) => ({
    offsetLeft: (el as HTMLElement).offsetLeft,
    offsetTop: (el as HTMLElement).offsetTop,
    offsetWidth: (el as HTMLElement).offsetWidth,
    offsetHeight: (el as HTMLElement).offsetHeight,
  }))
  await page.mouse.down()
  const activeTransform = await logo.evaluate((el) => getComputedStyle(el).transform)
  const imgActiveTransform = await logoImg.evaluate((el) => getComputedStyle(el).transform)
  expect(activeTransform).not.toBe('none')
  expect(imgActiveTransform).toBe('none')

  // No layout reflow/jump (transforms must not change layout metrics)
  const layoutDuring = await logo.evaluate((el) => ({
    offsetLeft: (el as HTMLElement).offsetLeft,
    offsetTop: (el as HTMLElement).offsetTop,
    offsetWidth: (el as HTMLElement).offsetWidth,
    offsetHeight: (el as HTMLElement).offsetHeight,
  }))
  expect(layoutBefore).toEqual(layoutDuring)

  await page.mouse.up()
})

test('Homepage: hero typewriter does not shift layout (desktop + mobile)', async ({ page }) => {
  test.setTimeout(120_000)

  const checkStable = async (viewport: { width: number; height: number }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')

    const hero = page.locator('h1.hero-title').first()
    const submit = page.getByRole('button', { name: 'Найти' }).first()

    await expect(hero).toBeVisible()
    await expect(submit).toBeVisible()

    // Two-line structure: first line is static, second line has no leading spaces
    const heroText = await hero.innerText()
    const lines = heroText.split('\n').map((l) => l.replace(/\s+$/g, ''))
    expect(lines[0]).toBe('Найдите жильё,')
    expect(lines[1] ?? '').toBe((lines[1] ?? '').trimStart())

    const heroBox1 = await hero.boundingBox()
    const submitBox1 = await submit.boundingBox()

    // Wait through typing/deleting cycles
    await page.waitForTimeout(3500)
    const heroBox2 = await hero.boundingBox()
    const submitBox2 = await submit.boundingBox()

    await page.waitForTimeout(3500)
    const heroBox3 = await hero.boundingBox()
    const submitBox3 = await submit.boundingBox()

    // Height and Y positions should remain stable (no layout shift)
    expect(heroBox1?.y).toBe(heroBox2?.y)
    expect(heroBox1?.y).toBe(heroBox3?.y)
    expect(heroBox1?.height).toBe(heroBox2?.height)
    expect(heroBox1?.height).toBe(heroBox3?.height)

    expect(submitBox1?.y).toBe(submitBox2?.y)
    expect(submitBox1?.y).toBe(submitBox3?.y)
  }

  // Desktop
  await checkStable({ width: 1280, height: 800 })
  // Mobile
  await checkStable({ width: 390, height: 844 })
})

