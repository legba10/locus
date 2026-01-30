import { test, expect } from '@playwright/test'

test('ListingCard Link navigates client-side (no full reload)', async ({ page }) => {
  await page.goto('/search?city=Moscow')

  const documentRequests: string[] = []
  page.on('request', (req) => {
    if (req.resourceType() === 'document') documentRequests.push(req.url())
  })

  await page.locator('a[aria-label^="Open listing:"]').first().click()
  await expect(page).toHaveURL(/\/listings\/lst_/)

  // Client-side navigation should not trigger a new document load.
  expect(documentRequests).toEqual([])
})

test('router.push button navigates client-side to /register', async ({ page }) => {
  await page.goto('/__router_test__')

  const documentRequests: string[] = []
  page.on('request', (req) => {
    if (req.resourceType() === 'document') documentRequests.push(req.url())
  })

  await page.getByRole('button', { name: 'Go to /register' }).click()
  await expect(page).toHaveURL(/\/register$/)

  expect(documentRequests).toEqual([])
})

