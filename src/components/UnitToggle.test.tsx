import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { routes } from '../router'
import { DEFAULT_UNITS, useAppStore } from '../store/useAppStore'
import { server } from '../test/server'
import { FORECAST_URL, forecastFixture } from '../test/handlers'
import { renderWithProviders } from '../test/renderWithProviders'

function renderApp(route: string) {
  const router = createMemoryRouter(routes, { initialEntries: [route] })
  return renderWithProviders(<RouterProvider router={router} />, { router: false })
}

/** Answers per unit params, like Open-Meteo: 14.2°C becomes 57.6°F, 11.5 km/h becomes 7.1 mph. */
function unitAwareForecast() {
  const requests: URL[] = []
  server.use(
    http.get(FORECAST_URL, ({ request }) => {
      const url = new URL(request.url)
      requests.push(url)
      const f = url.searchParams.get('temperature_unit') === 'fahrenheit'
      const mph = url.searchParams.get('wind_speed_unit') === 'mph'
      return HttpResponse.json({
        ...forecastFixture,
        current: {
          ...forecastFixture.current,
          temperature_2m: f ? 57.6 : 14.2,
          apparent_temperature: f ? 55 : 12.8,
          wind_speed_10m: mph ? 7.1 : 11.5,
        },
      })
    }),
  )
  return requests
}

beforeEach(() => useAppStore.setState({ units: DEFAULT_UNITS }))

describe('unit controls', () => {
  it('header toggle refetches and shows values in the new units', async () => {
    const requests = unitAwareForecast()
    renderApp('/city/51.5/-0.12?name=London')

    expect(await screen.findByText('14°C')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Switch to Fahrenheit' }))

    expect(await screen.findByText('58°F')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Switch to Celsius' })).toBeInTheDocument()
    expect(requests.map((u) => u.searchParams.get('temperature_unit'))).toEqual([
      'celsius',
      'fahrenheit',
    ])
  })

  it('keeps the card on screen, in its old units, while the new units load', async () => {
    unitAwareForecast()
    renderApp('/city/51.5/-0.12?name=London')
    expect(await screen.findByText('14°C')).toBeInTheDocument()

    server.use(
      http.get(FORECAST_URL, async () => {
        await delay(100)
        return HttpResponse.json(forecastFixture)
      }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Switch to Fahrenheit' }))

    expect(screen.queryByLabelText('Loading current weather')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'London' })).toBeInTheDocument()
    expect(screen.getByText('14°C')).toBeInTheDocument()
    expect(await screen.findByText('14°F')).toBeInTheDocument()
  })

  it('settings radios change wind units on the city page', async () => {
    const requests = unitAwareForecast()
    renderApp('/settings')

    expect(screen.getByRole('radio', { name: '°C' })).toBeChecked()
    await userEvent.click(screen.getByRole('radio', { name: 'mph' }))
    expect(screen.getByRole('radio', { name: 'mph' })).toBeChecked()
    expect(useAppStore.getState().units.wind).toBe('mph')

    const router = createMemoryRouter(routes, { initialEntries: ['/city/51.5/-0.12?name=London'] })
    renderWithProviders(<RouterProvider router={router} />, { router: false })
    expect(await screen.findByText('7 mph SW')).toBeInTheDocument()
    expect(requests.at(-1)?.searchParams.get('wind_speed_unit')).toBe('mph')
  })
})
