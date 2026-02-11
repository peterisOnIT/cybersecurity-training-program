// Game types and question data for Cyber Clash

export interface Player {
  id: string
  name: string
  score: number
  answered: boolean
  lastCorrect: boolean | null
  color: string
  streak: number
}

export interface Question {
  id: number
  from: string
  subject: string
  body: string
  correctAnswer: "phishing" | "legit"
  explanation: string
  clues: string[]
}

export type GamePhase = "waiting" | "question" | "reveal" | "scores" | "final"

export interface Room {
  code: string
  hostId: string
  players: Player[]
  phase: GamePhase
  questionIndex: number
  timeRemaining: number
  createdAt: number
  lastActivity: number
}

export const PLAYER_COLORS = [
  "oklch(0.87 0.17 85)",    // yellow
  "oklch(0.72 0.19 30)",    // coral
  "oklch(0.72 0.14 195)",   // teal
  "oklch(0.72 0.19 165)",   // green
  "oklch(0.72 0.16 310)",   // pink
  "oklch(0.72 0.16 250)",   // blue
  "oklch(0.80 0.15 60)",    // orange
  "oklch(0.72 0.16 130)",   // lime
]

export const TIMER_DURATION = 15

export const QUESTIONS: Question[] = [
  {
    id: 1,
    from: "security@bankofamerica-alerts.com",
    subject: "URGENT: Suspicious Activity Detected on Your Account",
    body: "Dear Valued Customer,\n\nWe have detected unusual activity on your account ending in ****4892. Your account has been temporarily limited.\n\nTo restore full access, please verify your identity immediately by clicking the secure link below:\n\nhttp://boa-secure-verify.com/auth/login\n\nFailure to verify within 24 hours will result in permanent account suspension.\n\nBank of America Security Team",
    correctAnswer: "phishing",
    explanation: "The sender domain 'bankofamerica-alerts.com' is not the real Bank of America domain (bankofamerica.com). The link goes to 'boa-secure-verify.com', another fake domain. Real banks never threaten permanent suspension via email.",
    clues: ["Fake sender domain", "Suspicious link URL", "Urgency and threats"],
  },
  {
    id: 2,
    from: "no-reply@zoom.us",
    subject: "Cloud Recording Available - Project Sync Meeting",
    body: "Hi team,\n\nYour cloud recording for 'Project Sync Meeting' is now available.\n\nTopic: Weekly Project Sync\nDate: Feb 7, 2026 at 2:00 PM EST\nDuration: 47 minutes\n\nYou can access the recording from your Zoom account under Recordings, or click the link in your Zoom app.\n\nThis recording will be available for 30 days.\n\nBest,\nThe Zoom Team",
    correctAnswer: "legit",
    explanation: "This is from the real zoom.us domain. It references a specific meeting with realistic details. It directs you to access recordings through your existing Zoom account rather than a suspicious external link.",
    clues: ["Legitimate zoom.us domain", "Specific meeting details", "Directs to your own account"],
  },
  {
    id: 3,
    from: "ceo@company-corp.net",
    subject: "Confidential - Need Your Help ASAP",
    body: "Hey,\n\nAre you at your desk? I need a quick favor. I'm stuck in a board meeting and can't make a call right now.\n\nI need you to purchase 5 Amazon gift cards at $100 each for a client appreciation event this afternoon. Buy them online and send me the redemption codes ASAP. I'll get you reimbursed today.\n\nPlease keep this between us for now.\n\nThanks,\nJames (sent from iPhone)",
    correctAnswer: "phishing",
    explanation: "This is a classic CEO impersonation / Business Email Compromise (BEC) scam. Red flags: asks for gift cards (untraceable currency), requests secrecy, creates urgency, and the email domain doesn't match the real company.",
    clues: ["Gift card request", "Asks for secrecy", "Unusual urgency from 'CEO'"],
  },
  {
    id: 4,
    from: "hr@yourcompany.com",
    subject: "Open Enrollment Reminder - Benefits Selection Due Friday",
    body: "Hi everyone,\n\nFriendly reminder that the annual benefits open enrollment period closes this Friday, February 13th.\n\nPlease log in to the HR portal (accessible through the company intranet or Workday) to review and update your selections for:\n- Health insurance\n- Dental and vision\n- 401(k) contributions\n- Life insurance\n\nIf you have questions, contact the HR team at ext. 2400 or visit us in Room 301.\n\nBest regards,\nHR Benefits Team",
    correctAnswer: "legit",
    explanation: "This is a standard internal HR communication. It references well-known internal systems (Workday, company intranet), provides a physical office location and phone extension, and doesn't include any external links or urgent threats.",
    clues: ["Internal company domain", "References known systems", "Provides physical contact info"],
  },
  {
    id: 5,
    from: "microsoftonline-support@outlook.com",
    subject: "Action Required: Your Password Expires in 24 Hours",
    body: "Dear User,\n\nYour Microsoft 365 password is set to expire in 24 hours. To avoid losing access to your email and files, please update your password now.\n\nClick here to update: https://m1crosoft365-portal.com/password-reset\n\nIf you did not request this change, please update your password immediately to secure your account.\n\nMicrosoft Support Team\nRef: MS-SEC-28491",
    correctAnswer: "phishing",
    explanation: "The link goes to 'm1crosoft365-portal.com' - notice the '1' replacing the 'i' in Microsoft (typosquatting). Real Microsoft password resets come from microsoft.com domains and direct you to account.microsoft.com.",
    clues: ["Typosquatted domain (m1crosoft)", "Generic greeting", "Artificial urgency"],
  },
  {
    id: 6,
    from: "shipping@amazon.com",
    subject: "Your Amazon Order Has Shipped - Arriving Wednesday",
    body: "Hello,\n\nGreat news! Your order #114-2849571-8834920 has shipped and is on its way.\n\nLogitech MX Master 3S Mouse\nEstimated delivery: Wednesday, February 11\n\nTrack your package in the Amazon app or on amazon.com under Your Orders.\n\nThank you for shopping with us!\nAmazon.com",
    correctAnswer: "legit",
    explanation: "This is from the real amazon.com domain with a realistic order number format. It directs you to track via the official Amazon app or website rather than including suspicious external links.",
    clues: ["Real amazon.com domain", "Specific order number format", "Directs to official app/site"],
  },
  {
    id: 7,
    from: "it-helpdesk@company-support.net",
    subject: "Mandatory: Install Security Update to Continue Working",
    body: "ATTENTION ALL EMPLOYEES:\n\nDue to a critical vulnerability, all employees must install the latest security patch within the next 2 hours.\n\nDownload the update here: http://company-security-patch.net/update.exe\n\nWARNING: Failure to install this patch will result in your computer being blocked from the network.\n\nIT Security Department",
    correctAnswer: "phishing",
    explanation: "Legitimate IT departments push security updates through managed systems (SCCM, Intune, etc.), not email links to .exe files. The domain 'company-support.net' is not an official internal domain, and the aggressive urgency is a red flag.",
    clues: ["Links to .exe download", "Non-official domain", "Threatening language"],
  },
  {
    id: 8,
    from: "notifications@linkedin.com",
    subject: "Sarah Chen viewed your profile",
    body: "Hi there,\n\nSarah Chen, Senior Recruiter at Google, viewed your profile.\n\nSee what they found interesting about your background by visiting your LinkedIn dashboard.\n\nYou can manage your notification preferences in your LinkedIn settings.\n\nLinkedIn\n1000 W Maude Ave, Sunnyvale, CA 94085",
    correctAnswer: "legit",
    explanation: "This is from the real linkedin.com domain with their standard notification format. It includes their real physical address and doesn't ask you to click suspicious links -- just directs you to your own LinkedIn dashboard.",
    clues: ["Real linkedin.com domain", "Standard notification format", "Real physical address"],
  },
]

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function generatePlayerId(): string {
  return "p_" + Math.random().toString(36).substring(2, 9)
}
