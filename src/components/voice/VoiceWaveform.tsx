'use client'

interface VoiceWaveformProps {
  isActive: boolean
  barCount?: number
}

export function VoiceWaveform({ isActive, barCount = 5 }: VoiceWaveformProps) {
  const heights = [40, 70, 55, 80, 45]
  return (
    <div className="flex items-center justify-center gap-1" aria-hidden>
      {Array.from({ length: barCount }).map((_, i) => (
        <span
          key={i}
          className="w-1 rounded-full transition-all"
          style={{
            backgroundColor: '#2C5530',
            height: isActive ? `${heights[i % heights.length]}%` : '20%',
            minHeight: 4,
            maxHeight: 24,
            animation: isActive ? `waveform-bar ${0.6 + i * 0.1}s ease-in-out infinite alternate` : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes waveform-bar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}
