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
  // ── Passwords & Accounts ──────────────────────────────────────────────────
  {
    prompt: "A strong password should be at least ___ characters long.",
    truth: "12",
    category: "defense",
    funFact: "The longer your password, the harder it is to guess. A 12-character password with letters, numbers, and symbols would take thousands of years to crack!",
  },
  {
    prompt: "Using the same password for every website is a bad idea because if one site gets hacked, the attacker can get into all your ___.",
    truth: "Accounts",
    category: "concepts",
    funFact: "This is called 'credential stuffing.' Hackers take leaked passwords from one site and try them everywhere else. Always use a different password for each account!",
  },
  {
    prompt: "A tool that remembers all your different passwords so you only need one master password is called a password ___.",
    truth: "Manager",
    category: "defense",
    funFact: "Password managers like Bitwarden or 1Password create and store super strong passwords for you. You only have to remember one main password to unlock them all!",
  },
  {
    prompt: "When a website asks you to enter a code from your phone AND your password, that extra step is called two-factor ___.",
    truth: "Authentication",
    category: "defense",
    funFact: "Two-factor authentication (2FA) is like having two locks on your door. Even if someone steals your password, they still need your phone to get in!",
  },
  // ── Phishing & Scams ──────────────────────────────────────────────────────
  {
    prompt: "A fake email or message that tries to trick you into giving away your password is called ___.",
    truth: "Phishing",
    category: "attacks",
    funFact: "The word 'phishing' comes from 'fishing' -- scammers send out bait (fake messages) hoping someone will bite. Over 3 billion phishing emails are sent every day!",
  },
  {
    prompt: "If a stranger online asks you to share your home address, you should ___ them.",
    truth: "Block",
    category: "defense",
    funFact: "Personal information like your address, school name, or phone number should never be shared with strangers online. Always tell a trusted adult if someone asks for it!",
  },
  {
    prompt: "A pop-up that says 'You won a free iPhone! Click here!' is most likely a ___.",
    truth: "Scam",
    category: "attacks",
    funFact: "If something seems too good to be true online, it usually is. Scammers use exciting prizes to trick you into clicking dangerous links or giving away personal info.",
  },
  {
    prompt: "Before clicking a link in an email, you should ___ over it to see where it really goes.",
    truth: "Hover",
    category: "defense",
    funFact: "When you hover your mouse over a link (without clicking), you can see the real website address at the bottom of your screen. If it looks weird, do not click it!",
  },
  // ── Malware & Viruses ─────────────────────────────────────────────────────
  {
    prompt: "Software that is designed to harm your computer or steal your information is called ___.",
    truth: "Malware",
    category: "concepts",
    funFact: "Malware is short for 'malicious software.' It includes viruses, worms, and trojans. Keeping your software updated is one of the best ways to stay protected!",
  },
  {
    prompt: "A type of malware that locks all your files and demands money to unlock them is called ___.",
    truth: "Ransomware",
    category: "attacks",
    funFact: "Ransomware can lock up photos, homework, and everything on a computer. That is why it is so important to back up your files to an external drive or the cloud!",
  },
  {
    prompt: "A computer ___ can copy itself and spread from one computer to another, just like a cold spreads between people.",
    truth: "Virus",
    category: "concepts",
    funFact: "The first computer virus, called 'Creeper,' was made in 1971 as an experiment. It displayed the message 'I'm the creeper, catch me if you can!' on infected computers.",
  },
  {
    prompt: "A ___ horse is malware that looks like a fun game or useful app but secretly does bad things to your computer.",
    truth: "Trojan",
    category: "attacks",
    funFact: "Named after the ancient Greek story of the Trojan Horse! Soldiers hid inside a wooden horse to sneak into a city. Trojan malware hides inside normal-looking programs.",
  },
  // ── Online Safety & Privacy ───────────────────────────────────────────────
  {
    prompt: "The little lock icon next to a website address in your browser means the connection is ___.",
    truth: "Secure",
    category: "concepts",
    funFact: "The lock icon means the website uses HTTPS, which scrambles data between you and the site. But it does not mean the site itself is safe -- scam sites can have locks too!",
  },
  {
    prompt: "Information about you that is collected by websites and apps, like your name, age, and location, is called personal ___.",
    truth: "Data",
    category: "concepts",
    funFact: "Your personal data is very valuable. Companies collect it to show you ads, and hackers try to steal it. Always think twice before filling out forms or signing up for apps!",
  },
  {
    prompt: "When you share something online, it can stay on the internet ___.",
    truth: "Forever",
    category: "concepts",
    funFact: "Even if you delete a post, someone might have already taken a screenshot or saved it. Think of the internet like a permanent marker -- what you post could stick around!",
  },
  {
    prompt: "Keeping your apps and operating system up to date is important because updates often fix security ___.",
    truth: "Bugs",
    category: "defense",
    funFact: "Hackers look for bugs (mistakes in code) to break into systems. When a company finds a bug, they release an update to fix it. That is why you should never skip updates!",
  },
  // ── Networks & Wi-Fi ──────────────────────────────────────────────────────
  {
    prompt: "Using free Wi-Fi at a coffee shop without protection is risky because hackers might be able to see your ___.",
    truth: "Passwords",
    category: "attacks",
    funFact: "On public Wi-Fi, hackers can sometimes spy on what you type. Using a VPN (Virtual Private Network) creates a secret tunnel that keeps your data hidden from snoopers!",
  },
  {
    prompt: "A ___ is a program that hides your internet activity by creating a private, encrypted tunnel for your data.",
    truth: "VPN",
    category: "defense",
    funFact: "VPN stands for Virtual Private Network. It is like sending your mail in a locked box instead of a postcard -- nobody along the way can read it!",
  },
  {
    prompt: "A ___ is a security system that watches the data going in and out of your network and blocks anything suspicious.",
    truth: "Firewall",
    category: "defense",
    funFact: "A firewall works like a security guard for your computer. It checks every piece of data coming in and decides if it should be allowed through or blocked!",
  },
  // ── Social Engineering & Tricks ───────────────────────────────────────────
  {
    prompt: "When a hacker pretends to be someone you trust (like your teacher or a friend) to trick you, it is called social ___.",
    truth: "Engineering",
    category: "attacks",
    funFact: "Social engineering is really just a fancy word for tricking people. Hackers know that fooling a person is often easier than hacking a computer!",
  },
  {
    prompt: "If someone you do not know sends you a file to download in a game chat, you should NOT open it because it could contain a ___.",
    truth: "Virus",
    category: "defense",
    funFact: "Hackers often disguise malware as game mods, cheat codes, or funny videos. Only download files from websites and people you completely trust!",
  },
  {
    prompt: "Making up a believable story to trick someone into sharing secret information is called ___.",
    truth: "Pretexting",
    category: "attacks",
    funFact: "Pretexting is when someone invents a fake situation, like pretending to be tech support and saying your account was hacked, to trick you into giving them your password.",
  },
  // ── Fun Cyber Facts ───────────────────────────────────────────────────────
  {
    prompt: "The most common password in the world, used by millions of people, is ___.",
    truth: "123456",
    category: "concepts",
    funFact: "Every year, '123456' and 'password' top the list of most-used passwords. A hacker can crack these in less than one second! Use something much longer and harder to guess.",
  },
  {
    prompt: "A person who uses their hacking skills for good, like helping companies find security problems, is called an ___ hacker.",
    truth: "Ethical",
    category: "concepts",
    funFact: "Ethical hackers (also called white hat hackers) are like digital superheroes. Companies actually pay them to try to break in and report what they find!",
  },
  {
    prompt: "The scrambling of data so only the right person can read it is called ___.",
    truth: "Encryption",
    category: "concepts",
    funFact: "Encryption is like writing a secret message in a code only your friend knows. Apps like iMessage and WhatsApp use encryption so nobody else can read your texts!",
  },
  {
    prompt: "A ___ is a secret back door built into a program that lets someone sneak in without a password.",
    truth: "Backdoor",
    category: "attacks",
    funFact: "Backdoors can be placed by hackers or even by the people who made the software. That is why it is important to only download apps from official stores you trust!",
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
