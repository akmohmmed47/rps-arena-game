import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Platform,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';
import { UserProfile, RoomData } from '../types/game';
import { Button } from '../components/Button';
import { Multiplayer } from '../services/multiplayer';
import { SoundFX } from '../services/audio';
import { getAvatarById } from '../constants/avatars';

interface CreateRoomModalProps {
  visible: boolean;
  userProfile: UserProfile;
  onClose: () => void;
  onRoomReady: (roomCode: string, initialRoom: RoomData) => void;
  onStartBotFight: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  visible,
  userProfile,
  onClose,
  onRoomReady,
  onStartBotFight,
}) => {
  const [roomCode, setRoomCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(true);
  const radarAnim = useRef(new Animated.Value(1)).current;
  const radarOpacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    let unsub: (() => void) | null = null;

    if (visible) {
      setIsCreating(true);
      setCopied(false);

      // Create host player structure
      const hostData = {
        id: userProfile.id,
        username: userProfile.username,
        avatar: userProfile.avatar,
        hp: 100,
        selectedMove: null,
        moveLocked: false,
        score: 0,
        connected: true,
      };

      // Create room in multiplayer service
      Multiplayer.createRoom(hostData).then((code) => {
        setRoomCode(code);
        setIsCreating(false);

        // Listen for opponent to join
        unsub = Multiplayer.subscribeToRoom(code, (room) => {
          if (room.guest) {
            // Opponent joined!
            SoundFX.playVictoryFanfare();
            onRoomReady(code, room);
          }
        });
      });

      // Animate pulsing radar
      const loop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(radarAnim, { toValue: 1.4, duration: 1500, useNativeDriver: true }),
            Animated.timing(radarAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(radarOpacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
            Animated.timing(radarOpacity, { toValue: 0.8, duration: 0, useNativeDriver: true }),
          ]),
        ])
      );
      loop.start();

      return () => {
        loop.stop();
        if (unsub) unsub();
      };
    }
  }, [visible]);

  const handleCopyCode = async () => {
    SoundFX.playTap();
    await Clipboard.setStringAsync(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareRoom = async () => {
    SoundFX.playTap();
    let shareUrl = '';
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const origin = window.location.origin;
      shareUrl = `${origin}?room=${roomCode}`;
    } else {
      shareUrl = `https://rps-battle-arena.vercel.app?room=${roomCode}`;
    }

    const message = `⚔️ Join my RPS Battle Arena match! Room Code: ${roomCode}\n${shareUrl}`;

    try {
      if (Platform.OS === 'web' && navigator.share) {
        await navigator.share({
          title: 'RPS Battle Arena Challenge',
          text: message,
          url: shareUrl,
        });
      } else {
        await Share.share({
          message,
          title: 'RPS Battle Arena Challenge',
        });
      }
    } catch {
      // Fallback to clipboard
      await handleCopyCode();
    }
  };

  const handleOpenTestTab = () => {
    SoundFX.playTap();
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const origin = window.location.origin;
      const testUrl = `${origin}?room=${roomCode}`;
      window.open(testUrl, '_blank');
    }
  };

  const avatar = getAvatarById(userProfile.avatar);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleWithIcon}>
              <MaterialCommunityIcons name="sword" size={20} color="#FFD700" />
              <Text style={styles.headerTitle}>PRIVATE BATTLE ROOM</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Room Code Display */}
          <View style={styles.codeSection}>
            <Text style={styles.codeLabel}>SHARE THIS 6-CHARACTER CODE</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCopyCode}
              style={styles.codeBox}
            >
              <LinearGradient
                colors={['#1E2230', '#121520']}
                style={styles.codeBoxGradient}
              >
                <Text style={styles.roomCodeText}>
                  {isCreating ? 'GENERATING...' : roomCode}
                </Text>
                <View style={styles.copyBadge}>
                  <Ionicons
                    name={copied ? 'checkmark' : 'copy-outline'}
                    size={14}
                    color={copied ? '#10B981' : '#FFD700'}
                  />
                  <Text
                    style={[
                      styles.copyBadgeText,
                      copied && { color: '#10B981' },
                    ]}
                  >
                    {copied ? 'COPIED!' : 'TAP TO COPY'}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Action Buttons: COPY CODE, SHARE ROOM */}
          <View style={styles.btnRow}>
            <Button
              title={copied ? 'CODE COPIED!' : 'COPY CODE'}
              variant="gold"
              size="md"
              onPress={handleCopyCode}
              icon={<Ionicons name="copy-outline" size={16} color="#07080B" />}
              style={styles.flexBtn}
            />
            <Button
              title="SHARE ROOM"
              variant="cyber"
              size="md"
              onPress={handleShareRoom}
              icon={<Ionicons name="share-social-outline" size={16} color="#FFF" />}
              style={styles.flexBtn}
            />
          </View>

          {/* Quick same-device test button on web */}
          {Platform.OS === 'web' && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleOpenTestTab}
              style={styles.testTabBtn}
            >
              <Ionicons name="open-outline" size={15} color="#00F0FF" />
              <Text style={styles.testTabText}>
                Open Test Player in New Tab (Instant 1v1 Test)
              </Text>
            </TouchableOpacity>
          )}

          {/* Radar & Waiting Status */}
          <View style={styles.waitingArena}>
            <View style={styles.radarWrapper}>
              <Animated.View
                style={[
                  styles.radarPulse,
                  {
                    transform: [{ scale: radarAnim }],
                    opacity: radarOpacity,
                  },
                ]}
              />
              <View style={styles.radarCenter}>
                <MaterialCommunityIcons
                  name="radar"
                  size={32}
                  color="#FFD700"
                />
              </View>
            </View>

            <Text style={styles.waitingMainText}>WAITING FOR OPPONENT…</Text>
            <Text style={styles.waitingSubText}>
              Battle will start automatically once challenger enters room code.
            </Text>
          </View>

          {/* Matchup Slots Preview */}
          <View style={styles.slotsRow}>
            {/* Host Slot */}
            <View style={styles.slotCard}>
              <View
                style={[
                  styles.slotAvatar,
                  { borderColor: avatar.color },
                ]}
              >
                <Text style={styles.slotEmoji}>{avatar.emoji}</Text>
              </View>
              <Text style={styles.slotName} numberOfLines={1}>
                {userProfile.username}
              </Text>
              <View style={styles.readyBadge}>
                <Text style={styles.readyText}>HOST (READY)</Text>
              </View>
            </View>

            <Text style={styles.vsSlot}>VS</Text>

            {/* Challenger Slot (Empty/Searching) */}
            <View style={[styles.slotCard, styles.slotEmpty]}>
              <View style={styles.slotAvatarEmpty}>
                <Ionicons name="person-add-outline" size={20} color="#64748B" />
              </View>
              <Text style={styles.slotNameEmpty}>Awaiting Player</Text>
              <View style={styles.searchingBadge}>
                <Text style={styles.searchingText}>SEARCHING...</Text>
              </View>
            </View>
          </View>

          {/* Solo Bot Option */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onStartBotFight}
            style={styles.botFallbackBtn}
          >
            <MaterialCommunityIcons name="robot" size={16} color="#94A3B8" />
            <Text style={styles.botFallbackText}>
              Tired of waiting? Fight AI Gladiator instead
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: THEME.colors.modalBackdrop,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0E1017',
    borderRadius: THEME.radius.xl,
    borderWidth: 1.5,
    borderColor: '#2A2E3D',
    padding: 22,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  closeBtn: {
    padding: 4,
  },
  codeSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
  },
  codeLabel: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  codeBox: {
    width: '100%',
    borderRadius: THEME.radius.lg,
    overflow: 'hidden',
  },
  codeBoxGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: THEME.colors.goldBorder,
    borderRadius: THEME.radius.lg,
  },
  roomCodeText: {
    color: THEME.colors.gold,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 8,
  },
  copyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  copyBadgeText: {
    color: THEME.colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginBottom: 10,
  },
  flexBtn: {
    flex: 1,
  },
  testTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginVertical: 6,
    width: '100%',
    justifyContent: 'center',
  },
  testTabText: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '700',
  },
  waitingArena: {
    alignItems: 'center',
    marginVertical: 14,
  },
  radarWrapper: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  radarPulse: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: THEME.colors.gold,
  },
  radarCenter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#161922',
    borderWidth: 1.5,
    borderColor: THEME.colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingMainText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  waitingSubText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 300,
  },
  slotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#121520',
    borderWidth: 1,
    borderColor: '#1E2230',
    borderRadius: THEME.radius.lg,
    padding: 12,
    marginVertical: 10,
  },
  slotCard: {
    alignItems: 'center',
    flex: 1,
  },
  slotEmpty: {
    opacity: 0.7,
  },
  slotAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1C202C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 6,
  },
  slotAvatarEmpty: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#161922',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2E3D',
    borderStyle: 'dashed',
    marginBottom: 6,
  },
  slotEmoji: {
    fontSize: 20,
  },
  slotName: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  slotNameEmpty: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  readyBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  readyText: {
    color: '#10B981',
    fontSize: 8,
    fontWeight: '900',
  },
  searchingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  searchingText: {
    color: '#F59E0B',
    fontSize: 8,
    fontWeight: '900',
  },
  vsSlot: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    marginHorizontal: 8,
  },
  botFallbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 6,
  },
  botFallbackText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
