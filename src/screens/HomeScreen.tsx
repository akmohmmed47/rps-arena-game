import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { THEME } from '../constants/theme';
import { UserProfile } from '../types/game';
import { Button } from '../components/Button';
import { getAvatarById } from '../constants/avatars';
import { SoundFX } from '../services/audio';

interface HomeScreenProps {
  userProfile: UserProfile;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onVsAi: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
  onStats: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  onCreateRoom,
  onJoinRoom,
  onVsAi,
  onHowToPlay,
  onSettings,
  onStats,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const avatar = getAvatarById(userProfile.avatar);

  useEffect(() => {
    // Ambient breathing pulse for the main emblem
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 2200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.98, duration: 2200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const winRate =
    userProfile.totalBattles > 0
      ? Math.round((userProfile.wins / userProfile.totalBattles) * 100)
      : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Player Hero Banner */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onSettings}
        style={styles.playerBanner}
      >
        <LinearGradient
          colors={avatar.bgGradient}
          style={styles.bannerGradient}
        >
          <View
            style={[
              styles.avatarContainer,
              { borderColor: avatar.color },
            ]}
          >
            <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
          </View>
          <View style={styles.playerDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.playerName}>{userProfile.username}</Text>
              <Ionicons name="create-outline" size={14} color="#94A3B8" />
            </View>
            <Text style={[styles.playerTitle, { color: avatar.color }]}>
              {userProfile.rankTitle}
            </Text>
          </View>

          <View style={styles.ratingBadge}>
            <MaterialCommunityIcons name="trophy-variant" size={14} color="#FFD700" />
            <Text style={styles.ratingValue}>{userProfile.arenaRating}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Brand & Gaming Emblem */}
      <View style={styles.brandHero}>
        <Animated.View
          style={[
            styles.emblemWrapper,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <LinearGradient
            colors={['#FFE066', '#D4AF37', '#997300']}
            style={styles.emblemBorder}
          >
            <View style={styles.emblemInner}>
              <MaterialCommunityIcons name="sword-cross" size={42} color="#FFD700" />
            </View>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.brandTitle}>RPS BATTLE ARENA</Text>
        <Text style={styles.brandTagline}>EVERY CHOICE MATTERS.</Text>

        <View style={styles.elementRow}>
          <View style={styles.elementPill}>
            <Text style={styles.elementIcon}>🪨</Text>
            <Text style={styles.elementName}>ROCK</Text>
          </View>
          <Text style={styles.elementVs}>•</Text>
          <View style={styles.elementPill}>
            <Text style={styles.elementIcon}>📜</Text>
            <Text style={styles.elementName}>PAPER</Text>
          </View>
          <Text style={styles.elementVs}>•</Text>
          <View style={styles.elementPill}>
            <Text style={styles.elementIcon}>⚔️</Text>
            <Text style={styles.elementName}>SCISSORS</Text>
          </View>
        </View>
      </View>

      {/* Quick Player Career Stats Strip */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onStats}
        style={styles.statsStrip}
      >
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userProfile.totalBattles}</Text>
          <Text style={styles.statLabel}>BATTLES</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>
            {winRate}%
          </Text>
          <Text style={styles.statLabel}>WIN RATE</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#FFD700' }]}>
            {userProfile.winStreak} 🔥
          </Text>
          <Text style={styles.statLabel}>STREAK</Text>
        </View>
      </TouchableOpacity>

      {/* Primary Battle Actions */}
      <View style={styles.actionSection}>
        {/* CREATE ROOM BUTTON */}
        <Button
          title="CREATE ROOM"
          variant="gold"
          size="lg"
          fullWidth
          onPress={onCreateRoom}
          icon={
            <MaterialCommunityIcons
              name="plus-circle"
              size={22}
              color="#07080B"
            />
          }
          style={styles.primaryBtn}
        />

        {/* JOIN ROOM BUTTON */}
        <Button
          title="JOIN ROOM"
          variant="cyber"
          size="lg"
          fullWidth
          onPress={onJoinRoom}
          icon={<Ionicons name="enter-outline" size={22} color="#FFF" />}
          style={styles.primaryBtn}
        />

        {/* VS AI BOT PRACTICE */}
        <Button
          title="VS AI ARENA (SOLO DUEL)"
          variant="dark"
          size="md"
          fullWidth
          onPress={onVsAi}
          icon={
            <MaterialCommunityIcons name="robot" size={20} color="#FFD700" />
          }
          style={styles.secondaryBtn}
        />
      </View>

      {/* Secondary Navigation Buttons */}
      <View style={styles.secondaryRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onHowToPlay}
          style={styles.subBtn}
        >
          <Ionicons name="book-outline" size={16} color="#FFD700" />
          <Text style={styles.subBtnText}>HOW TO PLAY</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onStats}
          style={styles.subBtn}
        >
          <MaterialCommunityIcons name="podium" size={16} color="#FFD700" />
          <Text style={styles.subBtnText}>CAREER STATS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onSettings}
          style={styles.subBtn}
        >
          <Ionicons name="settings-outline" size={16} color="#FFD700" />
          <Text style={styles.subBtnText}>SETTINGS</Text>
        </TouchableOpacity>
      </View>

      {/* Real-Time Multiplayer Badge */}
      <View style={styles.cloudBadge}>
        <View style={styles.greenDot} />
        <Text style={styles.cloudBadgeText}>
          Real-Time 1v1 Sync Active (Firestore + Cloud Relay)
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  playerBanner: {
    width: '100%',
    borderRadius: THEME.radius.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#2A2E3D',
    marginBottom: 20,
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0E1017',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  playerDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  playerTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  ratingBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.goldBorder,
  },
  ratingValue: {
    color: THEME.colors.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  brandHero: {
    alignItems: 'center',
    marginVertical: 14,
  },
  emblemWrapper: {
    marginBottom: 16,
  },
  emblemBorder: {
    width: 86,
    height: 86,
    borderRadius: 43,
    padding: 3,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 8,
  },
  emblemInner: {
    flex: 1,
    borderRadius: 40,
    backgroundColor: '#07080B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
  },
  brandTagline: {
    color: THEME.colors.gold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3.5,
    marginTop: 6,
    marginBottom: 14,
    textAlign: 'center',
  },
  elementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  elementPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#121520',
    borderWidth: 1,
    borderColor: '#222736',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  elementIcon: {
    fontSize: 12,
  },
  elementName: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  elementVs: {
    color: THEME.colors.textMuted,
    fontSize: 10,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#0E1017',
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#1E2230',
    paddingVertical: 14,
    marginVertical: 18,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: THEME.colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#1E2230',
  },
  actionSection: {
    width: '100%',
    gap: 12,
    marginVertical: 8,
  },
  primaryBtn: {
    width: '100%',
  },
  secondaryBtn: {
    width: '100%',
    marginTop: 4,
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    gap: 8,
  },
  subBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0E1017',
    borderWidth: 1,
    borderColor: '#222736',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: THEME.radius.md,
  },
  subBtnText: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  cloudBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
