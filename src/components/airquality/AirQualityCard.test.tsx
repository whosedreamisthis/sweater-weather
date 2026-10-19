import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/server'
import { AIR_QUALITY_URL } from '../../test/handlers'
import { renderWithProviders } from '../../test/renderWithProviders'
import { AirQualityCard } from './AirQualityCard'

describe('AirQualityCard', () => {
  it('shows a skeleton, then the AQI, category, note and particles', async () => {
    renderWithProviders(<AirQualityCard lat={51.5} lon={-0.12} />)

    expect(screen.getByLabelText('Loading air quality')).toBeInTheDocument()
    expect(await screen.findByText('Good')).toBeInTheDocument()
    expect(screen.getByText(/42/)).toBeInTheDocument()
    expect(screen.getByText(/Enjoy time outside/)).toBeInTheDocument()
    expect(screen.getByText('8.4 µg/m³')).toBeInTheDocument()
    expect(screen.getByText('14.9 µg/m³')).toBeInTheDocument()
  })

  it('shows a friendly message when the region has no data', async () => {
    server.use(
      http.get(AIR_QUALITY_URL, () =>
        HttpResponse.json({ latitude: 0, longitude: 0, current: { time: 't', us_aqi: null } }),
      ),
    )
    renderWithProviders(<AirQualityCard lat={0} lon={0} />)

    expect(await screen.findByText(/isn't available for this location/)).toBeInTheDocument()
  })

  it('shows an error with Retry that recovers', async () => {
    server.use(http.get(AIR_QUALITY_URL, () => HttpResponse.error(), { once: true }))
    const { queryClient } = renderWithProviders(<AirQualityCard lat={51.5} lon={-0.12} />)

    const retry = await screen.findByRole('button', { name: 'Retry' })
    expect(screen.getByRole('alert')).toHaveTextContent(/Couldn't load air quality/)

    retry.click()
    expect(await screen.findByText('Good')).toBeInTheDocument()
    queryClient.clear()
  })
})
