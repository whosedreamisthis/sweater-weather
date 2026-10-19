import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router'
import { server } from '../test/server'
import { FORECAST_URL, forecastFixture } from '../test/handlers'
import { renderWithProviders } from '../test/renderWithProviders'
import { DEFAULT_UNITS, useAppStore } from '../store/useAppStore'
import { City } from './City'

function renderCity(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/city/:lat/:lon" element={<City />} />
    </Routes>,
    { route },
  )
}

describe('City page', () => {
  beforeEach(() => useAppStore.setState({ units: DEFAULT_UNITS }))

  it('renders every current-conditions field and sets the page title', async () => {
    renderCity('/city/51.5/-0.12?name=London')

    expect(await screen.findByRole('heading', { name: 'London' })).toBeInTheDocument()
    const card = within(screen.getByRole('region', { name: 'London' }))
    expect(card.getByText('14°C')).toBeInTheDocument()
    expect(screen.getByText('Feels like 13°C')).toBeInTheDocument()
    expect(screen.getByText('Overcast')).toBeInTheDocument()
    expect(screen.getByText('71%')).toBeInTheDocument()
    expect(screen.getByText('12 km/h SW')).toBeInTheDocument()
    expect(screen.getByText('1008 hPa')).toBeInTheDocument()
    expect(screen.getByText('2.1')).toBeInTheDocument()
    expect(screen.getByText('24 km')).toBeInTheDocument()
    expect(screen.getByText('Updated just now')).toBeInTheDocument()
    expect(document.title).toBe('London · SweaterWeather')
  })

  it('shows a skeleton while loading', () => {
    renderCity('/city/51.5/-0.12')
    expect(screen.getByLabelText('Loading current weather')).toBeInTheDocument()
  })

  it('shows an error and recovers on Retry', async () => {
    let fail = true
    server.use(
      http.get(FORECAST_URL, () =>
        fail
          ? HttpResponse.json({ reason: 'Service down.' }, { status: 503 })
          : HttpResponse.json(forecastFixture),
      ),
    )
    renderCity('/city/51.5/-0.12?name=London')

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't load the weather")
    fail = false
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByRole('heading', { name: 'London' })).toBeInTheDocument()
  })

  it('shows a friendly message for invalid coordinates', async () => {
    renderCity('/city/200/abc')

    expect(await screen.findByRole('alert')).toHaveTextContent("coordinates don't look right")
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
  })
})

describe('City page hourly forecast', () => {
  beforeEach(() => useAppStore.setState({ units: DEFAULT_UNITS }))

  it('shows 24 hours starting at "Now" from the same forecast request', async () => {
    const times = Array.from({ length: 48 }, (_, i) => {
      const day = i < 24 ? '18' : '19'
      return `2026-10-${day}T${String(i % 24).padStart(2, '0')}:00`
    })
    let requests = 0
    server.use(
      http.get(FORECAST_URL, () => {
        requests += 1
        return HttpResponse.json({
          ...forecastFixture,
          hourly: {
            time: times,
            temperature_2m: times.map((_, i) => i),
            precipitation_probability: times.map(() => 30),
            weather_code: times.map(() => 3),
          },
        })
      }),
    )
    renderCity('/city/51.5/-0.12?name=London')

    expect(await screen.findByText('Now')).toBeInTheDocument()
    const list = screen.getByRole('list', { name: 'Next 24 hours' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(24)
    expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent('12°C')
    expect(requests).toBe(1)
  })

  it('shows an hourly skeleton while loading', () => {
    renderCity('/city/51.5/-0.12')
    expect(screen.getByLabelText('Loading hourly forecast')).toBeInTheDocument()
  })
})
