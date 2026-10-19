import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import type { Location } from '../api/types'
import { useCitySearch } from '../hooks/useCitySearch'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import styles from './SearchBox.module.css'
import { UseMyLocationButton } from './UseMyLocationButton'

const MAX_RESULTS = 5
const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 300

export function SearchBox() {
  const inputId = useId()
  const listboxId = useId()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS)
  const { data, isFetching, isError, refetch } = useCitySearch(debouncedQuery)

  const showPanel = open && query.trim().length >= MIN_QUERY_LENGTH
  const results = data?.slice(0, MAX_RESULTS) ?? []
  // Typing ahead of the debounce also counts as loading.
  const isLoading = showPanel && (query !== debouncedQuery || isFetching)

  const hasOptions = showPanel && !isLoading && !isError && results.length > 0
  const activeOption = hasOptions && activeIndex < results.length ? activeIndex : -1
  const optionId = (index: number) => `${listboxId}-option-${index}`

  let status = ''
  if (showPanel && !isLoading && !isError) {
    status =
      results.length === 0
        ? 'No cities found'
        : `${results.length} ${results.length === 1 ? 'result' : 'results'} available`
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault()
        if (query.trim().length < MIN_QUERY_LENGTH) return
        if (!open) {
          setOpen(true)
          return
        }
        if (!hasOptions) return
        const step = event.key === 'ArrowDown' ? 1 : -1
        const from = activeOption === -1 && step === -1 ? 0 : activeOption
        setActiveIndex((from + step + results.length) % results.length)
        break
      }
      case 'Enter':
        if (activeOption !== -1) {
          event.preventDefault()
          selectCity(results[activeOption])
        }
        break
      case 'Escape':
        if (showPanel) {
          event.preventDefault()
          setOpen(false)
          setActiveIndex(-1)
        }
        break
    }
  }

  function clear() {
    setQuery('')
    setOpen(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  function selectCity(city: Location) {
    setActiveIndex(-1)
    setQuery(city.name)
    setOpen(false)
    navigate(
      `/city/${city.latitude}/${city.longitude}?name=${encodeURIComponent(city.name)}`,
    )
  }

  return (
    <div className={styles.searchBox} ref={containerRef}>
      <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        Search for a city
      </label>
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        id={inputId}
        ref={inputRef}
        className={styles.input}
        type="text"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={showPanel ? listboxId : undefined}
        aria-activedescendant={activeOption === -1 ? undefined : optionId(activeOption)}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="Search for a city…"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
          setActiveIndex(-1)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {query && (
        <button type="button" className={styles.clear} aria-label="Clear search" onClick={clear}>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      )}
      <div role="status" aria-live="polite" className={styles.status}>
        {status}
      </div>
      {showPanel && (
        <div className={styles.panel}>
          {isLoading ? (
            <p className={styles.message}>Searching…</p>
          ) : isError ? (
            <div className={styles.message}>
              <p>Couldn’t load results.</p>
              <button type="button" className={styles.retry} onClick={() => refetch()}>
                Retry
              </button>
            </div>
          ) : results.length === 0 ? (
            <p className={styles.message}>No cities found</p>
          ) : null}
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Cities"
            className={styles.list}
            hidden={isLoading || isError || results.length === 0}
          >
            {results.map((city, index) => (
              <li
                key={city.id}
                id={optionId(index)}
                role="option"
                aria-selected={index === activeOption}
                className={`${styles.option} ${index === activeOption ? styles.active : ''}`}
                onClick={() => selectCity(city)}
              >
                <span className={styles.name}>{city.name}</span>
                <span className={styles.detail}>
                  {[city.admin1, city.country].filter(Boolean).join(', ')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      </div>
      <UseMyLocationButton />
    </div>
  )
}
