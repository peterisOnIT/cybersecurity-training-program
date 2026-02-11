"use client"

import { TIMER_DURATION } from "@/lib/game-store"

interface TimerProps {
  timeRemaining: number
}

export function Timer({ timeRemaining }: TimerProps) {
  const isCritical = timeRemaining <= 3
  const progress = (timeRemaining / TIMER_DURATION) * 100

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`font-mono text-4xl font-bold tabular-nums ${
          isCritical
            ? "text-destructive timer-critical"
            : "text-primary glow-green"
        }`}
        role="timer"
        aria-live="assertive"
        aria-label={`${timeRemaining} seconds remaining`}
      >
        {String(timeRemaining).padStart(2, "0")}
      </div>
      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isCritical ? "bg-destructive" : "bg-primary"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
