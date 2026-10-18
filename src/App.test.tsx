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

  it('shows a single search box: in the page on home, in the header elsewhere', () => {
    const { unmount } = renderApp('/')
    expect(screen.getAllByRole('combobox', { name: 'Search for a city' })).toHaveLength(1)
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('combobox'))
    unmount()

    renderApp('/city/51.5/-0.12')
    expect(screen.getAllByRole('combobox', { name: 'Search for a city' })).toHaveLength(1)
    expect(screen.getByRole('banner')).toContainElement(screen.getByRole('combobox'))
  })

  it('opens settings as a modal and closes it with Escape, restoring focus', async () => {
    renderApp()
    const trigger = screen.getByRole('button', { name: 'Settings' })

    await userEvent.click(trigger)
    expect(screen.getByRole('dialog', { name: 'Settings' })).toHaveAttribute('aria-modal', 'true')

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes settings from the close button', async () => {
    renderApp()
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }))
    await userEvent.click(screen.getByRole('button', { name: 'Close settings' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('reads coordinates on the city route', async () => {
    renderApp('/city/51.5/-0.12')

    expect(await screen.findByRole('heading', { name: '51.5, -0.12' })).toBeInTheDocument()
  })

  it('shows not found for unknown routes', () => {
    renderApp('/nope')

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })
})
