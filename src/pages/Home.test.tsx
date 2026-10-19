import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import type { Location } from '../api/types'
import { DEFAULT_UNITS, useAppStore } from '../store/useAppStore'
import { FORECAST_URL } from '../test/handlers'
import { renderWithProviders } from '../test/renderWithProviders'
import { server } from '../test/server'
import { Home } from './Home'

const london: Location = {
  id: 1,
  name: 'London',
  country: 'United Kingdom',
  latitude: 51.5,
  longitude: -0.12,
  timezone: 'Europe/London',
}
const paris: Location = {
  id: 2,
  name: 'Paris',
  country: 'France',
  latitude: 48.85,
  longitude: 2.35,
  timezone: 'Europe/Paris',
}

describe('Home favorites', () => {
  beforeEach(() => useAppStore.setState({ units: DEFAULT_UNITS, favorites: [] }))

  it('shows guidance when there are no favorites', () => {
    renderWithProviders(<Home />)
    expect(screen.getByText(/No saved locations yet/)).toBeInTheDocument()
  })

  it('shows popular cities and how it works', async () => {
    renderWithProviders(<Home />)

    expect(screen.getByRole('heading', { name: 'Popular cities' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Tokyo/ })).toHaveAttribute(
      'href',
      '/city/35.68/139.69?name=Tokyo',
    )
    expect(screen.getByRole('heading', { name: 'How it works' })).toBeInTheDocument()
    expect((await screen.findAllByText(/14°C/)).length).toBeGreaterThan(0)
  })

  it('keeps popular cities and how it works below saved locations', () => {
    useAppStore.setState({ favorites: [london] })
    renderWithProviders(<Home />)

    const saved = screen.getByRole('heading', { name: 'Saved locations' })
    const popular = screen.getByRole('heading', { name: 'Popular cities' })
    const how = screen.getByRole('heading', { name: 'How it works' })
    expect(saved.compareDocumentPosition(popular) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(popular.compareDocumentPosition(how) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('renders a card per favorite with temperature and links to the city', async () => {
    useAppStore.setState({ favorites: [london] })
    renderWithProviders(<Home />)

    expect(await screen.findByText(/14°C/)).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: 'Saved locations' })).getByRole('link', {
        name: /London/,
      }),
    ).toHaveAttribute('href', '/city/51.5/-0.12?name=London')
  })

  it('removes a favorite', async () => {
    useAppStore.setState({ favorites: [london] })
    renderWithProviders(<Home />)

    await userEvent.click(screen.getByRole('button', { name: 'Remove London' }))
    expect(screen.getByText(/No saved locations yet/)).toBeInTheDocument()
    expect(useAppStore.getState().favorites).toEqual([])
  })

  it('isolates a failing card from the rest of the list', async () => {
    server.use(
      http.get(FORECAST_URL, ({ request }) => {
        const lat = new URL(request.url).searchParams.get('latitude')
        return lat === '48.85'
          ? HttpResponse.json({ reason: 'Service down.' }, { status: 503 })
          : undefined
      }),
    )
    useAppStore.setState({ favorites: [london, paris] })
    renderWithProviders(<Home />)

    expect(await screen.findByText(/14°C/)).toBeInTheDocument()
    expect(await screen.findByText(/Couldn't load/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Paris/ })).toBeInTheDocument()
  })
})
