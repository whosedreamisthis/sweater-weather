import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { routes } from './router'
import { renderWithProviders } from './test/renderWithProviders'

function renderApp(route = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [route] })
  return renderWithProviders(<RouterProvider router={router} />, {
    router: false,
  })
}

describe('app shell', () => {
  it('renders the layout and home page', () => {
    renderApp()

    expect(screen.getByRole('link', { name: 'SweaterWeather' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument()
  })

  it('navigates to settings', async () => {
    renderApp()

    await userEvent.click(screen.getByRole('link', { name: 'Settings' }))

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  })

  it('reads coordinates on the city route', () => {
    renderApp('/city/51.5/-0.12')

    expect(screen.getByRole('heading', { name: 'City' })).toBeInTheDocument()
    expect(screen.getByText(/51\.5, -0\.12/)).toBeInTheDocument()
  })

  it('shows not found for unknown routes', () => {
    renderApp('/nope')

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })
})
