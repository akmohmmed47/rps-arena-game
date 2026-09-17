import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { THEME } from '../constants/theme';
import { RoomData, Move, UserProfile } from '../types/game';
import { HPBar } from '../components/HPBar';
import { MoveCard } from '../components/MoveCard';
import { ClashArena } from '../components/ClashArena';
import { DamageFloater } from '../components/DamageFloater';
import { TauntBar } from '../components/TauntBar';
import { Multiplayer } from '../services/multiplayer';
import { SoundFX } from '../services/audio';
import { getAvatarById } from '../constants/avatars';
import { AI_BOTS } from '../services/aiBot';

interface BattleScreenProps {
  roomCode: string;
  initialRoom: RoomData;
  userProfile: UserProfile;
  onGameOver: (room: RoomData) => void;
  onLeaveBattle: () => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  roomCode,
  initialRoom,
  userProfile,
  onGameOver,
  onLeaveBattle,
}) => {
  const [room, setRoom] = useState<RoomData>(initialRoom);
  const [activeTaunt, setActiveTaunt] = useState<{ sender: string; text: string } | null>(null);
  const [damageFloaterState, setDamageFloaterState] = useState<{
    visible: boolean;
    damage: number;
    type: 'damage_taken' | 'damage_dealt' | 'tie';
  }>({ visible: false, damage: 20, type: 'damage_taken' });

  const isHost = room.host.id === userProfile.id;
  const you = isHost ? room.host : room.guest!;
  const opponent = isHost ? room.guest : room.host;

  const userAvatar = getAvatarById(you.avatar);
  const opponentAvatar = opponent ? getAvatarById(opponent.avatar) : getAvatarById('kaido');

  const screenFlashAnim = useRef(new Animated.Value(0)).current;
  const criticalBorderAnim = useRef(new Animated.Value(0)).current;

  // Real-time synchronization subscription
  useEffect(() => {
    const unsub = Multiplayer.subscribeToRoom(roomCode, (updatedRoom) => {
      setRoom(updatedRoom);

      // Handle in-game taunts
      if (updatedRoom.lastTaunt && updatedRoom.lastTaunt.senderId !== userProfile.id) {
        const senderName = updatedRoom.lastTaunt.senderId === updatedRoom.host.id
          ? updatedRoom.host.username
          : updatedRoom.guest?.username || 'Opponent';
        setActiveTaunt({
          sender: senderName,
          text: updatedRoom.lastTaunt.text,
        });
        setTimeout(() => setActiveTaunt(null), 3500);
      }

      // Handle Damage Impact Visuals
      if (updatedRoom.status === 'round_result' && updatedRoom.currentRoundWinner) {
        const winner = updatedRoom.currentRoundWinner;
        const didYouWin = winner === (isHost ? 'host' : 'guest');
        const isTie = winner === 'tie';

        if (isTie) {
          setDamageFloaterState({ visible: true, damage: 0, type: 'tie' });
        } else if (didYouWin) {
          setDamageFloaterState({ visible: true, damage: 20, type: 'damage_dealt' });
        } else {
          setDamageFloaterState({ visible: true, damage: 20, type: 'damage_taken' });
          // Trigger screen red flash
          Animated.sequence([
            Animated.timing(screenFlashAnim, { toValue: 0.35, duration: 80, useNativeDriver: true }),
            Animated.timing(screenFlashAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]).start();
        }

        setTimeout(() => {
          setDamageFloaterState((prev) => ({ ...prev, visible: false }));
        }, 2200);
      }

      // Check for Game Over
      if (updatedRoom.status === 'game_over') {
        setTimeout(() => {
          onGameOver(updatedRoom);
        }, 1800);
      }
    });

    return () => unsub();
  }, [roomCode, isHost, userProfile.id]);

  // Critical HP border pulsing
  const isCritical = you.hp <= 20 && you.hp > 0;
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (isCritical) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(criticalBorderAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(criticalBorderAnim, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        ])
      );
      loop.start();
    } else {
      criticalBorderAnim.setValue(0);
    }
    return () => loop?.stop();
  }, [isCritical]);

  // Handle Player Move Selection
  const handleSelectMove = (move: Move) => {
    if (room.status !== 'choosing' || you.moveLocked) return;

    Multiplayer.makeMove(roomCode, you.id, move);

    // If fighting AI Bot, trigger bot response
    if (room.isAiBattle) {
      const botProfile = AI_BOTS.find((b) => b.difficulty === room.aiDifficulty) || AI_BOTS[0];
      Multiplayer.triggerAiMove(roomCode, botProfile.selectMove);
    }
  };

  const handleSendTaunt = (text: string) => {
    Multiplayer.sendTaunt(roomCode, you.id, text);
    setActiveTaunt({ sender: 'YOU', text });
    setTimeout(() => setActiveTaunt(null), 3000);
  };

  // Determine opponent move visibility:
  // ONLY reveal opponent move once round status is 'round_result' or 'game_over'!
  const isRevealed = room.status === 'round_result' || room.status === 'game_over';
  const opponentMoveRevealed = isRevealed && opponent ? opponent.selectedMove : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Screen Red Damage Flash Overlay */}
      <Animated.View
        pointerEvents="none"
        style={[styles.flashOverlay, { opacity: screenFlashAnim }]}
      />

      {/* Critical HP Alert Border */}
      {isCritical && (
        <Animated.View
          pointerEvents="none"
          style={[styles.criticalBorder, { opacity: criticalBorderAnim }]}
        />
      )}

      {/* Top Arena Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onLeaveBattle}
          style={styles.exitBtn}
        >
          <Ionicons name="chevron-back" size={18} color="#FFD700" />
          <Text style={styles.exitText}>LEAVE</Text>
        </TouchableOpacity>

        <View style={styles.roomCodeTag}>
          <Text style={styles.roomCodeLabel}>ROOM:</Text>
          <Text style={styles.roomCodeValue}>{roomCode}</Text>
        </View>

        <View style={styles.statusPill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>
            {room.isAiBattle ? 'SOLO DUEL' : 'LIVE 1v1'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* OPPONENT COMBAT CARD */}
        <View style={styles.opponentCard}>
          <View style={styles.fighterRow}>
            <View
              style={[
                styles.avatarCircle,
                { borderColor: opponentAvatar.color },
              ]}
            >
              <Text style={styles.avatarEmoji}>{opponentAvatar.emoji}</Text>
            </View>
            <View style={styles.fighterInfo}>
              <View style={styles.fighterNameRow}>
                <Text style={styles.opponentNameText} numberOfLines={1}>
                  {opponent ? opponent.username : 'Searching...'}
                </Text>
                {opponent?.moveLocked && room.status === 'choosing' && (
                  <View style={styles.lockedBadgeMini}>
                    <Ionicons name="lock-closed" size={10} color="#00F0FF" />
                    <Text style={styles.lockedTextMini}>LOCKED IN</Text>
                  </View>
                )}
              </View>
              <HPBar
                currentHp={opponent ? opponent.hp : 100}
                playerName={opponent ? opponent.username : 'OPPONENT'}
                isOpponent={true}
                score={opponent ? opponent.score : 0}
              />
            </View>
          </View>
        </View>

        {/* Floating Taunt Reaction Bubble */}
        {activeTaunt && (
          <View style={styles.tauntBubble}>
            <Text style={styles.tauntSender}>{activeTaunt.sender}:</Text>
            <Text style={styles.tauntBody}>{activeTaunt.text}</Text>
          </View>
        )}

        {/* Floating Damage Number */}
        <DamageFloater
          damage={damageFloaterState.damage}
          type={damageFloaterState.type}
          visible={damageFloaterState.visible}
        />

        {/* Critical HP Warning Banner */}
        {isCritical && (
          <View style={styles.criticalWarning}>
            <Ionicons name="warning" size={16} color="#FFF" />
            <Text style={styles.criticalWarningText}>
              CRITICAL HP WARNING: ONE HIT FROM DEFEAT!
            </Text>
          </View>
        )}

        {/* CENTER ARENA (Round, Clash, 3-2-1 Reveal) */}
        <ClashArena
          status={room.status}
          round={room.round}
          revealCountdown={room.revealCountdown}
          userMove={you.selectedMove}
          opponentMove={opponentMoveRevealed}
          userLocked={you.moveLocked}
          opponentLocked={opponent ? opponent.moveLocked : false}
          roundWinner={room.currentRoundWinner}
          isHost={isHost}
          roundDamage={room.currentRoundDamage}
        />

        {/* YOUR COMBAT CARD */}
        <View style={styles.selfCard}>
          <View style={styles.fighterRow}>
            <View
              style={[
                styles.avatarCircle,
                { borderColor: userAvatar.color },
              ]}
            >
              <Text style={styles.avatarEmoji}>{userAvatar.emoji}</Text>
            </View>
            <View style={styles.fighterInfo}>
              <View style={styles.fighterNameRow}>
                <Text style={styles.selfNameText} numberOfLines={1}>
                  {you.username} (YOU)
                </Text>
                {you.moveLocked && room.status === 'choosing' && (
                  <View style={styles.lockedBadgeMiniSelf}>
                    <Ionicons name="lock-closed" size={10} color="#07080B" />
                    <Text style={styles.lockedTextMiniSelf}>LOCKED</Text>
                  </View>
                )}
              </View>
              <HPBar
                currentHp={you.hp}
                playerName={you.username}
                isOpponent={false}
                score={you.score}
              />
            </View>
          </View>
        </View>

        {/* 3 MOVE SELECTION BUTTONS: ROCK, PAPER, SCISSORS */}
        <View style={styles.dockContainer}>
          <Text style={styles.dockTitle}>
            {room.status === 'choosing'
              ? you.moveLocked
                ? 'CHOICE LOCKED IN • AWAITING OPPONENT'
                : 'CHOOSE YOUR MOVE'
              : room.status === 'revealing'
              ? 'HOLD ON! REVEALING...'
              : 'ROUND RESOLVED'}
          </Text>

          <View style={styles.moveCardsRow}>
            <MoveCard
              move="rock"
              isSelected={you.selectedMove === 'rock'}
              isDisabled={room.status !== 'choosing'}
              isLocked={you.moveLocked}
              onSelect={handleSelectMove}
            />
            <MoveCard
              move="paper"
              isSelected={you.selectedMove === 'paper'}
              isDisabled={room.status !== 'choosing'}
              isLocked={you.moveLocked}
              onSelect={handleSelectMove}
            />
            <MoveCard
              move="scissors"
              isSelected={you.selectedMove === 'scissors'}
              isDisabled={room.status !== 'choosing'}
              isLocked={you.moveLocked}
              onSelect={handleSelectMove}
            />
          </View>
        </View>

        {/* IN-BATTLE TAUNTS */}
        <TauntBar
          onSendTaunt={handleSendTaunt}
          disabled={room.status === 'revealing'}
        />

        {/* Round History Tracker */}
        {room.history.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyHeader}>PREVIOUS ROUNDS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.historyList}>
                {room.history.map((h, idx) => {
                  const youWon = h.winner === (isHost ? 'host' : 'guest');
                  const isDraw = h.winner === 'tie';
                  const yourMove = isHost ? h.hostMove : h.guestMove;
                  const oppMove = isHost ? h.guestMove : h.hostMove;
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.historyItem,
                        youWon
                          ? styles.historyWin
                          : isDraw
                          ? styles.historyDraw
                          : styles.historyLoss,
                      ]}
                    >
                      <Text style={styles.historyRoundText}>R{h.round}</Text>
                      <Text style={styles.historyMoveText}>
                        {yourMove === 'rock' ? '🪨' : yourMove === 'paper' ? '📜' : '⚔️'}
                        {' vs '}
                        {oppMove === 'rock' ? '🪨' : oppMove === 'paper' ? '📜' : '⚔️'}
                      </Text>
                      <Text
                        style={[
                          styles.historyOutcome,
                          {
                            color: youWon
                              ? '#FFD700'
                              : isDraw
                              ? '#00F0FF'
                              : '#FF2A55',
                          },
                        ]}
                      >
                        {youWon ? '+20' : isDraw ? 'DRAW' : '-20'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF2A55',
    zIndex: 90,
  },
  criticalBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 4,
    borderColor: '#FF2A55',
    zIndex: 88,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#161922',
  },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#121520',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222736',
  },
  exitText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '800',
  },
  roomCodeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roomCodeLabel: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  roomCodeValue: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  opponentCard: {
    backgroundColor: '#0E1017',
    borderWidth: 1,
    borderColor: '#1E2230',
    borderRadius: THEME.radius.lg,
    padding: 12,
    marginBottom: 8,
  },
  selfCard: {
    backgroundColor: '#0E1017',
    borderWidth: 1.5,
    borderColor: THEME.colors.goldBorder,
    borderRadius: THEME.radius.lg,
    padding: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  fighterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#161922',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  fighterInfo: {
    flex: 1,
  },
  fighterNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  opponentNameText: {
    color: '#00F0FF',
    fontSize: 13,
    fontWeight: '800',
  },
  selfNameText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '800',
  },
  lockedBadgeMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lockedTextMini: {
    color: '#00F0FF',
    fontSize: 8,
    fontWeight: '900',
  },
  lockedBadgeMiniSelf: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lockedTextMiniSelf: {
    color: '#07080B',
    fontSize: 8,
    fontWeight: '900',
  },
  dockContainer: {
    width: '100%',
    marginVertical: 10,
    alignItems: 'center',
  },
  dockTitle: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  moveCardsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  tauntBubble: {
    position: 'absolute',
    top: 90,
    alignSelf: 'center',
    zIndex: 95,
    backgroundColor: '#1E2230',
    borderWidth: 1.5,
    borderColor: '#FFD700',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
  },
  tauntSender: {
    color: THEME.colors.gold,
    fontSize: 11,
    fontWeight: '900',
  },
  tauntBody: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  criticalWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FF2A55',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  criticalWarningText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  historyContainer: {
    marginTop: 16,
  },
  historyHeader: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  historyList: {
    flexDirection: 'row',
    gap: 8,
  },
  historyItem: {
    backgroundColor: '#121520',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  historyWin: {
    borderColor: THEME.colors.goldBorder,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  historyLoss: {
    borderColor: '#FF2A55',
    backgroundColor: 'rgba(255, 42, 85, 0.05)',
  },
  historyDraw: {
    borderColor: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  historyRoundText: {
    color: THEME.colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
  },
  historyMoveText: {
    fontSize: 12,
    marginVertical: 2,
  },
  historyOutcome: {
    fontSize: 10,
    fontWeight: '900',
  },
});
