import { redis } from "./redis";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BlatherPlayer {
  id: string;
  name: string;
  score: number;
  connected: boolean;
  guesses: string[];
  hasGuessedCorrectly: boolean;
}

export interface SentenceTemplate {
  template: string; // e.g. "It is a type of ___"
  options: string[]; // fill-in choices for the describer
}

export interface BlatherWord {
  word: string;
  category: "attack" | "defense" | "concept" | "tool" | "role";
  difficulty: "easy" | "medium" | "hard";
  sentences: SentenceTemplate[];
  tabooWords: string[]; // words the describer cannot use
}

export interface BlatherRound {
  wordIndex: number;
  describerId: string;
  sentencesSent: { template: string; filled: string }[];
  correctGuessers: string[]; // player IDs who guessed correctly
  startedAt: number;
  timeLimit: number; // seconds
}

export interface BlatherRoom {
  id: string;
  hostId: string;
  status: "waiting" | "countdown" | "describing" | "round_results" | "game_over";
  players: BlatherPlayer[];
  currentRound: number;
  totalRounds: number;
  rounds: BlatherRound[];
  wordBank: BlatherWord[];
  countdownEndsAt: number | null;
  createdAt: number;
}

// ─── Cybersecurity Word Bank ─────────────────────────────────────────────────

const WORD_BANK: BlatherWord[] = [
  {
    word: "Phishing",
    category: "attack",
    difficulty: "easy",
    tabooWords: ["email", "fish", "link", "click", "fake"],
    sentences: [
      { template: "It is a type of ___", options: ["social engineering", "cyberattack", "deception", "online scam"] },
      { template: "It often comes through ___", options: ["electronic messages", "digital communication", "your inbox", "online channels"] },
      { template: "The attacker pretends to be ___", options: ["someone you trust", "a legitimate company", "your bank", "a coworker"] },
      { template: "The goal is to steal your ___", options: ["credentials", "personal information", "identity", "money"] },
      { template: "You can avoid it by ___", options: ["being skeptical", "verifying the sender", "not sharing passwords", "checking URLs carefully"] },
    ],
  },
  {
    word: "Ransomware",
    category: "attack",
    difficulty: "easy",
    tabooWords: ["ransom", "encrypt", "pay", "lock", "money"],
    sentences: [
      { template: "It is a type of ___", options: ["malicious software", "cyberattack", "digital threat", "computer virus"] },
      { template: "It holds your ___ hostage", options: ["files", "data", "system", "documents"] },
      { template: "Attackers demand ___ to restore access", options: ["cryptocurrency", "a large sum", "Bitcoin", "digital payment"] },
      { template: "It often spreads via ___", options: ["suspicious attachments", "compromised websites", "network vulnerabilities", "social engineering"] },
      { template: "The best defense is ___", options: ["regular backups", "updated software", "security awareness", "endpoint protection"] },
    ],
  },
  {
    word: "Firewall",
    category: "defense",
    difficulty: "easy",
    tabooWords: ["wall", "fire", "block", "barrier", "network"],
    sentences: [
      { template: "It acts as a ___ for your system", options: ["security guard", "gatekeeper", "digital bouncer", "traffic controller"] },
      { template: "It monitors ___", options: ["incoming and outgoing traffic", "data packets", "connection requests", "digital communications"] },
      { template: "It can be ___ or software-based", options: ["hardware", "physical", "a dedicated device", "appliance"] },
      { template: "It uses ___ to decide what gets through", options: ["predefined rules", "security policies", "access control lists", "filtering criteria"] },
      { template: "Without it, your system is ___", options: ["exposed to threats", "vulnerable", "wide open", "unprotected"] },
    ],
  },
  {
    word: "Two-Factor Authentication",
    category: "defense",
    difficulty: "medium",
    tabooWords: ["two", "factor", "2FA", "second", "code"],
    sentences: [
      { template: "It adds an extra ___ to logging in", options: ["layer of security", "verification step", "identity check", "proof of identity"] },
      { template: "Beyond a password, you also need ___", options: ["something you have", "a device confirmation", "biometric proof", "a one-time token"] },
      { template: "Common methods include ___", options: ["authenticator apps", "text messages", "biometrics", "hardware keys"] },
      { template: "It protects against ___", options: ["stolen credentials", "unauthorized access", "account takeover", "password breaches"] },
      { template: "Even if your password leaks, attackers still need ___", options: ["physical access to your device", "your fingerprint", "a temporary token", "another piece of proof"] },
    ],
  },
  {
    word: "VPN",
    category: "tool",
    difficulty: "easy",
    tabooWords: ["virtual", "private", "network", "tunnel", "VPN"],
    sentences: [
      { template: "It creates a secure ___ for your internet traffic", options: ["encrypted channel", "hidden pathway", "protected connection", "secret route"] },
      { template: "It hides your ___", options: ["IP address", "online location", "browsing activity", "digital identity"] },
      { template: "It is especially useful on ___", options: ["public Wi-Fi", "untrusted connections", "hotel internet", "coffee shop networks"] },
      { template: "Your data passes through ___", options: ["an encrypted server", "a remote gateway", "a secure middleman", "a protected relay"] },
      { template: "Companies use it to ___", options: ["connect remote workers securely", "protect corporate resources", "extend the office network", "secure employee access"] },
    ],
  },
  {
    word: "Social Engineering",
    category: "attack",
    difficulty: "medium",
    tabooWords: ["social", "engineer", "trick", "manipulate", "human"],
    sentences: [
      { template: "It exploits ___ rather than technology", options: ["psychology", "trust", "people's behavior", "emotions"] },
      { template: "The attacker uses ___ to gain access", options: ["deception", "persuasion", "impersonation", "pretexting"] },
      { template: "Common tactics include ___", options: ["creating urgency", "building rapport", "exploiting authority", "appealing to fear"] },
      { template: "No amount of ___ can fully prevent it", options: ["technical security", "software patches", "antivirus tools", "encryption"] },
      { template: "The best defense is ___", options: ["security awareness training", "a skeptical mindset", "verifying identities", "following procedures"] },
    ],
  },
  {
    word: "Zero-Day Exploit",
    category: "attack",
    difficulty: "hard",
    tabooWords: ["zero", "day", "exploit", "unknown", "patch"],
    sentences: [
      { template: "It targets a vulnerability that is ___", options: ["not yet discovered by the vendor", "completely new", "unpatched", "fresh in the wild"] },
      { template: "The name refers to ___", options: ["the time the vendor has had to fix it", "how recently it was found", "the absence of a remedy", "the countdown to a fix"] },
      { template: "These are extremely ___ on the black market", options: ["valuable", "sought after", "expensive", "prized"] },
      { template: "Defense is difficult because ___", options: ["there is no fix available yet", "signatures don't exist", "security tools can't detect it", "it's brand new"] },
      { template: "Government agencies sometimes ___", options: ["stockpile them", "use them for intelligence", "keep them secret", "trade them"] },
    ],
  },
  {
    word: "Penetration Testing",
    category: "concept",
    difficulty: "medium",
    tabooWords: ["penetration", "pen", "test", "hack", "break"],
    sentences: [
      { template: "It is an authorized simulation of ___", options: ["a cyberattack", "a security breach", "an intrusion attempt", "offensive operations"] },
      { template: "Professionals are hired to ___", options: ["find vulnerabilities before criminals do", "probe system defenses", "identify weaknesses", "assess security posture"] },
      { template: "The final deliverable is ___", options: ["a detailed report of findings", "a list of vulnerabilities", "remediation recommendations", "a risk assessment"] },
      { template: "It can target ___", options: ["web applications", "internal networks", "physical security", "employee awareness"] },
      { template: "Think of it as a ___ for security", options: ["stress test", "health checkup", "fire drill", "audit"] },
    ],
  },
  {
    word: "DDoS Attack",
    category: "attack",
    difficulty: "medium",
    tabooWords: ["distributed", "denial", "service", "flood", "crash"],
    sentences: [
      { template: "The goal is to make a ___ unavailable", options: ["website", "online service", "server", "digital resource"] },
      { template: "It works by overwhelming the target with ___", options: ["massive traffic", "millions of requests", "fake connections", "a deluge of data"] },
      { template: "The attack comes from ___", options: ["many compromised machines", "a botnet", "thousands of sources", "hijacked devices worldwide"] },
      { template: "Legitimate users experience ___", options: ["inability to connect", "extreme slowness", "timeouts", "complete outage"] },
      { template: "Companies defend against it with ___", options: ["traffic filtering", "content delivery networks", "rate limiting", "specialized mitigation services"] },
    ],
  },
  {
    word: "Encryption",
    category: "defense",
    difficulty: "easy",
    tabooWords: ["encrypt", "decrypt", "code", "cipher", "scramble"],
    sentences: [
      { template: "It transforms readable data into ___", options: ["unreadable gibberish", "a secret format", "protected information", "an unintelligible form"] },
      { template: "Only someone with the right ___ can reverse it", options: ["key", "credentials", "authorization", "secret"] },
      { template: "It protects data ___", options: ["in transit and at rest", "while being sent", "stored on devices", "everywhere it exists"] },
      { template: "HTTPS websites use it to ___", options: ["secure your browsing", "protect transactions", "guard your data", "keep communications private"] },
      { template: "Without it, anyone on the network could ___", options: ["read your messages", "intercept your data", "steal information", "spy on communications"] },
    ],
  },
  {
    word: "SQL Injection",
    category: "attack",
    difficulty: "hard",
    tabooWords: ["SQL", "injection", "inject", "database", "query"],
    sentences: [
      { template: "The attacker inserts malicious ___ into input fields", options: ["commands", "instructions", "code snippets", "special characters"] },
      { template: "It targets applications that ___", options: ["don't validate user input", "store data in tables", "use structured data storage", "have web forms"] },
      { template: "A successful attack can ___", options: ["dump all stored records", "bypass login pages", "modify or delete data", "take over the backend"] },
      { template: "The root cause is ___", options: ["unsanitized input", "poor coding practices", "mixing data with commands", "lack of parameterization"] },
      { template: "It has been in the OWASP Top 10 for ___", options: ["over a decade", "as long as anyone can remember", "many years", "most of its existence"] },
    ],
  },
  {
    word: "Incident Response",
    category: "concept",
    difficulty: "medium",
    tabooWords: ["incident", "response", "respond", "breach", "react"],
    sentences: [
      { template: "It is a structured approach to ___", options: ["handling security events", "managing a crisis", "dealing with compromises", "recovering from attacks"] },
      { template: "The first step is usually ___", options: ["detection and identification", "recognizing something is wrong", "alerting the team", "confirming the threat"] },
      { template: "A key phase involves ___", options: ["containing the damage", "isolating affected systems", "stopping the spread", "limiting the impact"] },
      { template: "After resolution, teams perform ___", options: ["a lessons-learned review", "a post-mortem analysis", "root cause analysis", "documentation of findings"] },
      { template: "Having a plan in advance ___", options: ["drastically reduces damage", "saves critical time", "prevents panic", "ensures a coordinated effort"] },
    ],
  },
  {
    word: "Malware",
    category: "attack",
    difficulty: "easy",
    tabooWords: ["malware", "malicious", "virus", "worm", "trojan"],
    sentences: [
      { template: "It is software designed to ___", options: ["cause harm", "damage systems", "steal data", "disrupt operations"] },
      { template: "It can spread through ___", options: ["downloads", "email attachments", "infected websites", "USB drives"] },
      { template: "Types include ___ and more", options: ["spyware, adware, ransomware", "keyloggers and rootkits", "bots and backdoors", "many harmful varieties"] },
      { template: "Protection requires ___", options: ["security software", "regular updates", "safe browsing habits", "endpoint detection tools"] },
      { template: "It is the general term for ___", options: ["any harmful program", "bad software of all kinds", "unwanted digital threats", "hostile computer programs"] },
    ],
  },
  {
    word: "Man-in-the-Middle Attack",
    category: "attack",
    difficulty: "hard",
    tabooWords: ["man", "middle", "intercept", "between", "eavesdrop"],
    sentences: [
      { template: "The attacker secretly positions themselves ___", options: ["in the communication path", "where data flows", "along the connection", "within the data stream"] },
      { template: "Both parties believe they are ___", options: ["talking directly to each other", "on a secure connection", "communicating privately", "alone in the conversation"] },
      { template: "The attacker can ___ the data", options: ["read and modify", "capture and alter", "observe and change", "monitor and tamper with"] },
      { template: "It commonly occurs on ___", options: ["unsecured Wi-Fi", "public hotspots", "unprotected connections", "open access points"] },
      { template: "HTTPS and certificate pinning help prevent ___", options: ["this type of surveillance", "unauthorized interception", "communication tampering", "traffic manipulation"] },
    ],
  },
  {
    word: "Brute Force Attack",
    category: "attack",
    difficulty: "easy",
    tabooWords: ["brute", "force", "guess", "try", "password"],
    sentences: [
      { template: "It involves systematically ___", options: ["testing every combination", "checking all possibilities", "iterating through options", "exhausting all choices"] },
      { template: "Speed depends on ___", options: ["computing power", "the attacker's hardware", "processing capability", "available resources"] },
      { template: "Longer and more complex credentials ___", options: ["exponentially increase the time needed", "make this approach impractical", "are the best defense", "defeat this method"] },
      { template: "Account lockouts help because ___", options: ["they limit attempts", "they slow attackers down", "they block repeated failures", "they interrupt automation"] },
      { template: "Think of it like trying every ___ on a lock", options: ["combination", "possible number", "permutation", "sequence"] },
    ],
  },
  {
    word: "CISO",
    category: "role",
    difficulty: "hard",
    tabooWords: ["chief", "information", "security", "officer", "executive"],
    sentences: [
      { template: "This person is responsible for ___", options: ["an organization's entire protection strategy", "keeping the company safe digitally", "overseeing all cyber defenses", "the security program"] },
      { template: "They report to ___", options: ["the CEO or board", "top leadership", "the highest levels of management", "senior executives"] },
      { template: "They manage ___ and teams", options: ["budgets, policies", "risk assessments", "security operations", "compliance programs"] },
      { template: "After a breach, they are often ___", options: ["the first to be questioned", "held accountable", "in the spotlight", "leading the response"] },
      { template: "It is one of the most ___ roles in cybersecurity", options: ["senior", "high-pressure", "strategic", "leadership-focused"] },
    ],
  },
  {
    word: "Botnet",
    category: "attack",
    difficulty: "medium",
    tabooWords: ["bot", "net", "network", "zombie", "army"],
    sentences: [
      { template: "It is a collection of ___", options: ["compromised devices", "hijacked computers", "infected machines", "enslaved endpoints"] },
      { template: "The devices are controlled by ___", options: ["a remote attacker", "a command center", "a hidden operator", "someone far away"] },
      { template: "Owners of infected devices usually ___", options: ["have no idea", "are completely unaware", "don't notice anything", "see no symptoms"] },
      { template: "They are commonly used for ___", options: ["launching massive attacks", "sending spam", "mining cryptocurrency", "credential stuffing"] },
      { template: "Your smart home devices could be ___", options: ["part of one right now", "recruited without your knowledge", "silently participating", "secretly contributing"] },
    ],
  },
  {
    word: "Patch Management",
    category: "concept",
    difficulty: "medium",
    tabooWords: ["patch", "update", "fix", "vulnerability", "software"],
    sentences: [
      { template: "It is the process of ___", options: ["keeping systems current", "applying corrections to programs", "maintaining digital defenses", "remediating known weaknesses"] },
      { template: "Vendors regularly release ___", options: ["security improvements", "corrections for flaws", "defensive modifications", "protective changes"] },
      { template: "Delaying this process ___", options: ["leaves systems exposed", "creates a window for attackers", "increases risk significantly", "is one of the biggest mistakes"] },
      { template: "Many major breaches happened because ___", options: ["organizations were months behind", "known flaws went unaddressed", "available remedies were ignored", "teams procrastinated"] },
      { template: "Automation tools help by ___", options: ["deploying changes at scale", "reducing human error", "ensuring timely application", "tracking compliance"] },
    ],
  },
];

// ─── Room Management ────────────────────────────────────────────────────────

const ROOM_TTL = 7200; // 2 hours
const MAX_PLAYERS = 12;

function generateRoomId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generatePlayerId(): string {
  return `bp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function redisKey(roomId: string): string {
  return `blather:${roomId}`;
}

function selectWords(playerCount: number): BlatherWord[] {
  // Select enough words for all rounds (each player describes once per cycle)
  // We'll do playerCount rounds (each player describes once)
  const totalNeeded = Math.min(playerCount, WORD_BANK.length);
  const shuffled = [...WORD_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.max(totalNeeded, 6));
}

export async function getRoom(roomId: string): Promise<BlatherRoom | null> {
  const data = await redis.get<BlatherRoom>(redisKey(roomId));
  return data;
}

export async function createRoom(hostName: string): Promise<{ room: BlatherRoom; playerId: string }> {
  const roomId = generateRoomId();
  const playerId = generatePlayerId();

  const room: BlatherRoom = {
    id: roomId,
    hostId: playerId,
    status: "waiting",
    players: [
      {
        id: playerId,
        name: hostName,
        score: 0,
        connected: true,
        guesses: [],
        hasGuessedCorrectly: false,
      },
    ],
    currentRound: 0,
    totalRounds: 0,
    rounds: [],
    wordBank: [],
    countdownEndsAt: null,
    createdAt: Date.now(),
  };

  await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
  return { room, playerId };
}

export async function joinRoom(roomId: string, playerName: string): Promise<{ room: BlatherRoom; playerId: string } | null> {
  const room = await getRoom(roomId);
  if (!room) return null;
  if (room.status !== "waiting") return null;
  if (room.players.length >= MAX_PLAYERS) return null;
  if (room.players.some((p) => p.name.toLowerCase() === playerName.toLowerCase())) return null;

  const playerId = generatePlayerId();
  room.players.push({
    id: playerId,
    name: playerName,
    score: 0,
    connected: true,
    guesses: [],
    hasGuessedCorrectly: false,
  });

  await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
  return { room, playerId };
}

export async function heartbeat(roomId: string, playerId: string): Promise<BlatherRoom | null> {
  const room = await getRoom(roomId);
  if (!room) return null;

  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    // Player not in the room -- don't fail, just return null so the
    // poll route can fall back to a read-only getRoom.
    return null;
  }

  player.connected = true;
  await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
  return room;
}

export async function startCountdown(roomId: string, playerId: string): Promise<BlatherRoom | null> {
  const room = await getRoom(roomId);
  if (!room || room.hostId !== playerId || room.status !== "waiting") return null;
  if (room.players.length < 2) return null;

  room.status = "countdown";
  room.countdownEndsAt = Date.now() + 5000;

  await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
  return room;
}

export async function startGame(roomId: string): Promise<BlatherRoom | null> {
  const room = await getRoom(roomId);
  if (!room) return null;

  const wordBank = selectWords(room.players.length);
  room.wordBank = wordBank;
  room.totalRounds = wordBank.length;
  room.currentRound = 0;
  room.status = "describing";

  // Set up the first round - first player describes first word
  room.rounds = [
    {
      wordIndex: 0,
      describerId: room.players[0].id,
      sentencesSent: [],
      correctGuessers: [],
      startedAt: Date.now(),
      timeLimit: 90, // 90 seconds per round
    },
  ];

  // Reset player guesses
  for (const p of room.players) {
    p.guesses = [];
    p.hasGuessedCorrectly = false;
  }

  await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
  return room;
}

export async function sendSentence(
  roomId: string,
  playerId: string,
  template: string,
  filled: string
): Promise<BlatherRoom | null> {
  const room = await getRoom(roomId);
  if (!room || room.status !== "describing") return null;

  const round = room.rounds[room.currentRound];
  if (!round || round.describerId !== playerId) return null;

  round.sentencesSent.push({ template, filled });

  await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
  return room;
}

export async function submitGuess(
  roomId: string,
  playerId: string,
  guess: string
): Promise<BlatherRoom | null> {
  const room = await getRoom(roomId);
  if (!room || room.status !== "describing") return null;

  const round = room.rounds[room.currentRound];
  if (!round) return null;

  // Describer can't guess
  if (round.describerId === playerId) return null;

  const player = room.players.find((p) => p.id === playerId);
  if (!player || player.hasGuessedCorrectly) return null;

  // Check if guess is correct
  const word = room.wordBank[round.wordIndex];
  const normalizedGuess = guess.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "");
  const normalizedWord = word.word.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "");

  // Store the guess
  player.guesses.push(guess);

  // Check multiple matching strategies for flexibility
  const isCorrect =
    normalizedGuess === normalizedWord ||
    normalizedGuess.includes(normalizedWord) ||
    normalizedWord.includes(normalizedGuess) ||
    // Handle cases like "2fa" matching "twofactor authentication"
    (normalizedGuess.length >= 3 && normalizedWord.split(" ").some(w => w === normalizedGuess)) ||
    (normalizedGuess.length >= 3 && normalizedGuess.split(" ").some(w => normalizedWord.split(" ").some(nw => nw === w && w.length >= 4)));

  if (isCorrect) {
    player.hasGuessedCorrectly = true;
    round.correctGuessers.push(playerId);

    // Score: earlier guessers get more points
    const guessOrder = round.correctGuessers.length;
    const timeElapsed = (Date.now() - round.startedAt) / 1000;
    const timeBonus = Math.max(0, Math.round((round.timeLimit - timeElapsed) / round.timeLimit * 50));
    const orderBonus = Math.max(10, 100 - (guessOrder - 1) * 20);
    player.score += orderBonus + timeBonus;

    // Describer also gets points for each correct guesser
    const describer = room.players.find((p) => p.id === round.describerId);
    if (describer) {
      describer.score += 25;
    }

    // Check if all non-describer players have guessed correctly
    const nonDescribers = room.players.filter((p) => p.id !== round.describerId);
    const allGuessed = nonDescribers.every((p) => p.hasGuessedCorrectly);

    if (allGuessed) {
      room.status = "round_results";
    }
  }

  await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
  return room;
}

export async function endRound(roomId: string, playerId: string): Promise<BlatherRoom | null> {
  const room = await getRoom(roomId);
  if (!room) return null;
  if (room.hostId !== playerId && room.rounds[room.currentRound]?.describerId !== playerId) return null;

  room.status = "round_results";

  await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
  return room;
}

export async function nextRound(roomId: string, playerId: string): Promise<BlatherRoom | null> {
  const room = await getRoom(roomId);
  if (!room || room.hostId !== playerId) return null;

  const nextIdx = room.currentRound + 1;

  if (nextIdx >= room.totalRounds) {
    room.status = "game_over";
    await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
    return room;
  }

  room.currentRound = nextIdx;
  room.status = "describing";

  // Next describer rotates through players
  const describerIdx = nextIdx % room.players.length;

  room.rounds.push({
    wordIndex: nextIdx,
    describerId: room.players[describerIdx].id,
    sentencesSent: [],
    correctGuessers: [],
    startedAt: Date.now(),
    timeLimit: 90,
  });

  // Reset player guess state for new round
  for (const p of room.players) {
    p.guesses = [];
    p.hasGuessedCorrectly = false;
  }

  await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
  return room;
}

export async function resetRoom(roomId: string, playerId: string): Promise<BlatherRoom | null> {
  const room = await getRoom(roomId);
  if (!room || room.hostId !== playerId) return null;

  room.status = "waiting";
  room.currentRound = 0;
  room.totalRounds = 0;
  room.rounds = [];
  room.wordBank = [];
  room.countdownEndsAt = null;

  for (const p of room.players) {
    p.score = 0;
    p.guesses = [];
    p.hasGuessedCorrectly = false;
  }

  await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
  return room;
}

export async function leaveRoom(roomId: string, playerId: string): Promise<BlatherRoom | null> {
  const room = await getRoom(roomId);
  if (!room) return null;

  room.players = room.players.filter((p) => p.id !== playerId);

  if (room.players.length === 0) {
    await redis.del(redisKey(roomId));
    return null;
  }

  // Transfer host if needed
  if (room.hostId === playerId) {
    room.hostId = room.players[0].id;
  }

  await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
  return room;
}
