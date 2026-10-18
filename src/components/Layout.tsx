import { Link, Outlet, useLocation } from 'react-router'
import styles from './Layout.module.css'
import { SearchBox } from './SearchBox'

export function Layout() {
  const isHome = useLocation().pathname === '/'

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          SweaterWeather
        </Link>
        {!isHome && (
          <div className={styles.search}>
            <SearchBox />
          </div>
        )}
        <nav aria-label="Main">
          <Link to="/settings">Settings</Link>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
