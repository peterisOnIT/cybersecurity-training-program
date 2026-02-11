"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  type Player,
  type GamePhase,
  type Question,
  QUESTIONS,
  TIMER_DURATION,
  POINTS_CORRECT,
  BOT_NAMES,
  generatePlayerId,
} from "@/lib/game-store"
import { JoinScreen } from "./join-screen"
import { QuestionCard } from "./question-card"
import { Timer } from "./timer"
import { Leaderboard } from "./leaderboard"
import { ResultsScreen } from "./results-screen"
import { FinalScreen } from "./final-screen"

/**
 * GameController manages the entire game flow.
 *
 * HOW WEBSOCKETS WOULD BE USED (Socket.io architecture):
 *
 * In a full production build with a dedicated server on port 5000:
 * - Server maintains a `players` object in memory
 * - Client emits "joinGame" with player name -> server adds to players, broadcasts "leaderboardUpdate"
 * - Server emits "newQuestion" with question data and starts timer
 * - Client emits "submitAnswer" with answer -> server checks correctness, updates score, broadcasts "leaderboardUpdate"
 * - On disconnect, server removes player from memory, broadcasts updated leaderboard
 * - useEffect hooks on the client listen for: "leaderboardUpdate", "newQuestion", "timerUpdate", "gameOver"
 *
 * This POC simulates that exact flow client-side, with bot players making random decisions
 * to demonstrate the real-time leaderboard updates.
 */
export function GameController() {
  const [phase, setPhase] = useState<GamePhase>("lobby")
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayerId, setCurrentPlayerId] = useState("")
  const [questionIndex, setQuestionIndex] = useState(-1)
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentQuestion: Question | null =
    questionIndex >= 0 && questionIndex < QUESTIONS.length
      ? QUESTIONS[questionIndex]
      : null

  // Simulate bot players joining after the human joins
  const addBotPlayers = useCallback(() => {
    const shuffled = [...BOT_NAMES].sort(() => Math.random() - 0.5)
    const botCount = 2 + Math.floor(Math.random() * 2) // 2-3 bots
    const bots: Player[] = shuffled.slice(0, botCount).map((name) => ({
      id: generatePlayerId(),
      name,
      score: 0,
      answered: false,
      lastAnswer: null,
      lastCorrect: null,
    }))

    setPlayers((prev) => [...prev, ...bots])
  }, [])

  // Handle player joining
  function handleJoin(name: string) {
    const id = generatePlayerId()
    setCurrentPlayerId(id)
    const player: Player = {
      id,
      name,
      score: 0,
      answered: false,
      lastAnswer: null,
      lastCorrect: null,
    }
    setPlayers([player])

    // Simulate other players joining (like Socket.io "joinGame" events)
    setTimeout(addBotPlayers, 800)
  }

  // Start the game
  function handleStartGame() {
    setQuestionIndex(0)
    setPhase("question")
    setTimeRemaining(TIMER_DURATION)
    setSelectedAnswer(null)
    setWasCorrect(null)
    resetPlayerAnswers()
  }

  // Reset answered state for all players
  function resetPlayerAnswers() {
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        answered: false,
        lastAnswer: null,
        lastCorrect: null,
      }))
    )
  }

  // Timer countdown -- simulates the server broadcasting "timerUpdate" events
  useEffect(() => {
    if (phase !== "question") return

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          // Time's up -- if player didn't answer, mark as incorrect
          if (!selectedAnswer) {
            setWasCorrect(null) // null = timed out
          }
          // Simulate bot answers and move to results
          simulateBotAnswers()
          setPhase("results")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, questionIndex])

  // Simulate bot players submitting answers (like Socket.io "submitAnswer" events from other clients)
  function simulateBotAnswers() {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === currentPlayerId || p.answered) return p
        const question = QUESTIONS[questionIndex]
        if (!question) return p

        // Bots have ~60% chance of getting it right
        const botCorrect = Math.random() < 0.6
        const botAnswer = botCorrect
          ? question.correctAnswer
          : question.correctAnswer === "phishing"
          ? "legit"
          : "phishing"

        return {
          ...p,
          answered: true,
          lastAnswer: botAnswer,
          lastCorrect: botCorrect,
          score: botCorrect ? p.score + POINTS_CORRECT : p.score,
        }
      })
    )
  }

  // Handle player answer submission (simulates Socket.io "submitAnswer" event)
  function handleAnswer(answer: "phishing" | "legit") {
    if (selectedAnswer || !currentQuestion || timeRemaining <= 0) return

    const correct = answer === currentQuestion.correctAnswer
    setSelectedAnswer(answer)
    setWasCorrect(correct)

    // Update player score (simulates server processing "submitAnswer" and broadcasting "leaderboardUpdate")
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== currentPlayerId) return p
        return {
          ...p,
          answered: true,
          lastAnswer: answer,
          lastCorrect: correct,
          score: correct ? p.score + POINTS_CORRECT : p.score,
        }
      })
    )

    // Stop timer and go to results after a short delay
    if (timerRef.current) clearInterval(timerRef.current)
    setTimeout(() => {
      simulateBotAnswers()
      setPhase("results")
    }, 1200)
  }

  // Move to next question or final screen
  function handleNext() {
    const nextIndex = questionIndex + 1
    if (nextIndex >= QUESTIONS.length) {
      setPhase("final")
    } else {
      setQuestionIndex(nextIndex)
      setPhase("question")
      setTimeRemaining(TIMER_DURATION)
      setSelectedAnswer(null)
      setWasCorrect(null)
      resetPlayerAnswers()
    }
  }

  // Play again
  function handlePlayAgain() {
    setPhase("lobby")
    setPlayers([])
    setCurrentPlayerId("")
    setQuestionIndex(-1)
    setTimeRemaining(TIMER_DURATION)
    setSelectedAnswer(null)
    setWasCorrect(null)
  }

  // LOBBY PHASE
  if (phase === "lobby") {
    return (
      <JoinScreen
        onJoin={handleJoin}
        players={players}
        onStartGame={handleStartGame}
      />
    )
  }

  // FINAL PHASE
  if (phase === "final") {
    return (
      <FinalScreen
        players={players}
        currentPlayerId={currentPlayerId}
        onPlayAgain={handlePlayAgain}
      />
    )
  }

  // QUESTION + RESULTS PHASES
  return (
    <div className="min-h-screen cyber-grid">
      <div className="fixed inset-0 scanline" aria-hidden="true" />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        {/* Main game area */}
        <main
          id="main-content"
          className="flex flex-1 flex-col items-center justify-center px-4 py-8"
        >
          {/* Header bar */}
          <div className="mb-8 flex w-full max-w-2xl items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono text-primary uppercase tracking-wider">
                Cyber Clash
              </span>
            </div>
            <Timer timeRemaining={timeRemaining} />
            <div className="text-xs font-mono text-muted-foreground">
              Q{questionIndex + 1}/{QUESTIONS.length}
            </div>
          </div>

          {phase === "question" && currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              questionIndex={questionIndex}
              totalQuestions={QUESTIONS.length}
              onAnswer={handleAnswer}
              disabled={!!selectedAnswer || timeRemaining <= 0}
              selectedAnswer={selectedAnswer}
              wasCorrect={wasCorrect}
            />
          )}

          {phase === "results" && currentQuestion && (
            <ResultsScreen
              question={currentQuestion}
              wasCorrect={wasCorrect}
              onNext={handleNext}
              isLastQuestion={questionIndex >= QUESTIONS.length - 1}
            />
          )}
        </main>

        {/* Sidebar leaderboard */}
        <aside className="w-full border-t border-border bg-card/50 p-4 lg:w-72 lg:border-t-0 lg:border-l lg:p-6">
          <Leaderboard
            players={players}
            currentPlayerId={currentPlayerId}
            compact
          />
        </aside>
      </div>
    </div>
  )
}
