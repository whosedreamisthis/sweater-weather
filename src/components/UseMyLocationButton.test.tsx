import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router'
import { http, HttpResponse } from 'msw'
import { REVERSE_GEOCODING_URL } from '../api/reverseGeocoding'
import { renderWithProviders } from '../test/renderWithProviders'
import { server } from '../test/server'
import { UseMyLocationButton } from './UseMyLocationButton'

function LocationDisplay() {
  const { pathname, search } = useLocation()
  return <div data-testid="location">{pathname + search}</div>
}

function setup() {
  return renderWithProviders(
    <>
      <UseMyLocationButton />
      <LocationDisplay />
    </>,
  )
}

function mockGeolocation(impl: (ok: PositionCallback, err: PositionErrorCallback) => void) {
  const getCurrentPosition = vi.fn(impl)
  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition },
    configurable: true,
  })
  return getCurrentPosition
}

afterEach(() => {
  Object.defineProperty(navigator, 'geolocation', { value: undefined, configurable: true })
})

const click = () => userEvent.click(screen.getByRole('button', { name: 'Use my location' }))

describe('UseMyLocationButton', () => {
  it('does not request location on render', () => {
    const spy = mockGeolocation(() => {})
    setup()
    expect(spy).not.toHaveBeenCalled()
  })

  it('navigates to the rounded coordinates with the city name on success', async () => {
    server.use(http.get(REVERSE_GEOCODING_URL, () => HttpResponse.json({ city: 'London' })))
    mockGeolocation((ok) =>
      ok({ coords: { latitude: 51.50735, longitude: -0.12776 } } as GeolocationPosition),
    )
    setup()
    await click()
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/city/51.51/-0.13?name=London',
      ),
    )
  })

  it('shows a message when permission is denied and stays usable', async () => {
    mockGeolocation((_ok, err) => err({ code: 1 } as GeolocationPositionError))
    setup()
    await click()
    expect(await screen.findByText(/Location access was blocked/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Use my location' })).toBeEnabled()
    expect(screen.getByTestId('location')).toHaveTextContent('/')
  })

  it('shows a message when the browser is unsupported', async () => {
    Object.defineProperty(navigator, 'geolocation', { value: undefined, configurable: true })
    setup()
    await click()
    expect(await screen.findByText(/couldn’t get your location/)).toBeInTheDocument()
  })

  it('shows a message on timeout', async () => {
    mockGeolocation((_ok, err) => err({ code: 3 } as GeolocationPositionError))
    setup()
    await click()
    expect(await screen.findByText(/took too long/)).toBeInTheDocument()
  })
})

describe('UseMyLocationButton reverse geocoding failure', () => {
  it('falls back to Current location', async () => {
    server.use(http.get(REVERSE_GEOCODING_URL, () => HttpResponse.error()))
    mockGeolocation((ok) =>
      ok({ coords: { latitude: 51.50735, longitude: -0.12776 } } as GeolocationPosition),
    )
    setup()
    await click()
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/city/51.51/-0.13?name=Current%20location',
      ),
    )
  })
})
