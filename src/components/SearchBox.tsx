import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { MIN_QUERY_LENGTH, RESULT_COUNT } from '../api/geocoding'
import type { Location } from '../api/types'
import { useCitySearch } from '../hooks/useCitySearch'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { cityPath } from '../utils/routes'
import styles from './SearchBox.module.css'
import { ClearIcon, SearchIcon } from './SearchIcons'
import { SearchResultsPanel } from './SearchResultsPanel'
import { UseMyLocationButton } from './UseMyLocationButton'

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
      if (!(event.target instanceof Node) || !containerRef.current?.contains(event.target)) {
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
  const results = data?.slice(0, RESULT_COUNT) ?? []
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
    navigate(cityPath(city.latitude, city.longitude, city.name, city.country))
  }

  return (
    <div className={styles.searchBox} ref={containerRef}>
      <div className={styles.field}>
        <label htmlFor={inputId} className={styles.label}>
          Search for a city
        </label>
        <SearchIcon />
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
            <ClearIcon />
          </button>
        )}
        <div role="status" aria-live="polite" className={styles.status}>
          {status}
        </div>
        {showPanel && (
          <SearchResultsPanel
            listboxId={listboxId}
            results={results}
            isLoading={isLoading}
            isError={isError}
            activeOption={activeOption}
            optionId={optionId}
            onSelect={selectCity}
            onRetry={() => void refetch()}
          />
        )}
      </div>
      <UseMyLocationButton />
    </div>
  )
}
