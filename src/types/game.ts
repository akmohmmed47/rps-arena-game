export type Move = 'rock' | 'paper' | 'scissors';

export type GameStatus =
  | 'waiting'          // Waiting for player 2
  | 'ready'            // Both players joined, ready to fight
  | 'countdown_start'  // 3s countdown before first round
  | 'choosing'         // Players picking move
  | 'revealing'        // 3-2-1 reveal animation
  | 'round_result'     // Showing round outcome & damage
  | 'game_over';       // HP 0 reached

export interface PlayerData {
  id: string;
  username: string;
  avatar: string; // Avatar ID
  hp: number; // 0 - 100
  selectedMove: Move | null;
  moveLocked: boolean;
  score: number; // Rounds won
  rematchRequested?: boolean;
  connected?: boolean;
  lastActive?: number;
}

export interface RoundHistoryItem {
  round: number;
  hostMove: Move;
  guestMove: Move;
  winner: 'host' | 'guest' | 'tie';
  damage: number;
  timestamp: number;
}

export interface RoomData {
  roomCode: string; // 6 uppercase alphanumeric chars
  createdAt: number;
  lastUpdated: number;
  status: GameStatus;
  round: number;
  host: PlayerData;
  guest: PlayerData | null;
  currentRoundWinner: 'host' | 'guest' | 'tie' | null;
  currentRoundDamage: number;
  revealCountdown: number; // 3, 2, 1, 0
  history: RoundHistoryItem[];
  winnerId: string | null;
  lastTaunt?: {
    senderId: string;
    text: string;
    timestamp: number;
  } | null;
  isAiBattle?: boolean;
  aiDifficulty?: 'easy' | 'medium' | 'hard' | 'grandmaster';
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  totalBattles: number;
  wins: number;
  losses: number;
  ties: number;
  winStreak: number;
  bestWinStreak: number;
  totalRoundsFought: number;
  totalDamageDealt: number;
  rockCount: number;
  paperCount: number;
  scissorsCount: number;
  rankTitle: string;
  arenaRating: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  bgmEnabled: boolean;
  customFirebaseConfig?: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
}
