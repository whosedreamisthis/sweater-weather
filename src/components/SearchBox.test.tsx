import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { useLocation } from 'react-router'
import { GEOCODING_URL } from '../test/handlers'
import { renderWithProviders } from '../test/renderWithProviders'
import { server } from '../test/server'
import { SearchBox } from './SearchBox'

function LocationDisplay() {
  const { pathname, search } = useLocation()
  return <div data-testid="location">{pathname + search}</div>
}

const input = () => screen.getByRole('combobox', { name: 'Search for a city' })

describe('SearchBox', () => {
  it('shows nothing for queries under 2 characters', async () => {
    renderWithProviders(<SearchBox />)

    await userEvent.type(input(), 'l')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.queryByText('Searching…')).not.toBeInTheDocument()
    expect(input()).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows debounced results with region and country', async () => {
    renderWithProviders(<SearchBox />)

    await userEvent.type(input(), 'lond')

    expect(screen.getByText('Searching…')).toBeInTheDocument()
    const options = await screen.findAllByRole('option')
    expect(options).toHaveLength(2)
    expect(options[0]).toHaveTextContent('London')
    expect(options[0]).toHaveTextContent('England, United Kingdom')
    expect(options[1]).toHaveTextContent('Canada')
    expect(input()).toHaveAttribute('aria-expanded', 'true')
  })

  it('navigates to the city route when a result is selected', async () => {
    renderWithProviders(
      <>
        <SearchBox />
        <LocationDisplay />
      </>,
    )

    await userEvent.type(input(), 'lond')
    await userEvent.click((await screen.findAllByRole('option'))[0])

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/city/51.50853/-0.12574?name=London',
    )
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input()).toHaveValue('London')
  })

  it('announces the result count in a live region', async () => {
    renderWithProviders(<SearchBox />)

    await userEvent.type(input(), 'lond')

    await screen.findAllByRole('option')

    expect(screen.getAllByRole('status')[0]).toHaveTextContent('2 results available')
  })

  it('supports arrow keys and Enter to select', async () => {
    renderWithProviders(
      <>
        <SearchBox />
        <LocationDisplay />
      </>,
    )

    await userEvent.type(input(), 'lond')
    const options = await screen.findAllByRole('option')

    await userEvent.keyboard('{ArrowDown}')
    expect(input()).toHaveAttribute('aria-activedescendant', options[0].id)
    expect(options[0]).toHaveAttribute('aria-selected', 'true')

    await userEvent.keyboard('{ArrowDown}')
    expect(input()).toHaveAttribute('aria-activedescendant', options[1].id)

    await userEvent.keyboard('{ArrowDown}')
    expect(input()).toHaveAttribute('aria-activedescendant', options[0].id)

    await userEvent.keyboard('{ArrowUp}')
    expect(input()).toHaveAttribute('aria-activedescendant', options[1].id)

    await userEvent.keyboard('{Enter}')
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/city/42.98339/-81.23304?name=London',
    )
  })

  it('does nothing on Enter without an active option', async () => {
    renderWithProviders(
      <>
        <SearchBox />
        <LocationDisplay />
      </>,
    )

    await userEvent.type(input(), 'lond')
    await screen.findAllByRole('option')
    await userEvent.keyboard('{Enter}')

    expect(screen.getByTestId('location')).toHaveTextContent('/')
    expect(screen.getByTestId('location')).not.toHaveTextContent('/city')
  })

  it('closes the dropdown on Escape and reopens it when typing', async () => {
    renderWithProviders(<SearchBox />)

    await userEvent.type(input(), 'lond')
    await screen.findAllByRole('option')

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input()).toHaveAttribute('aria-expanded', 'false')
    expect(input()).toHaveValue('lond')

    await userEvent.type(input(), 'o')
    expect(await screen.findAllByRole('option')).toHaveLength(2)
  })

  it('clears the input with the clear button', async () => {
    renderWithProviders(<SearchBox />)

    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()

    await userEvent.type(input(), 'lond')
    await screen.findAllByRole('option')
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(input()).toHaveValue('')
    expect(input()).toHaveFocus()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })

  it('closes the dropdown on outside click', async () => {
    renderWithProviders(
      <>
        <SearchBox />
        <button type="button">Outside</button>
      </>,
    )

    await userEvent.type(input(), 'lond')
    await screen.findAllByRole('option')

    await userEvent.click(screen.getByRole('button', { name: 'Outside' }))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input()).toHaveValue('lond')
  })

  it('limits the dropdown to 5 results', async () => {
    const many = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      name: `Town ${i + 1}`,
      latitude: i,
      longitude: i,
      country: 'Testland',
    }))
    server.use(http.get(GEOCODING_URL, () => HttpResponse.json({ results: many })))
    renderWithProviders(<SearchBox />)

    await userEvent.type(input(), 'town')

    expect(await screen.findAllByRole('option')).toHaveLength(5)
  })

  it('shows an empty state when nothing matches', async () => {
    server.use(http.get(GEOCODING_URL, () => HttpResponse.json({})))
    renderWithProviders(<SearchBox />)

    await userEvent.type(input(), 'zzzz')

    // Shown in the dropdown and announced in the live region.
    expect(await screen.findAllByText('No cities found')).toHaveLength(2)
    expect(screen.getAllByRole('status')[0]).toHaveTextContent('No cities found')
  })

  it('shows an error with a working retry', async () => {
    server.use(http.get(GEOCODING_URL, () => new HttpResponse(null, { status: 500 })))
    renderWithProviders(<SearchBox />)

    await userEvent.type(input(), 'lond')
    const retry = await screen.findByRole('button', { name: 'Retry' })

    server.resetHandlers()
    await userEvent.click(retry)

    expect(await screen.findAllByRole('option')).toHaveLength(2)
  })
})
