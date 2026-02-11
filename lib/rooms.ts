// In-memory room store for the game server
// In production this would be backed by Redis or a database
import {
  type Room,
  type Player,
  type GamePhase,
  PLAYER_COLORS,
  QUESTIONS,
  TIMER_DURATION,
  generateRoomCode,
  generatePlayerId,
} from "./game-store"

const rooms = new Map<string, Room>()

// Cleanup stale rooms (older than 2 hours)
function cleanup() {
  const now = Date.now()
  for (const [code, room] of rooms) {
    if (now - room.lastActivity > 2 * 60 * 60 * 1000) {
      rooms.delete(code)
    }
  }
}

export function createRoom(hostName: string): { room: Room; playerId: string } {
  cleanup()
  let code = generateRoomCode()
  while (rooms.has(code)) {
    code = generateRoomCode()
  }

  const playerId = generatePlayerId()
  const host: Player = {
    id: playerId,
    name: hostName,
    score: 0,
    answered: false,
    lastCorrect: null,
    color: PLAYER_COLORS[0],
    streak: 0,
  }

  const room: Room = {
    code,
    hostId: playerId,
    players: [host],
    phase: "waiting",
    questionIndex: -1,
    timeRemaining: TIMER_DURATION,
    createdAt: Date.now(),
    lastActivity: Date.now(),
  }

  rooms.set(code, room)
  return { room, playerId }
}

export function joinRoom(code: string, playerName: string): { room: Room; playerId: string } | null {
  const room = rooms.get(code.toUpperCase())
  if (!room) return null
  if (room.phase !== "waiting") return null
  if (room.players.length >= 8) return null
  if (room.players.some((p) => p.name.toLowerCase() === playerName.toLowerCase())) return null

  const playerId = generatePlayerId()
  const colorIndex = room.players.length % PLAYER_COLORS.length
  const player: Player = {
    id: playerId,
    name: playerName,
    score: 0,
    answered: false,
    lastCorrect: null,
    color: PLAYER_COLORS[colorIndex],
    streak: 0,
  }

  room.players.push(player)
  room.lastActivity = Date.now()
  return { room, playerId }
}

export function getRoom(code: string): Room | null {
  return rooms.get(code.toUpperCase()) ?? null
}

export function startGame(code: string, hostId: string): Room | null {
  const room = rooms.get(code.toUpperCase())
  if (!room) return null
  if (room.hostId !== hostId) return null
  if (room.players.length < 1) return null

  room.phase = "question"
  room.questionIndex = 0
  room.timeRemaining = TIMER_DURATION
  room.players.forEach((p) => {
    p.answered = false
    p.lastCorrect = null
  })
  room.lastActivity = Date.now()
  return room
}

export function submitAnswer(
  code: string,
  playerId: string,
  answer: "phishing" | "legit"
): Room | null {
  const room = rooms.get(code.toUpperCase())
  if (!room) return null
  if (room.phase !== "question") return null

  const player = room.players.find((p) => p.id === playerId)
  if (!player || player.answered) return null

  const question = QUESTIONS[room.questionIndex]
  if (!question) return null

  const correct = answer === question.correctAnswer
  player.answered = true
  player.lastCorrect = correct

  if (correct) {
    const timeBonus = Math.round((room.timeRemaining / TIMER_DURATION) * 50)
    const streakBonus = Math.min(player.streak, 3) * 25
    player.score += 100 + timeBonus + streakBonus
    player.streak += 1
  } else {
    player.streak = 0
  }

  room.lastActivity = Date.now()

  // Check if all players answered
  const allAnswered = room.players.every((p) => p.answered)
  if (allAnswered) {
    room.phase = "reveal"
  }

  return room
}

export function tickTimer(code: string): Room | null {
  const room = rooms.get(code.toUpperCase())
  if (!room || room.phase !== "question") return null

  room.timeRemaining -= 1
  if (room.timeRemaining <= 0) {
    room.phase = "reveal"
    // Mark unanswered players
    room.players.forEach((p) => {
      if (!p.answered) {
        p.answered = true
        p.lastCorrect = false
        p.streak = 0
      }
    })
  }
  room.lastActivity = Date.now()
  return room
}

export function nextQuestion(code: string, hostId: string): Room | null {
  const room = rooms.get(code.toUpperCase())
  if (!room) return null
  if (room.hostId !== hostId) return null

  const nextIndex = room.questionIndex + 1
  if (nextIndex >= QUESTIONS.length) {
    room.phase = "final"
  } else {
    room.questionIndex = nextIndex
    room.phase = "question"
    room.timeRemaining = TIMER_DURATION
    room.players.forEach((p) => {
      p.answered = false
      p.lastCorrect = null
    })
  }

  room.lastActivity = Date.now()
  return room
}

export function showScores(code: string, hostId: string): Room | null {
  const room = rooms.get(code.toUpperCase())
  if (!room) return null
  if (room.hostId !== hostId) return null
  room.phase = "scores"
  room.lastActivity = Date.now()
  return room
}

export function resetRoom(code: string, hostId: string): Room | null {
  const room = rooms.get(code.toUpperCase())
  if (!room) return null
  if (room.hostId !== hostId) return null

  room.phase = "waiting"
  room.questionIndex = -1
  room.timeRemaining = TIMER_DURATION
  room.players.forEach((p) => {
    p.score = 0
    p.answered = false
    p.lastCorrect = null
    p.streak = 0
  })
  room.lastActivity = Date.now()
  return room
}
