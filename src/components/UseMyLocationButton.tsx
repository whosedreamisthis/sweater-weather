import { useNavigate } from 'react-router'
import { GEOLOCATION_MESSAGES, useGeolocation } from '../hooks/useGeolocation'
import { useReverseGeocodeMutation } from '../hooks/useReverseGeocode'
import { cityPath } from '../utils/routes'
import styles from './UseMyLocationButton.module.css'

export function UseMyLocationButton() {
  const navigate = useNavigate()
  const { status, locate } = useGeolocation()
  // The geolocation status flips to 'success' before the city name lookup finishes,
  // so the mutation's pending state keeps the button disabled until we navigate. It
  // resets on its own, which matters because the button lives in the persistent layout.
  const { mutateAsync: lookUpName, isPending } = useReverseGeocodeMutation()
  const loading = status === 'loading' || isPending
  const message = GEOLOCATION_MESSAGES[status]

  function handleClick() {
    locate(async (coords) => {
      const name = await lookUpName(coords)
      navigate(cityPath(coords.latitude, coords.longitude, name))
    })
  }

  return (
    <div className={styles.wrapper}>
      <button type="button" className={styles.button} onClick={handleClick} disabled={loading}>
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
        {loading ? 'Locating…' : 'Use my location'}
      </button>
      <div role="status" aria-live="polite" className={message ? styles.message : styles.hidden}>
        {message}
      </div>
    </div>
  )
}
