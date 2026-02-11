"use client"

import type { Question } from "@/lib/game-store"

interface ResultsScreenProps {
  question: Question
  wasCorrect: boolean | null
  onNext: () => void
  isLastQuestion: boolean
}

export function ResultsScreen({
  question,
  wasCorrect,
  onNext,
  isLastQuestion,
}: ResultsScreenProps) {
  return (
    <div className="w-full max-w-lg text-center">
      <div className="mb-6">
        {wasCorrect ? (
          <>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 glow-box-green">
              <svg
                className="h-10 w-10 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-success glow-green">
              Correct! +100 pts
            </h2>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 glow-box-red">
              <svg
                className="h-10 w-10 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-destructive">
              {wasCorrect === null ? "Time's Up!" : "Wrong Answer"}
            </h2>
          </>
        )}
      </div>

      {/* Correct answer */}
      <div className="mb-4 rounded-xl border border-border bg-card p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Correct Answer
        </p>
        <p className="text-lg font-bold text-foreground capitalize font-mono">
          {question.correctAnswer}
        </p>
      </div>

      {/* Explanation */}
      <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
          Why?
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {question.explanation}
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
      >
        {isLastQuestion ? "See Final Scores" : "Next Question"}
      </button>
    </div>
  )
}
