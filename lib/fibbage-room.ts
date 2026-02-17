import { redis } from "./redis";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FibbagePlayer {
  id: string;
  name: string;
  score: number;
  connected: boolean;
  /** The lie this player submitted for the current round (null if not yet submitted) */
  lie: string | null;
  /** The answer ID this player voted for (null if not yet voted) */
  votedFor: string | null;
  /** How many times other players picked this player's lie across all rounds */
  totalFools: number;
}

export interface FibbageQuestion {
  prompt: string; // e.g. "The first known computer virus was called ___"
  truth: string; // e.g. "Creeper"
  category: "history" | "attacks" | "defense" | "concepts" | "people" | "acronyms";
  funFact?: string; // optional educational context shown after reveal
}

export interface AnswerOption {
  id: string;
  text: string;
  authorId: string | null; // null = it's the truth
}

export interface FibbageRound {
  questionIndex: number;
  answers: AnswerOption[]; // shuffled lies + truth, populated after writing phase
  votes: Record<string, string>; // playerId -> answerId they voted for
  revealed: boolean;
}

export interface FibbageRoom {
  id: string;
  hostId: string;
  status:
    | "waiting"
    | "countdown"
    | "writing"    // players submit lies
    | "voting"     // players pick the real answer
    | "reveal"     // show who picked what
    | "scores"     // show round scoreboard
    | "game_over";
  players: FibbagePlayer[];
  currentRound: number;
  totalRounds: number;
  rounds: FibbageRound[];
  questions: FibbageQuestion[];
  phaseEndsAt: number | null; // timestamp when current phase auto-advances
  createdAt: number;
}

// ─── Cybersecurity Question Bank ─────────────────────────────────────────────

const QUESTION_BANK: FibbageQuestion[] = [
  {
    prompt: "The first known computer worm to spread across the internet in 1988 was called the ___ Worm.",
    truth: "Morris",
    category: "history",
    funFact: "The Morris Worm was created by Robert Tappan Morris, a Cornell grad student. It infected ~6,000 machines -- about 10% of the internet at the time.",
  },
  {
    prompt: "The cybersecurity practice of sending fake phishing emails to your own employees to test their awareness is called ___.",
    truth: "Phishing simulation",
    category: "defense",
    funFact: "Companies regularly run phishing simulations to measure how many employees click suspicious links. Average click rates drop from 30% to under 5% after training.",
  },
  {
    prompt: "The term for a hacker who breaks into systems for ethical purposes, often hired by companies, is a ___ hat hacker.",
    truth: "White",
    category: "concepts",
    funFact: "White hat hackers (also called ethical hackers) are paid to find vulnerabilities before malicious attackers do. Bug bounty programs reward them for their findings.",
  },
  {
    prompt: "The largest data breach in history (as of 2024) exposed 3 billion accounts and belonged to ___.",
    truth: "Yahoo",
    category: "history",
    funFact: "Yahoo disclosed in 2016 that all 3 billion of its user accounts were compromised in a 2013 breach. It remains the largest data breach by number of affected accounts.",
  },
  {
    prompt: "In cybersecurity, a ___ is a decoy system designed to lure attackers and study their behavior.",
    truth: "Honeypot",
    category: "defense",
    funFact: "Honeypots can be low-interaction (simulated services) or high-interaction (real systems). They help security teams learn new attack techniques without risking real assets.",
  },
  {
    prompt: "The vulnerability rating system that scores severity from 0 to 10 is called the Common Vulnerability ___ System (CVSS).",
    truth: "Scoring",
    category: "concepts",
    funFact: "CVSS scores of 9.0-10.0 are rated Critical. The Log4Shell vulnerability (CVE-2021-44228) received a perfect 10.0 score due to its ease of exploitation.",
  },
  {
    prompt: "The famous hacker who was once the FBI's most wanted cybercriminal and later became a security consultant is ___.",
    truth: "Kevin Mitnick",
    category: "people",
    funFact: "Kevin Mitnick was arrested in 1995 after a 2.5-year manhunt. After serving 5 years in prison, he became a respected security consultant and author.",
  },
  {
    prompt: "The ransomware attack that shut down the Colonial Pipeline in 2021 was carried out by the group called ___.",
    truth: "DarkSide",
    category: "attacks",
    funFact: "The Colonial Pipeline attack caused fuel shortages across the US East Coast. The company paid a $4.4 million ransom in Bitcoin, though the FBI later recovered most of it.",
  },
  {
    prompt: "SSL stands for Secure ___ Layer.",
    truth: "Sockets",
    category: "acronyms",
    funFact: "SSL has been succeeded by TLS (Transport Layer Security), but people still commonly refer to HTTPS certificates as SSL certificates.",
  },
  {
    prompt: "The attack where a hacker redirects a website's traffic to a fake site by corrupting the DNS cache is called DNS ___.",
    truth: "Poisoning",
    category: "attacks",
    funFact: "DNS poisoning (also called DNS spoofing) can redirect thousands of users to phishing sites. DNSSEC was created to prevent this by cryptographically signing DNS records.",
  },
  {
    prompt: "The cybersecurity framework published by NIST that is widely used by US organizations is called the ___ Framework.",
    truth: "Cybersecurity",
    category: "defense",
    funFact: "The NIST Cybersecurity Framework organizes security into 5 functions: Identify, Protect, Detect, Respond, and Recover. It's voluntary but widely adopted.",
  },
  {
    prompt: "A ___ table is a precomputed lookup table used by hackers to crack password hashes.",
    truth: "Rainbow",
    category: "attacks",
    funFact: "Rainbow tables trade computation time for storage space. Modern defenses use salted hashes, which make rainbow tables useless since each password gets a unique salt.",
  },
  {
    prompt: "The principle of giving users only the minimum access they need to do their job is called the Principle of ___.",
    truth: "Least Privilege",
    category: "concepts",
    funFact: "This principle is a cornerstone of Zero Trust architecture. If a compromised account only has minimal access, the damage from a breach is significantly limited.",
  },
  {
    prompt: "The malware that infected Iran's nuclear centrifuges in 2010, believed to be created by the US and Israel, was called ___.",
    truth: "Stuxnet",
    category: "history",
    funFact: "Stuxnet was the first known cyberweapon designed to cause physical damage. It destroyed roughly 1,000 of Iran's 6,000 uranium enrichment centrifuges.",
  },
  {
    prompt: "OWASP stands for Open ___ Application Security Project.",
    truth: "Worldwide",
    category: "acronyms",
    funFact: "OWASP's Top 10 list of web application security risks is updated every few years and is considered essential reading for web developers.",
  },
  {
    prompt: "The technique of hiding secret messages inside images, audio, or other files is called ___.",
    truth: "Steganography",
    category: "concepts",
    funFact: "Unlike encryption which makes data unreadable, steganography hides the fact that a secret message exists at all. It has been used since ancient Greece.",
  },
  {
    prompt: "The 2017 global ransomware attack that exploited a Windows vulnerability called EternalBlue was named ___.",
    truth: "WannaCry",
    category: "attacks",
    funFact: "WannaCry infected over 230,000 computers in 150 countries in a single day. It was stopped when a researcher found and activated its kill switch domain.",
  },
  {
    prompt: "In penetration testing, the phase where you gather publicly available information about a target is called ___.",
    truth: "Reconnaissance",
    category: "concepts",
    funFact: "Recon can be passive (searching public records, social media) or active (port scanning, probing). Good recon is often the difference between a successful and failed pentest.",
  },
  {
    prompt: "A ___ attack tricks a logged-in user's browser into making unwanted requests to a website they're authenticated on.",
    truth: "Cross-Site Request Forgery",
    category: "attacks",
    funFact: "CSRF attacks exploit the trust a website has in a user's browser. Anti-CSRF tokens and SameSite cookies are the main defenses against this attack.",
  },
  {
    prompt: "The US military's offensive and defensive cyber operations are led by ___.",
    truth: "US Cyber Command",
    category: "people",
    funFact: "US Cyber Command (USCYBERCOM) was established in 2009 and elevated to a unified combatant command in 2018. Its headquarters are at Fort Meade, Maryland alongside the NSA.",
  },
  {
    prompt: "The security model that assumes no user or device should be trusted by default, even inside the network, is called ___.",
    truth: "Zero Trust",
    category: "concepts",
    funFact: "Zero Trust was coined by Forrester Research in 2010. Its motto is 'never trust, always verify.' Google's BeyondCorp is one of the most famous Zero Trust implementations.",
  },
  {
    prompt: "The notorious dark web marketplace shut down by the FBI in 2013 was called ___.",
    truth: "Silk Road",
    category: "history",
    funFact: "Silk Road's founder, Ross Ulbricht (aka Dread Pirate Roberts), was arrested in a San Francisco library. The site had processed over $1.2 billion in Bitcoin transactions.",
  },
  {
    prompt: "A ___ is a type of malware that records every keystroke a victim types.",
    truth: "Keylogger",
    category: "attacks",
    funFact: "Keyloggers can be software-based or physical hardware devices plugged between a keyboard and computer. They're commonly used to steal passwords and credit card numbers.",
  },
  {
    prompt: "The process of converting plaintext passwords into fixed-length strings using a one-way function is called ___.",
    truth: "Hashing",
    category: "concepts",
    funFact: "Unlike encryption, hashing is one-way -- you can't reverse a hash back to the original password. Common algorithms include bcrypt, SHA-256, and Argon2.",
  },
];

// ─── Room Management ────────────────────────────────────────────────────────

const ROOM_TTL = 7200; // 2 hours
const MAX_PLAYERS = 8;
const WRITING_TIME = 60; // seconds to write lies
const VOTING_TIME = 30; // seconds to vote
const REVEAL_TIME = 12; // seconds to show reveal
const SCORES_TIME = 10; // seconds to show scores

function generateRoomId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generatePlayerId(): string {
  return `fp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function redisKey(roomId: string): string {
  return `fibbage:${roomId}`;
}

function selectQuestions(count: number): FibbageQuestion[] {
  const shuffled = [...QUESTION_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateAnswerId(): string {
  return `ans_${Math.random().toString(36).slice(2, 8)}`;
}

export async function getRoom(roomId: string): Promise<FibbageRoom | null> {
  const data = await redis.get<FibbageRoom>(redisKey(roomId));
  return data;
}

export async function createRoom(hostName: string): Promise<{ room: FibbageRoom; playerId: string }> {
  const roomId = generateRoomId();
  const playerId = generatePlayerId();

  const room: FibbageRoom = {
    id: roomId,
    hostId: playerId,
    status: "waiting",
    players: [
      {
        id: playerId,
        name: hostName,
        score: 0,
        connected: true,
        lie: null,
        votedFor: null,
        totalFools: 0,
      },
    ],
    currentRound: 0,
    totalRounds: 5,
    rounds: [],
    questions: [],
    phaseEndsAt: null,
    createdAt: Date.now(),
  };

  await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
  return { room, playerId };
}

export async function joinRoom(
  roomId: string,
  playerName: string
): Promise<{ room: FibbageRoom; playerId: string } | null> {
  const room = await getRoom(roomId.toUpperCase());
  if (!room) return null;
  if (room.status !== "waiting") return null;
  if (room.players.length >= MAX_PLAYERS) return null;

  // Prevent duplicate names
  const nameExists = room.players.some(
    (p) => p.name.toLowerCase() === playerName.toLowerCase()
  );
  if (nameExists) return null;

  const playerId = generatePlayerId();
  room.players.push({
    id: playerId,
    name: playerName,
    score: 0,
    connected: true,
    lie: null,
    votedFor: null,
    totalFools: 0,
  });

  await redis.set(redisKey(room.id), room, { ex: ROOM_TTL });
  return { room, playerId };
}

export async function heartbeat(roomId: string, playerId: string): Promise<FibbageRoom | null> {
  const room = await getRoom(roomId);
  if (!room) return null;

  const player = room.players.find((p) => p.id === playerId);
  if (!player) return null;

  player.connected = true;
  await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
  return room;
}

export async function startGame(roomId: string, playerId: string): Promise<FibbageRoom | null> {
  const room = await getRoom(roomId);
  if (!room) return null;
  if (room.hostId !== playerId) return null;
  if (room.players.length < 2) return null;
  if (room.status !== "waiting") return null;

  // Select questions
  room.totalRounds = Math.min(5, QUESTION_BANK.length);
  room.questions = selectQuestions(room.totalRounds);

  // Start countdown
  room.status = "countdown";
  room.phaseEndsAt = Date.now() + 4000;

  await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });

  // After countdown, transition to writing
  setTimeout(async () => {
    const r = await getRoom(roomId);
    if (r && r.status === "countdown") {
      r.status = "writing";
      r.currentRound = 0;
      r.phaseEndsAt = Date.now() + WRITING_TIME * 1000;
      r.rounds = [
        {
          questionIndex: 0,
          answers: [],
          votes: {},
          revealed: false,
        },
      ];
      // Reset player lies
      r.players.forEach((p) => {
        p.lie = null;
        p.votedFor = null;
      });
      await redis.set(redisKey(roomId), r, { ex: ROOM_TTL });
    }
  }, 4000);

  return room;
}

export async function submitLie(
  roomId: string,
  playerId: string,
  lie: string
): Promise<FibbageRoom | null> {
  const room = await getRoom(roomId);
  if (!room) return null;
  if (room.status !== "writing") return null;

  const player = room.players.find((p) => p.id === playerId);
  if (!player) return null;

  // Don't allow submitting the truth (case-insensitive)
  const currentQuestion = room.questions[room.currentRound];
  if (lie.toLowerCase().trim() === currentQuestion.truth.toLowerCase().trim()) {
    return room; // silently reject
  }

  player.lie = lie.trim();

  // Check if all players have submitted
  const allSubmitted = room.players.every((p) => p.lie !== null);
  if (allSubmitted) {
    transitionToVoting(room);
  }

  await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
  return room;
}

function transitionToVoting(room: FibbageRoom) {
  const round = room.rounds[room.currentRound];
  const question = room.questions[room.currentRound];

  // Build answer options: player lies + the truth
  const answers: AnswerOption[] = [];

  // Add player lies
  room.players.forEach((p) => {
    if (p.lie) {
      answers.push({
        id: generateAnswerId(),
        text: p.lie,
        authorId: p.id,
      });
    }
  });

  // Add the truth
  answers.push({
    id: generateAnswerId(),
    text: question.truth,
    authorId: null, // marks this as the truth
  });

  // Shuffle
  round.answers = answers.sort(() => Math.random() - 0.5);

  room.status = "voting";
  room.phaseEndsAt = Date.now() + VOTING_TIME * 1000;

  // Reset votes
  room.players.forEach((p) => {
    p.votedFor = null;
  });
}

export async function submitVote(
  roomId: string,
  playerId: string,
  answerId: string
): Promise<FibbageRoom | null> {
  const room = await getRoom(roomId);
  if (!room) return null;
  if (room.status !== "voting") return null;

  const player = room.players.find((p) => p.id === playerId);
  if (!player) return null;

  const round = room.rounds[room.currentRound];
  const answer = round.answers.find((a) => a.id === answerId);
  if (!answer) return null;

  // Can't vote for your own lie
  if (answer.authorId === playerId) return room;

  player.votedFor = answerId;
  round.votes[playerId] = answerId;

  // Check if all players have voted
  const allVoted = room.players.every((p) => p.votedFor !== null);
  if (allVoted) {
    transitionToReveal(room);
  }

  await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
  return room;
}

function transitionToReveal(room: FibbageRoom) {
  const round = room.rounds[room.currentRound];

  // Calculate scores
  round.answers.forEach((answer) => {
    const votersForThis = room.players.filter((p) => p.votedFor === answer.id);

    if (answer.authorId === null) {
      // This is the truth -- award points to correct guessers
      votersForThis.forEach((voter) => {
        voter.score += 1000;
      });
    } else {
      // This is a lie -- award points to the lie author for each fool
      const author = room.players.find((p) => p.id === answer.authorId);
      if (author) {
        const foolCount = votersForThis.length;
        author.score += foolCount * 500;
        author.totalFools += foolCount;
      }
    }
  });

  round.revealed = true;
  room.status = "reveal";
  room.phaseEndsAt = Date.now() + REVEAL_TIME * 1000;
}

export async function advancePhase(roomId: string, playerId: string): Promise<FibbageRoom | null> {
  const room = await getRoom(roomId);
  if (!room) return null;
  if (room.hostId !== playerId) return null;

  if (room.status === "writing") {
    // Force transition to voting even if not everyone submitted
    // Give blank lies a default
    room.players.forEach((p) => {
      if (p.lie === null) {
        p.lie = "No answer";
      }
    });
    transitionToVoting(room);
    await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
    return room;
  }

  if (room.status === "voting") {
    // Force transition to reveal
    transitionToReveal(room);
    await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
    return room;
  }

  if (room.status === "reveal") {
    room.status = "scores";
    room.phaseEndsAt = Date.now() + SCORES_TIME * 1000;
    await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
    return room;
  }

  if (room.status === "scores") {
    // Move to next round or game over
    const nextRound = room.currentRound + 1;
    if (nextRound >= room.totalRounds) {
      room.status = "game_over";
      room.phaseEndsAt = null;
    } else {
      room.currentRound = nextRound;
      room.status = "writing";
      room.phaseEndsAt = Date.now() + WRITING_TIME * 1000;
      room.rounds.push({
        questionIndex: nextRound,
        answers: [],
        votes: {},
        revealed: false,
      });
      // Reset player state for new round
      room.players.forEach((p) => {
        p.lie = null;
        p.votedFor = null;
      });
    }
    await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
    return room;
  }

  return room;
}

export async function playAgain(roomId: string, playerId: string): Promise<FibbageRoom | null> {
  const room = await getRoom(roomId);
  if (!room) return null;
  if (room.hostId !== playerId) return null;
  if (room.status !== "game_over") return null;

  // Reset everything
  room.status = "waiting";
  room.currentRound = 0;
  room.rounds = [];
  room.questions = [];
  room.phaseEndsAt = null;
  room.players.forEach((p) => {
    p.score = 0;
    p.lie = null;
    p.votedFor = null;
    p.totalFools = 0;
  });

  await redis.set(redisKey(roomId), room, { ex: ROOM_TTL });
  return room;
}
