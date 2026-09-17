import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, GameSettings } from '../types/game';

const STORAGE_KEYS = {
  USER_PROFILE: '@rps_arena:user_profile',
  SETTINGS: '@rps_arena:settings',
  LAST_ROOM_CODE: '@rps_arena:last_room',
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'guest_' + Math.random().toString(36).substring(2, 9),
  username: 'Gladiator#' + Math.floor(1000 + Math.random() * 9000),
  avatar: 'aurelius',
  totalBattles: 0,
  wins: 0,
  losses: 0,
  ties: 0,
  winStreak: 0,
  bestWinStreak: 0,
  totalRoundsFought: 0,
  totalDamageDealt: 0,
  rockCount: 0,
  paperCount: 0,
  scissorsCount: 0,
  rankTitle: 'Arena Recruit',
  arenaRating: 1000,
};

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  bgmEnabled: true,
};

export const getStoredProfile = async (): Promise<UserProfile> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (data) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
    }
  } catch (e) {
    console.warn('Failed to load profile:', e);
  }
  return DEFAULT_PROFILE;
};

export const saveStoredProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.warn('Failed to save profile:', e);
  }
};

export const updateBattleResult = async (
  isWin: boolean,
  isTie: boolean,
  damageDealt: number,
  roundsCount: number,
  movesUsed: { rock: number; paper: number; scissors: number }
): Promise<UserProfile> => {
  const current = await getStoredProfile();
  const wins = isWin ? current.wins + 1 : current.wins;
  const losses = !isWin && !isTie ? current.losses + 1 : current.losses;
  const ties = isTie ? current.ties + 1 : current.ties;
  const winStreak = isWin ? current.winStreak + 1 : 0;
  const bestWinStreak = Math.max(winStreak, current.bestWinStreak);
  const totalBattles = current.totalBattles + 1;
  const totalRoundsFought = current.totalRoundsFought + roundsCount;
  const totalDamageDealt = current.totalDamageDealt + damageDealt;
  const rockCount = current.rockCount + movesUsed.rock;
  const paperCount = current.paperCount + movesUsed.paper;
  const scissorsCount = current.scissorsCount + movesUsed.scissors;

  // Calculate rating & rank title
  const ratingDelta = isWin ? 35 : isTie ? 5 : -20;
  const arenaRating = Math.max(800, current.arenaRating + ratingDelta);

  let rankTitle = 'Arena Recruit';
  if (arenaRating >= 1500) rankTitle = 'Grand Champion 👑';
  else if (arenaRating >= 1350) rankTitle = 'Master Gladiator ⚔️';
  else if (arenaRating >= 1200) rankTitle = 'Arena Veteran 🛡️';
  else if (arenaRating >= 1100) rankTitle = 'Arena Warrior ⚡';

  const updated: UserProfile = {
    ...current,
    totalBattles,
    wins,
    losses,
    ties,
    winStreak,
    bestWinStreak,
    totalRoundsFought,
    totalDamageDealt,
    rockCount,
    paperCount,
    scissorsCount,
    arenaRating,
    rankTitle,
  };

  await saveStoredProfile(updated);
  return updated;
};

export const getStoredSettings = async (): Promise<GameSettings> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (e) {
    console.warn('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
};

export const saveStoredSettings = async (settings: GameSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
};
