import { Move, PlayerData } from '../types/game';

export interface AiBotProfile {
  id: string;
  name: string;
  avatar: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'grandmaster';
  quote: string;
  selectMove: (playerHistory: Move[], opponentHp: number, myHp: number) => Move;
}

const COUNTER_MOVE: Record<Move, Move> = {
  rock: 'paper',
  paper: 'scissors',
  scissors: 'rock',
};

const RANDOM_MOVES: Move[] = ['rock', 'paper', 'scissors'];

export const AI_BOTS: AiBotProfile[] = [
  {
    id: 'bot_spartan',
    name: 'Aegis Bot',
    avatar: 'aegis',
    difficulty: 'easy',
    quote: 'Stand firm, warrior!',
    selectMove: () => {
      return RANDOM_MOVES[Math.floor(Math.random() * 3)];
    },
  },
  {
    id: 'bot_ronin',
    name: 'Chaos Ronin Bot',
    avatar: 'kage',
    difficulty: 'medium',
    quote: 'Predict the unpredictable!',
    selectMove: (history) => {
      if (history.length > 0 && Math.random() < 0.45) {
        // Assume player won't repeat same move, counter the other one
        const last = history[history.length - 1];
        return COUNTER_MOVE[last];
      }
      return RANDOM_MOVES[Math.floor(Math.random() * 3)];
    },
  },
  {
    id: 'bot_kaido',
    name: 'Grandmaster Kaido',
    avatar: 'kaido',
    difficulty: 'hard',
    quote: 'Every choice is a tell. I read your mind.',
    selectMove: (history, opponentHp, myHp) => {
      if (history.length < 2) {
        return RANDOM_MOVES[Math.floor(Math.random() * 3)];
      }

      // Analyze player's most frequent move in the last 3 rounds
      const recent = history.slice(-3);
      const counts: Record<Move, number> = { rock: 0, paper: 0, scissors: 0 };
      recent.forEach((m) => {
        counts[m] = (counts[m] || 0) + 1;
      });

      let mostFrequent: Move = 'rock';
      let maxCount = -1;
      (Object.keys(counts) as Move[]).forEach((m) => {
        if (counts[m] > maxCount) {
          maxCount = counts[m];
          mostFrequent = m;
        }
      });

      // If critical HP, player might rush Rock or Scissors
      if (opponentHp <= 20 && Math.random() < 0.7) {
        return COUNTER_MOVE[mostFrequent];
      }

      // 65% counter the predicted move
      if (Math.random() < 0.65) {
        return COUNTER_MOVE[mostFrequent];
      }

      return RANDOM_MOVES[Math.floor(Math.random() * 3)];
    },
  },
  {
    id: 'bot_cyber',
    name: 'Cyber-01 Grandmaster',
    avatar: 'cyber',
    difficulty: 'grandmaster',
    quote: 'Algorithmic victory sequence initiated.',
    selectMove: (history) => {
      if (history.length === 0) return 'paper';
      const last = history[history.length - 1];
      // Advanced Markovian-style counter
      const rand = Math.random();
      if (rand < 0.7) {
        return COUNTER_MOVE[last];
      } else if (rand < 0.85) {
        return last;
      }
      return RANDOM_MOVES[Math.floor(Math.random() * 3)];
    },
  },
];

export const createAiPlayerData = (bot: AiBotProfile): PlayerData => {
  return {
    id: bot.id,
    username: bot.name,
    avatar: bot.avatar,
    hp: 100,
    selectedMove: null,
    moveLocked: false,
    score: 0,
    connected: true,
  };
};
