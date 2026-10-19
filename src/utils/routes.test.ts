import { cityPath } from './routes'

describe('cityPath', () => {
  it('builds the city route with the name as a query param', () => {
    expect(cityPath(51.51, -0.13, 'London')).toBe('/city/51.51/-0.13?name=London')
  })

  it('encodes names with spaces and special characters', () => {
    expect(cityPath(64.15, -21.94, 'Reykjavík & co')).toBe(
      '/city/64.15/-21.94?name=Reykjav%C3%ADk%20%26%20co',
    )
  })
})
