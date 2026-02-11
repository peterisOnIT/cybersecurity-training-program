"use client"

import type { Question } from "@/lib/game-store"

interface QuestionCardProps {
  question: Question
  questionIndex: number
  totalQuestions: number
  onAnswer: (answer: "phishing" | "legit") => void
  disabled: boolean
  selectedAnswer: string | null
  wasCorrect: boolean | null
}

export function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  disabled,
  selectedAnswer,
  wasCorrect,
}: QuestionCardProps) {
  return (
    <div className="w-full max-w-2xl">
      {/* Question number */}
      <div className="mb-4 text-center">
        <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-mono text-muted-foreground">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
      </div>

      {/* Email card */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6 glow-box-green">
        <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-sm font-bold text-destructive">
            {question.from.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              From: {question.from}
            </p>
            <p className="text-xs text-muted-foreground">
              to: you@company.com
            </p>
          </div>
        </div>
        <p className="text-base leading-relaxed text-card-foreground font-mono">
          {'"'}
          {question.message}
          {'"'}
        </p>
      </div>

      {/* Answer buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onAnswer("phishing")}
          disabled={disabled}
          className={`relative rounded-xl border-2 px-6 py-5 text-sm font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background ${
            selectedAnswer === "phishing"
              ? wasCorrect
                ? "border-success bg-success/10 text-success glow-box-green"
                : "border-destructive bg-destructive/10 text-destructive glow-box-red"
              : disabled
              ? "border-border bg-secondary/50 text-muted-foreground cursor-not-allowed opacity-50"
              : "border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:border-destructive/60 focus:ring-destructive/50"
          }`}
          aria-label="This is a phishing email"
        >
          <div className="flex flex-col items-center gap-1.5">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>Phishing</span>
          </div>
        </button>

        <button
          onClick={() => onAnswer("legit")}
          disabled={disabled}
          className={`relative rounded-xl border-2 px-6 py-5 text-sm font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background ${
            selectedAnswer === "legit"
              ? wasCorrect
                ? "border-success bg-success/10 text-success glow-box-green"
                : "border-destructive bg-destructive/10 text-destructive glow-box-red"
              : disabled
              ? "border-border bg-secondary/50 text-muted-foreground cursor-not-allowed opacity-50"
              : "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60 focus:ring-primary/50"
          }`}
          aria-label="This is a legitimate email"
        >
          <div className="flex flex-col items-center gap-1.5">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Legit</span>
          </div>
        </button>
      </div>
    </div>
  )
}
