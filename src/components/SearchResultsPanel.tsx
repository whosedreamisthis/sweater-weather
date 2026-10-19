import type { Location } from '../api/types'
import styles from './SearchBox.module.css'

type Props = {
  listboxId: string
  results: Location[]
  isLoading: boolean
  isError: boolean
  activeOption: number
  optionId: (index: number) => string
  onSelect: (city: Location) => void
  onRetry: () => void
}

function PanelMessage({ isLoading, isError, isEmpty, onRetry }: {
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
  onRetry: () => void
}) {
  if (isLoading) return <p className={styles.message}>Searching…</p>
  if (isError) {
    return (
      <div className={styles.message}>
        <p>Couldn’t load results.</p>
        <button type="button" className={styles.retry} onClick={onRetry}>
          Retry
        </button>
      </div>
    )
  }
  if (isEmpty) return <p className={styles.message}>No cities found</p>
  return null
}

/** Dropdown under the search input: a status message, or the listbox of matching cities. */
export function SearchResultsPanel({
  listboxId,
  results,
  isLoading,
  isError,
  activeOption,
  optionId,
  onSelect,
  onRetry,
}: Props) {
  const isEmpty = results.length === 0
  return (
    <div className={styles.panel}>
      <PanelMessage isLoading={isLoading} isError={isError} isEmpty={isEmpty} onRetry={onRetry} />
      <ul
        id={listboxId}
        role="listbox"
        aria-label="Cities"
        className={styles.list}
        hidden={isLoading || isError || isEmpty}
      >
        {results.map((city, index) => (
          <li
            key={city.id}
            id={optionId(index)}
            role="option"
            aria-selected={index === activeOption}
            className={`${styles.option} ${index === activeOption ? styles.active : ''}`}
            onClick={() => onSelect(city)}
          >
            <span className={styles.name}>{city.name}</span>
            <span className={styles.detail}>
              {[city.admin1, city.country].filter(Boolean).join(', ')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
