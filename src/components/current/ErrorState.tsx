import styles from './ErrorState.module.css'

type Props = {
  title: string
  message: string
  onRetry?: () => void
}

export function ErrorState({ title, message, onRetry }: Props) {
  return (
    <div className={styles.error} role="alert">
      <h1 className={styles.title}>{title}</h1>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}
