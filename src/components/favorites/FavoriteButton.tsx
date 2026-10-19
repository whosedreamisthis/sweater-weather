import { useState } from 'react'
import type { Location } from '../../api/types'
import { MAX_FAVORITES, isFavorite, useAppStore } from '../../store/useAppStore'
import styles from './FavoriteButton.module.css'

type Props = {
  location: Location
}

export function FavoriteButton({ location }: Props) {
  const favorites = useAppStore((s) => s.favorites)
  const addFavorite = useAppStore((s) => s.addFavorite)
  const removeFavorite = useAppStore((s) => s.removeFavorite)
  const [message, setMessage] = useState('')

  const saved = isFavorite(favorites, location.latitude, location.longitude)

  function toggle() {
    if (saved) {
      removeFavorite(location.latitude, location.longitude)
      setMessage('')
    } else if (addFavorite(location) === 'full') {
      setMessage(`You can save up to ${MAX_FAVORITES} locations. Remove one to add another.`)
    } else {
      setMessage('')
    }
  }

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.button} aria-pressed={saved} onClick={toggle}>
        <span aria-hidden="true">{saved ? '★' : '☆'}</span> {saved ? 'Saved' : 'Save location'}
      </button>
      <p className={styles.message} role="status">
        {message}
      </p>
    </div>
  )
}
