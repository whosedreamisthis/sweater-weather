import { Link, Outlet } from 'react-router'
import styles from './Layout.module.css'

export function Layout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          SweaterWeather
        </Link>
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
