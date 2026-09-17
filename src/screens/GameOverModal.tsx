import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { THEME } from '../constants/theme';
import { RoomData, UserProfile } from '../types/game';
import { Button } from '../components/Button';
import { Multiplayer } from '../services/multiplayer';
import { updateBattleResult } from '../services/storage';
import { SoundFX } from '../services/audio';
import { getAvatarById } from '../constants/avatars';

interface GameOverModalProps {
  visible: boolean;
  room: RoomData;
  userProfile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
  onRematchStarted: (resetRoom: RoomData) => void;
  onReturnHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  room,
  userProfile,
  onProfileUpdated,
  onRematchStarted,
  onReturnHome,
}) => {
  const [rematchRequested, setRematchRequested] = useState<boolean>(false);
  const [hasSavedStats, setHasSavedStats] = useState<boolean>(false);

  const isHost = room.host.id === userProfile.id;
  const you = isHost ? room.host : room.guest!;
  const opponent = isHost ? room.guest : room.host;

  const isWinner = room.winnerId === you.id;
  const isTie = room.winnerId === 'tie';

  // Calculate battle statistics
  const totalRounds = room.history.length;
  const damageDealt = room.history.reduce((sum, h) => {
    const youWonRound = h.winner === (isHost ? 'host' : 'guest');
    return youWonRound ? sum + h.damage : sum;
  }, 0);

  const movesUsed = room.history.reduce(
    (acc, h) => {
      const move = isHost ? h.hostMove : h.guestMove;
      acc[move] = (acc[move] || 0) + 1;
      return acc;
    },
    { rock: 0, paper: 0, scissors: 0 }
  );

  // Save battle result to local storage once
  useEffect(() => {
    if (visible && !hasSavedStats) {
      setHasSavedStats(true);
      updateBattleResult(isWinner, isTie, damageDealt, totalRounds, movesUsed)
        .then((updated) => {
          onProfileUpdated(updated);
        })
        .catch(() => {});
    }
  }, [visible]);

  // Listen for rematch synchronization
  useEffect(() => {
    let unsub: (() => void) | null = null;
    if (visible) {
      unsub = Multiplayer.subscribeToRoom(room.roomCode, (updatedRoom) => {
        // If room status returned to choosing, rematch has started!
        if (updatedRoom.status === 'choosing' && updatedRoom.round === 1) {
          SoundFX.playVictoryFanfare();
          onRematchStarted(updatedRoom);
        }
      });
    }
    return () => {
      if (unsub) unsub();
    };
  }, [visible, room.roomCode]);

  const handleRematch = () => {
    setRematchRequested(true);
    SoundFX.playTap();

    if (room.isAiBattle) {
      // In AI battle, restart battle instantly
      const resetAiRoom: RoomData = {
        ...room,
        status: 'choosing',
        round: 1,
        currentRoundWinner: null,
        currentRoundDamage: 0,
        winnerId: null,
        history: [],
        host: {
          ...room.host,
          hp: 100,
          selectedMove: null,
          moveLocked: false,
          score: 0,
        },
        guest: {
          ...room.guest!,
          hp: 100,
          selectedMove: null,
          moveLocked: false,
          score: 0,
        },
        lastUpdated: Date.now(),
      };
      onRematchStarted(resetAiRoom);
    } else {
      Multiplayer.requestRematch(room.roomCode, you.id);
    }
  };

  const opponentRequestedRematch =
    opponent && opponent.rematchRequested;

  const avatar = getAvatarById(userProfile.avatar);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onReturnHome}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Top Banner Gradient */}
          <LinearGradient
            colors={
              isWinner
                ? ['#3A2E12', '#1C1605', '#0E1017']
                : isTie
                ? ['#0A2540', '#041320', '#0E1017']
                : ['#3A0E1A', '#1C060C', '#0E1017']
            }
            style={styles.heroBanner}
          >
            {/* Emblem */}
            <View
              style={[
                styles.emblemCircle,
                isWinner
                  ? styles.emblemGold
                  : isTie
                  ? styles.emblemCyan
                  : styles.emblemCrimson,
              ]}
            >
              <MaterialCommunityIcons
                name={isWinner ? 'crown' : isTie ? 'shield-star' : 'skull-outline'}
                size={40}
                color={isWinner ? '#FFD700' : isTie ? '#00F0FF' : '#FF2A55'}
              />
            </View>

            <Text
              style={[
                styles.resultTitle,
                isWinner
                  ? styles.textGold
                  : isTie
                  ? styles.textCyan
                  : styles.textCrimson,
              ]}
            >
              {isWinner ? 'GLORIOUS VICTORY' : isTie ? 'HONORABLE DRAW' : 'DEFEAT'}
            </Text>

            <Text style={styles.resultSubtitle}>
              {isWinner
                ? 'You conquered the arena and crushed the challenger.'
                : isTie
                ? 'Both gladiators fought with equal skill and power.'
                : 'Rise again, warrior. Every defeat is a lesson in timing.'}
            </Text>

            {/* Rating Delta Badge */}
            <View style={styles.ratingBadge}>
              <MaterialCommunityIcons
                name={isWinner ? 'trending-up' : 'trending-down'}
                size={14}
                color={isWinner ? '#10B981' : isTie ? '#00F0FF' : '#FF2A55'}
              />
              <Text
                style={[
                  styles.ratingDeltaText,
                  { color: isWinner ? '#10B981' : isTie ? '#00F0FF' : '#FF2A55' },
                ]}
              >
                {isWinner ? '+35 ARENA MMR' : isTie ? '+5 MMR' : '-20 MMR'}
              </Text>
            </View>
          </LinearGradient>

          {/* Match Statistics */}
          <ScrollView
            style={styles.statsScroll}
            contentContainerStyle={styles.statsContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionHeader}>MATCH SUMMARY</Text>

            {/* Stat Grid */}
            <View style={styles.grid}>
              <View style={styles.gridBox}>
                <Text style={styles.gridValue}>{totalRounds}</Text>
                <Text style={styles.gridLabel}>ROUNDS FOUGHT</Text>
              </View>

              <View style={styles.gridBox}>
                <Text style={[styles.gridValue, { color: '#FFD700' }]}>
                  {damageDealt} HP
                </Text>
                <Text style={styles.gridLabel}>DMG DEALT</Text>
              </View>

              <View style={styles.gridBox}>
                <Text
                  style={[
                    styles.gridValue,
                    { color: you.hp > 0 ? '#10B981' : '#FF2A55' },
                  ]}
                >
                  {Math.max(0, you.hp)} / 100
                </Text>
                <Text style={styles.gridLabel}>FINAL HP</Text>
              </View>

              <View style={styles.gridBox}>
                <Text style={styles.gridValue}>
                  {you.score} - {opponent ? opponent.score : 0}
                </Text>
                <Text style={styles.gridLabel}>ROUND SCORE</Text>
              </View>
            </View>

            {/* Tactical Moves Distribution */}
            <Text style={styles.sectionHeader}>MOVE DISTRIBUTION</Text>
            <View style={styles.movesDistributionRow}>
              <View style={styles.moveStatBadge}>
                <Text style={styles.moveEmoji}>🪨</Text>
                <Text style={styles.moveCount}>{movesUsed.rock}</Text>
                <Text style={styles.moveLabel}>ROCK</Text>
              </View>
              <View style={styles.moveStatBadge}>
                <Text style={styles.moveEmoji}>📜</Text>
                <Text style={styles.moveCount}>{movesUsed.paper}</Text>
                <Text style={styles.moveLabel}>PAPER</Text>
              </View>
              <View style={styles.moveStatBadge}>
                <Text style={styles.moveEmoji}>⚔️</Text>
                <Text style={styles.moveCount}>{movesUsed.scissors}</Text>
                <Text style={styles.moveLabel}>SCISSORS</Text>
              </View>
            </View>

            {/* Opponent Rematch Alert */}
            {opponentRequestedRematch && (
              <View style={styles.rematchNotification}>
                <Ionicons name="flame" size={16} color="#FFD700" />
                <Text style={styles.rematchNotificationText}>
                  Opponent has requested a REMATCH!
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button
              title={
                rematchRequested
                  ? 'WAITING FOR OPPONENT...'
                  : opponentRequestedRematch
                  ? 'ACCEPT REMATCH ⚔️'
                  : 'REQUEST REMATCH'
              }
              variant="gold"
              size="lg"
              fullWidth
              onPress={handleRematch}
              disabled={rematchRequested}
              icon={
                <MaterialCommunityIcons
                  name="sword-cross"
                  size={20}
                  color="#07080B"
                />
              }
            />

            <Button
              title="RETURN HOME"
              variant="dark"
              size="md"
              fullWidth
              onPress={onReturnHome}
              icon={<Ionicons name="home-outline" size={18} color="#94A3B8" />}
              style={styles.homeBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0E1017',
    borderRadius: THEME.radius.xl,
    borderWidth: 1.5,
    borderColor: '#2A2E3D',
    overflow: 'hidden',
    maxHeight: '90%',
  },
  heroBanner: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222736',
  },
  emblemCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 12,
  },
  emblemGold: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 8,
  },
  emblemCrimson: {
    backgroundColor: 'rgba(255, 42, 85, 0.1)',
    borderColor: '#FF2A55',
    shadowColor: '#FF2A55',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 8,
  },
  emblemCyan: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 8,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2.5,
    marginBottom: 6,
  },
  textGold: {
    color: '#FFD700',
  },
  textCrimson: {
    color: '#FF2A55',
  },
  textCyan: {
    color: '#00F0FF',
  },
  resultSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 320,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: '#2A2E3D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  ratingDeltaText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statsScroll: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  statsContent: {
    paddingBottom: 10,
  },
  sectionHeader: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  gridBox: {
    width: '48%',
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: '#222736',
    borderRadius: THEME.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  gridValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  gridLabel: {
    color: THEME.colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  movesDistributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  moveStatBadge: {
    flex: 1,
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: '#222736',
    borderRadius: THEME.radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  moveEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  moveCount: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  moveLabel: {
    color: THEME.colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rematchNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderWidth: 1,
    borderColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 6,
  },
  rematchNotificationText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '800',
  },
  actionsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A1E2B',
    gap: 10,
  },
  homeBtn: {
    marginTop: 2,
  },
});
