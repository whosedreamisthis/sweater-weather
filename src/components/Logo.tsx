/** Brand mark; mirrors public/favicon.svg. Decorative, the adjacent wordmark names the app. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#2f6fed" />
      <circle cx="45" cy="21" r="9" fill="#ffc83d" />
      <g fill="#ffffff">
        <circle cx="22" cy="40" r="10" />
        <circle cx="35" cy="34" r="13" />
        <circle cx="47" cy="42" r="9" />
        <rect x="22" y="40" width="25" height="11" rx="5.5" />
      </g>
    </svg>
  )
}
