import { useState } from 'react'
import { useNavigate } from 'react-router'
import { reverseGeocode } from '../api/reverseGeocoding'
import { GEOLOCATION_MESSAGES, useGeolocation } from '../hooks/useGeolocation'
import styles from './UseMyLocationButton.module.css'

export function UseMyLocationButton() {
  const navigate = useNavigate()
  const { status, locate } = useGeolocation()
  // The geolocation status flips to 'success' before the city name lookup finishes,
  // so track that second phase here to keep the button disabled until we navigate.
  const [resolving, setResolving] = useState(false)
  const loading = status === 'loading' || resolving
  const message = GEOLOCATION_MESSAGES[status]

  function handleClick() {
    locate(async ({ latitude, longitude }) => {
      setResolving(true)
      try {
        const name = await reverseGeocode(latitude, longitude)
        navigate(`/city/${latitude}/${longitude}?name=${encodeURIComponent(name)}`)
      } finally {
        // The button lives in the persistent layout, so it survives navigation.
        setResolving(false)
      }
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
