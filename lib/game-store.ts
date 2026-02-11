// Game state types and store for Cyber Clash
// This simulates the Socket.io server-side game state in-memory on the client
// In a production version, this would be managed by a Socket.io server on port 5000

export interface Player {
  id: string
  name: string
  score: number
  answered: boolean
  lastAnswer: string | null
  lastCorrect: boolean | null
}

export interface Question {
  id: number
  from: string
  message: string
  correctAnswer: "phishing" | "legit"
  explanation: string
}

export type GamePhase = "lobby" | "question" | "results" | "final"

export interface GameState {
  players: Player[]
  currentQuestion: Question | null
  questionIndex: number
  phase: GamePhase
  timeRemaining: number
  totalQuestions: number
}

// Hardcoded questions for the "Phish or Legit?" game mode
export const QUESTIONS: Question[] = [
  {
    id: 1,
    from: "Bank Support",
    message:
      "Click immediately to verify your account or it will be locked.",
    correctAnswer: "phishing",
    explanation:
      "Legitimate banks never threaten immediate account lockout or pressure you to click links urgently. This uses fear and urgency -- classic phishing tactics.",
  },
  {
    id: 2,
    from: "IT Department",
    message:
      "Hi team, we are rolling out a scheduled update to our email system this weekend. No action is required on your end. If you have questions, contact the help desk at ext. 4200.",
    correctAnswer: "legit",
    explanation:
      "This message is informational, doesn't ask you to click anything, provides a known internal contact, and doesn't create urgency.",
  },
  {
    id: 3,
    from: "CEO (urgent)",
    message:
      "I need you to purchase 5 gift cards worth $200 each and send me the codes immediately. Don't tell anyone, this is confidential.",
    correctAnswer: "phishing",
    explanation:
      "Gift card scams are among the most common business email compromises. No real CEO would ask you to secretly buy gift cards via email.",
  },
  {
    id: 4,
    from: "Microsoft 365",
    message:
      "Your password will expire in 24 hours. Click here to update: http://m1cr0s0ft-secure.xyz/update",
    correctAnswer: "phishing",
    explanation:
      "The URL uses a misspelled domain with numbers replacing letters (m1cr0s0ft). Legitimate Microsoft emails come from microsoft.com domains.",
  },
  {
    id: 5,
    from: "HR Department",
    message:
      "Reminder: Open enrollment for health benefits ends Friday. Visit the company intranet portal to make your selections.",
    correctAnswer: "legit",
    explanation:
      "This references an internal system (company intranet), has a reasonable timeframe, and doesn't include suspicious links or urgent threats.",
  },
]

export const TIMER_DURATION = 10 // seconds per question
export const POINTS_CORRECT = 100
export const BOT_NAMES = [
  "CryptoKnight",
  "FirewallFox",
  "ByteGuard",
  "NetNinja",
  "ProxyPanda",
  "HexHunter",
  "PacketPilot",
  "ThreatTracer",
]

export function createInitialState(): GameState {
  return {
    players: [],
    currentQuestion: null,
    questionIndex: -1,
    phase: "lobby",
    timeRemaining: TIMER_DURATION,
    totalQuestions: QUESTIONS.length,
  }
}

export function generatePlayerId(): string {
  return "player_" + Math.random().toString(36).substring(2, 9)
}
