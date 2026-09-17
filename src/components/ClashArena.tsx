import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Move, GameStatus } from '../types/game';
import { THEME } from '../constants/theme';

interface ClashArenaProps {
  status: GameStatus;
  round: number;
  revealCountdown: number;
  userMove: Move | null;
  opponentMove: Move | null;
  userLocked: boolean;
  opponentLocked: boolean;
  roundWinner: 'host' | 'guest' | 'tie' | null;
  isHost: boolean;
  roundDamage: number;
}

const MOVE_DATA: Record<Move, { symbol: string; name: string; color: string; icon: string }> = {
  rock: { symbol: '🪨', name: 'ROCK', color: '#F59E0B', icon: 'hand-back-fist' },
  paper: { symbol: '📜', name: 'PAPER', color: '#00F0FF', icon: 'hand-front-right' },
  scissors: { symbol: '⚔️', name: 'SCISSORS', color: '#FF2A55', icon: 'content-cut' },
};

export const ClashArena: React.FC<ClashArenaProps> = ({
  status,
  round,
  revealCountdown,
  userMove,
  opponentMove,
  userLocked,
  opponentLocked,
  roundWinner,
  isHost,
  roundDamage,
}) => {
  const countdownScale = useRef(new Animated.Value(1)).current;
  const cardSlideLeft = useRef(new Animated.Value(-120)).current;
  const cardSlideRight = useRef(new Animated.Value(120)).current;
  const pulseRadar = useRef(new Animated.Value(1)).current;

  // Animate countdown pulse
  useEffect(() => {
    if (status === 'revealing') {
      countdownScale.setValue(1.8);
      Animated.spring(countdownScale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [revealCountdown, status]);

  // Animate clash cards meeting
  useEffect(() => {
    if (status === 'round_result') {
      cardSlideLeft.setValue(-120);
      cardSlideRight.setValue(120);
      Animated.parallel([
        Animated.spring(cardSlideLeft, { toValue: 0, friction: 5, useNativeDriver: true }),
        Animated.spring(cardSlideRight, { toValue: 0, friction: 5, useNativeDriver: true }),
      ]).start();
    }
  }, [status]);

  // Radar pulse for waiting
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (status === 'choosing') {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseRadar, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseRadar, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      loop.start();
    }
    return () => loop?.stop();
  }, [status]);

  const didUserWin =
    roundWinner === (isHost ? 'host' : 'guest');
  const isTie = roundWinner === 'tie';

  const getOutcomeDetails = () => {
    if (isTie) {
      return {
        title: 'CLASH! DRAW!',
        subtitle: 'Both fighters chose the same move. 0 Damage dealt.',
        color: '#00F0FF',
        bg: ['#0A2540', '#041320'] as [string, string],
      };
    }
    if (didUserWin) {
      return {
        title: 'ROUND VICTORY!',
        subtitle: `Direct hit! Dealt +${roundDamage} Damage to opponent!`,
        color: '#FFD700',
        bg: ['#3A2E12', '#1A1406'] as [string, string],
      };
    }
    return {
      title: 'ROUND DEFEAT!',
      subtitle: `Opponent counter! Suffered -${roundDamage} HP damage!`,
      color: '#FF2A55',
      bg: ['#3A0E1A', '#1C060C'] as [string, string],
    };
  };

  return (
    <View style={styles.container}>
      {/* Round Badge Header */}
      <View style={styles.roundBadge}>
        <Text style={styles.roundBadgeText}>ROUND {round}</Text>
      </View>

      {/* Arena Stage */}
      <View style={styles.stage}>
        {/* State 1: Choosing Moves */}
        {status === 'choosing' && (
          <View style={styles.choosingContainer}>
            <View style={styles.lockStatusRow}>
              {/* You lock indicator */}
              <View
                style={[
                  styles.lockStatusPill,
                  userLocked ? styles.lockStatusActive : styles.lockStatusPending,
                ]}
              >
                <Ionicons
                  name={userLocked ? 'shield-checkmark' : 'hourglass-outline'}
                  size={14}
                  color={userLocked ? '#FFD700' : THEME.colors.textMuted}
                />
                <Text
                  style={[
                    styles.lockStatusText,
                    userLocked && styles.lockStatusTextActive,
                  ]}
                >
                  {userLocked ? 'YOU: LOCKED IN' : 'YOU: DECIDING...'}
                </Text>
              </View>

              <Text style={styles.vsText}>VS</Text>

              {/* Opponent lock indicator */}
              <View
                style={[
                  styles.lockStatusPill,
                  opponentLocked ? styles.lockStatusActive : styles.lockStatusPending,
                ]}
              >
                <Ionicons
                  name={opponentLocked ? 'shield-checkmark' : 'hourglass-outline'}
                  size={14}
                  color={opponentLocked ? '#00F0FF' : THEME.colors.textMuted}
                />
                <Text
                  style={[
                    styles.lockStatusText,
                    opponentLocked && styles.lockStatusTextOpponentActive,
                  ]}
                >
                  {opponentLocked ? 'OPPONENT: READY' : 'OPPONENT: THINKING...'}
                </Text>
              </View>
            </View>

            {/* Prompt Banner */}
            <Animated.View style={{ transform: [{ scale: pulseRadar }] }}>
              <LinearGradient
                colors={['#1E2230', '#121520']}
                style={styles.promptCard}
              >
                <Text style={styles.promptMain}>
                  {userLocked
                    ? 'MOVE CONFIRMED'
                    : 'CHOOSE YOUR MOVE'}
                </Text>
                <Text style={styles.promptSub}>
                  {userLocked
                    ? 'Awaiting opponent lock-in for 3-2-1 reveal!'
                    : 'Rock crushes Scissors, Paper covers Rock, Scissors cuts Paper'}
                </Text>
              </LinearGradient>
            </Animated.View>
          </View>
        )}

        {/* State 2: 3-2-1 Reveal Countdown */}
        {status === 'revealing' && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownSubtitle}>PREPARE FOR CLASH</Text>
            <Animated.View
              style={[
                styles.countdownCircle,
                { transform: [{ scale: countdownScale }] },
              ]}
            >
              <LinearGradient
                colors={['#FFD700', '#B45309']}
                style={styles.countdownCircleGradient}
              >
                <Text style={styles.countdownNumber}>
                  {revealCountdown > 0 ? revealCountdown : 'CLASH!'}
                </Text>
              </LinearGradient>
            </Animated.View>
            <Text style={styles.countdownTag}>REVEALING CHOICES...</Text>
          </View>
        )}

        {/* State 3: Round Result (Cards Clashing) */}
        {status === 'round_result' && userMove && opponentMove && (
          <View style={styles.resultContainer}>
            <View style={styles.clashCardsRow}>
              {/* User Move Card */}
              <Animated.View
                style={[
                  styles.clashCardWrapper,
                  { transform: [{ translateX: cardSlideLeft }] },
                ]}
              >
                <LinearGradient
                  colors={
                    didUserWin
                      ? ['#3A2E12', '#1C1605']
                      : ['#1C202C', '#121520']
                  }
                  style={[
                    styles.clashCard,
                    didUserWin && styles.clashCardWinner,
                  ]}
                >
                  <Text style={styles.clashCardOwner}>YOU</Text>
                  <Text style={styles.clashCardSymbol}>
                    {MOVE_DATA[userMove]?.symbol}
                  </Text>
                  <Text
                    style={[
                      styles.clashCardName,
                      { color: MOVE_DATA[userMove]?.color },
                    ]}
                  >
                    {MOVE_DATA[userMove]?.name}
                  </Text>
                </LinearGradient>
              </Animated.View>

              {/* Clash Center Spark */}
              <View style={styles.sparkContainer}>
                <MaterialCommunityIcons
                  name="sword-cross"
                  size={32}
                  color={isTie ? '#00F0FF' : didUserWin ? '#FFD700' : '#FF2A55'}
                />
              </View>

              {/* Opponent Move Card */}
              <Animated.View
                style={[
                  styles.clashCardWrapper,
                  { transform: [{ translateX: cardSlideRight }] },
                ]}
              >
                <LinearGradient
                  colors={
                    !didUserWin && !isTie
                      ? ['#3A0E1A', '#1C060C']
                      : ['#1C202C', '#121520']
                  }
                  style={[
                    styles.clashCard,
                    !didUserWin && !isTie && styles.clashCardWinnerCrimson,
                  ]}
                >
                  <Text style={styles.clashCardOwner}>OPPONENT</Text>
                  <Text style={styles.clashCardSymbol}>
                    {MOVE_DATA[opponentMove]?.symbol}
                  </Text>
                  <Text
                    style={[
                      styles.clashCardName,
                      { color: MOVE_DATA[opponentMove]?.color },
                    ]}
                  >
                    {MOVE_DATA[opponentMove]?.name}
                  </Text>
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Outcome Banner */}
            <LinearGradient
              colors={getOutcomeDetails().bg}
              style={[
                styles.outcomeBanner,
                { borderColor: getOutcomeDetails().color },
              ]}
            >
              <Text
                style={[
                  styles.outcomeTitle,
                  { color: getOutcomeDetails().color },
                ]}
              >
                {getOutcomeDetails().title}
              </Text>
              <Text style={styles.outcomeSubtitle}>
                {getOutcomeDetails().subtitle}
              </Text>
            </LinearGradient>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  roundBadge: {
    backgroundColor: '#1E2230',
    borderColor: THEME.colors.goldBorder,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  roundBadgeText: {
    color: THEME.colors.gold,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  stage: {
    width: '100%',
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choosingContainer: {
    width: '100%',
    alignItems: 'center',
  },
  lockStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  lockStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#161922',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2E3D',
  },
  lockStatusActive: {
    borderColor: THEME.colors.gold,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
  },
  lockStatusPending: {
    borderColor: '#2A2E3D',
  },
  lockStatusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: THEME.colors.textMuted,
  },
  lockStatusTextActive: {
    color: THEME.colors.gold,
  },
  lockStatusTextOpponentActive: {
    color: THEME.colors.cyan,
  },
  vsText: {
    fontSize: 12,
    fontWeight: '900',
    color: THEME.colors.textMuted,
  },
  promptCard: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#2A2E3D',
    alignItems: 'center',
  },
  promptMain: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  promptSub: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  countdownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },
  countdownCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  countdownCircleGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNumber: {
    color: '#07080B',
    fontSize: 32,
    fontWeight: '900',
  },
  countdownTag: {
    color: THEME.colors.gold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 10,
  },
  resultContainer: {
    width: '100%',
    alignItems: 'center',
  },
  clashCardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
    marginBottom: 14,
  },
  clashCardWrapper: {
    width: 105,
  },
  clashCard: {
    borderRadius: THEME.radius.md,
    borderWidth: 1.5,
    borderColor: '#2A2E3D',
    paddingVertical: 12,
    alignItems: 'center',
  },
  clashCardWinner: {
    borderColor: THEME.colors.gold,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 8,
  },
  clashCardWinnerCrimson: {
    borderColor: '#FF2A55',
    shadowColor: '#FF2A55',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 8,
  },
  clashCardOwner: {
    fontSize: 10,
    fontWeight: '900',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  clashCardSymbol: {
    fontSize: 32,
    marginVertical: 4,
  },
  clashCardName: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sparkContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0E1017',
    borderWidth: 1.5,
    borderColor: '#2A2E3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outcomeBanner: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: THEME.radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  outcomeTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  outcomeSubtitle: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
