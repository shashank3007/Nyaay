export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-2">
      {/* Avatar placeholder matching assistant bubble */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1"
        style={{ backgroundColor: '#2C5530' }}
      >
        न्
      </div>
      <div
        className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              backgroundColor: '#9CA3AF',
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.8s',
            }}
          />
        ))}
      </div>
    </div>
  )
}
