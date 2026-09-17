import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { THEME } from '../constants/theme';
import { UserProfile } from '../types/game';
import { Button } from '../components/Button';
import { getAvatarById } from '../constants/avatars';
import { SoundFX } from '../services/audio';

interface LeaderboardModalProps {
  visible: boolean;
  userProfile: UserProfile;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  visible,
  userProfile,
  onClose,
}) => {
  const avatar = getAvatarById(userProfile.avatar);
  const winRate =
    userProfile.totalBattles > 0
      ? Math.round((userProfile.wins / userProfile.totalBattles) * 100)
      : 0;

  const totalMoves =
    userProfile.rockCount + userProfile.paperCount + userProfile.scissorsCount || 1;
  const rockPct = Math.round((userProfile.rockCount / totalMoves) * 100);
  const paperPct = Math.round((userProfile.paperCount / totalMoves) * 100);
  const scissorsPct = Math.round((userProfile.scissorsCount / totalMoves) * 100);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleWithIcon}>
              <MaterialCommunityIcons name="podium-gold" size={20} color="#FFD700" />
              <Text style={styles.headerTitle}>CAREER COMBAT RECORD</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                SoundFX.playTap();
                onClose();
              }}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Fighter Card */}
            <View style={styles.fighterCard}>
              <View
                style={[
                  styles.avatarWrapper,
                  { borderColor: avatar.color },
                ]}
              >
                <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
              </View>
              <Text style={styles.usernameText}>{userProfile.username}</Text>
              <Text style={[styles.rankText, { color: avatar.color }]}>
                {userProfile.rankTitle}
              </Text>

              <View style={styles.mmrBadge}>
                <MaterialCommunityIcons name="trophy" size={14} color="#FFD700" />
                <Text style={styles.mmrValue}>
                  {userProfile.arenaRating} MMR
                </Text>
              </View>
            </View>

            {/* Combat Statistics Grid */}
            <Text style={styles.sectionTitle}>BATTLE METRICS</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{userProfile.totalBattles}</Text>
                <Text style={styles.statLbl}>TOTAL BATTLES</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: '#10B981' }]}>
                  {userProfile.wins}
                </Text>
                <Text style={styles.statLbl}>VICTORIES</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: '#FF2A55' }]}>
                  {userProfile.losses}
                </Text>
                <Text style={styles.statLbl}>DEFEATS</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: '#00F0FF' }]}>
                  {winRate}%
                </Text>
                <Text style={styles.statLbl}>WIN RATE</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: '#FFD700' }]}>
                  {userProfile.winStreak} 🔥
                </Text>
                <Text style={styles.statLbl}>CURRENT STREAK</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: '#FFE066' }]}>
                  {userProfile.bestWinStreak} ⚡
                </Text>
                <Text style={styles.statLbl}>BEST STREAK</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{userProfile.totalRoundsFought}</Text>
                <Text style={styles.statLbl}>ROUNDS FOUGHT</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: '#FF7700' }]}>
                  {userProfile.totalDamageDealt} HP
                </Text>
                <Text style={styles.statLbl}>DAMAGE DEALT</Text>
              </View>
            </View>

            {/* Move Usage Distribution */}
            <Text style={styles.sectionTitle}>TACTICAL MOVE AFFINITY</Text>
            <View style={styles.moveAffinityCard}>
              <View style={styles.affinityRow}>
                <Text style={styles.affinityLabel}>🪨 Rock: {rockPct}%</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${rockPct}%`, backgroundColor: '#F59E0B' },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.affinityRow}>
                <Text style={styles.affinityLabel}>📜 Paper: {paperPct}%</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${paperPct}%`, backgroundColor: '#00F0FF' },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.affinityRow}>
                <Text style={styles.affinityLabel}>⚔️ Scissors: {scissorsPct}%</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${scissorsPct}%`, backgroundColor: '#FF2A55' },
                    ]}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              title="RETURN TO ARENA"
              variant="gold"
              size="md"
              fullWidth
              onPress={() => {
                SoundFX.playTap();
                onClose();
              }}
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
    backgroundColor: THEME.colors.modalBackdrop,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '88%',
    backgroundColor: '#0E1017',
    borderRadius: THEME.radius.xl,
    borderWidth: 1.5,
    borderColor: '#2A2E3D',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2230',
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
  scrollArea: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  fighterCard: {
    backgroundColor: '#161922',
    borderWidth: 1.5,
    borderColor: THEME.colors.goldBorder,
    borderRadius: THEME.radius.lg,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0E1017',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  usernameText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: 8,
  },
  mmrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderWidth: 1,
    borderColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mmrValue: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '900',
  },
  sectionTitle: {
    color: THEME.colors.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    width: '23%',
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: '#222736',
    borderRadius: THEME.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  statVal: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  statLbl: {
    color: THEME.colors.textMuted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 2,
  },
  moveAffinityCard: {
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: '#2A2E3D',
    borderRadius: THEME.radius.lg,
    padding: 14,
    gap: 10,
  },
  affinityRow: {
    gap: 4,
  },
  affinityLabel: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  barTrack: {
    height: 8,
    backgroundColor: '#0E1017',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#1E2230',
  },
});
