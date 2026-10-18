import { useParams } from 'react-router'

export function City() {
  const { lat, lon } = useParams()

  return (
    <>
      <h1>City</h1>
      <p>
        Forecast for {lat}, {lon} coming soon.
      </p>
    </>
  )
}
