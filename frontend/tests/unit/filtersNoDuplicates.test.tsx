/**
 * TZ-8: Проверка отсутствия дубликатов в фильтрах.
 * - Уникальные ключи списков → один рендер опций, без задвоения символов.
 * - DOM: количество чипов совпадает с ожидаемым для каждой секции.
 */
import { render, screen, within } from '@testing-library/react'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { FilterChips } from '@/components/filters/FilterChips'
import { PROPERTY_TYPES, DURATION_OPTIONS, ROOMS_OPTIONS } from '@/core/filters'

describe('Filters: no duplicate symbols', () => {
  it('FilterChips renders each option exactly once per section', () => {
    const options = [...PROPERTY_TYPES]
    render(
      <FilterChips
        options={options}
        value=""
        onChange={() => {}}
        label="Тип жилья"
      />
    )
    const container = screen.getByTestId('filter-chips')
    const buttons = within(container).getAllByRole('button')
    expect(buttons).toHaveLength(options.length)
    const labels = buttons.map((b) => b.textContent?.trim() ?? '')
    const unique = [...new Set(labels)]
    expect(unique).toHaveLength(labels.length)
    expect(labels).toEqual(options.map((o) => o.label))
  })

  it('FilterPanel has three chip sections with expected counts', () => {
    render(<FilterPanel embedded showSearchButtons={false} />)
    const chipsContainers = screen.getAllByTestId('filter-chips')
    expect(chipsContainers.length).toBe(3)

    const typeSection = chipsContainers.find((c) => c.getAttribute('data-label') === 'Тип жилья')
    const durationSection = chipsContainers.find((c) => c.getAttribute('data-label') === 'Срок')
    const roomsSection = chipsContainers.find((c) => c.getAttribute('data-label') === 'Комнаты')

    expect(typeSection).toBeDefined()
    expect(Number(typeSection?.getAttribute('data-options-count'))).toBe(PROPERTY_TYPES.length)
    expect(within(typeSection!).getAllByRole('button')).toHaveLength(PROPERTY_TYPES.length)

    expect(durationSection).toBeDefined()
    expect(Number(durationSection?.getAttribute('data-options-count'))).toBe(DURATION_OPTIONS.length)
    expect(within(durationSection!).getAllByRole('button')).toHaveLength(DURATION_OPTIONS.length)

    expect(roomsSection).toBeDefined()
    expect(Number(roomsSection?.getAttribute('data-options-count'))).toBe(ROOMS_OPTIONS.length)
    expect(within(roomsSection!).getAllByRole('button')).toHaveLength(ROOMS_OPTIONS.length)
  })

  it('each FilterChips section has no duplicate button text', () => {
    render(<FilterPanel embedded showSearchButtons={false} />)
    const chipsContainers = screen.getAllByTestId('filter-chips')
    for (const container of chipsContainers) {
      const buttons = within(container).getAllByRole('button')
      const texts = buttons.map((b) => b.textContent?.trim() ?? '')
      const unique = [...new Set(texts)]
      expect(unique.length).toBe(texts.length)
    }
  })
})
