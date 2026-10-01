export function Wordmark() {
  return (
    <div className="wordmark rgb-board pointer-events-none -mb-px select-none overflow-hidden" aria-hidden="true">
      <svg viewBox="0 0 1000 104" className="block h-auto w-full">
        <defs>
          <linearGradient id="wordmark-trace" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" className="wordmark__stop-a" />
            <stop offset="50%" className="wordmark__stop-b" />
            <stop offset="100%" className="wordmark__stop-c" />
          </linearGradient>
        </defs>
        <text x="500" y="152" textAnchor="middle" textLength="992" lengthAdjust="spacing" className="wordmark__base">
          AEROBOX
        </text>
        <text x="500" y="152" textAnchor="middle" textLength="992" lengthAdjust="spacing" className="wordmark__trace">
          AEROBOX
        </text>
        <text x="500" y="152" textAnchor="middle" textLength="992" lengthAdjust="spacing" className="wordmark__trace wordmark__trace--2">
          AEROBOX
        </text>
      </svg>
    </div>
  );
}
