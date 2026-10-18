import { Link, Outlet, useLocation } from 'react-router'
import styles from './Layout.module.css'
import { Logo } from './Logo'
import { SearchBox } from './SearchBox'
import { UnitToggle } from './UnitToggle'

export function Layout() {
  const isHome = useLocation().pathname === '/'

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
          <Link to="/settings">Settings</Link>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
