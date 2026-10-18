import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import styles from './Layout.module.css'
import { Logo } from './Logo'
import { SearchBox } from './SearchBox'
import { SettingsModal } from './SettingsModal'
import { UnitToggle } from './UnitToggle'

export function Layout() {
  const isHome = useLocation().pathname === '/'
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <Logo />
          <span>SweaterWeather</span>
        </Link>
        {!isHome && (
          <div className={styles.search}>
            <SearchBox />
          </div>
        )}
        <nav aria-label="Main" className={styles.nav}>
          <UnitToggle />
          <button type="button" className={styles.settings} onClick={() => setSettingsOpen(true)}>
            Settings
          </button>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
