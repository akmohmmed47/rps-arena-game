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
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';
import { Button } from '../components/Button';
import { SoundFX } from '../services/audio';

interface HowToPlayModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ visible, onClose }) => {
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
              <MaterialCommunityIcons name="book-open-page-variant" size={20} color="#FFD700" />
              <Text style={styles.headerTitle}>ARENA CODEX & RULES</Text>
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
            {/* The Trinity of Combat */}
            <Text style={styles.sectionTitle}>THE COMBAT TRIANGLE</Text>
            <View style={styles.triangleCard}>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleSymbol}>🪨</Text>
                <View style={styles.ruleTextCol}>
                  <Text style={[styles.ruleTitle, { color: '#F59E0B' }]}>
                    ROCK (THE TITAN)
                  </Text>
                  <Text style={styles.ruleDesc}>
                    Crushes Dual Blades (Scissors) with pure brute force.
                  </Text>
                </View>
              </View>

              <View style={styles.ruleDivider} />

              <View style={styles.ruleItem}>
                <Text style={styles.ruleSymbol}>📜</Text>
                <View style={styles.ruleTextCol}>
                  <Text style={[styles.ruleTitle, { color: '#00F0FF' }]}>
                    PAPER (MYSTIC AEGIS)
                  </Text>
                  <Text style={styles.ruleDesc}>
                    Smothers and envelopes Rock, redirecting kinetic strikes.
                  </Text>
                </View>
              </View>

              <View style={styles.ruleDivider} />

              <View style={styles.ruleItem}>
                <Text style={styles.ruleSymbol}>⚔️</Text>
                <View style={styles.ruleTextCol}>
                  <Text style={[styles.ruleTitle, { color: '#FF2A55' }]}>
                    SCISSORS (DUAL BLADES)
                  </Text>
                  <Text style={styles.ruleDesc}>
                    Slices through parchment and silk (Paper) cleanly.
                  </Text>
                </View>
              </View>
            </View>

            {/* Health & Damage Mechanics */}
            <Text style={styles.sectionTitle}>BATTLE MECHANICS</Text>
            <View style={styles.mechanicsGrid}>
              <View style={styles.mechanicBox}>
                <MaterialCommunityIcons name="heart-pulse" size={24} color="#10B981" />
                <Text style={styles.mechanicValue}>100 HP</Text>
                <Text style={styles.mechanicLabel}>Starting Health</Text>
                <Text style={styles.mechanicSub}>First fighter to 0 HP falls</Text>
              </View>

              <View style={styles.mechanicBox}>
                <MaterialCommunityIcons name="sword" size={24} color="#FFD700" />
                <Text style={styles.mechanicValue}>-20 HP</Text>
                <Text style={styles.mechanicLabel}>Round Strike</Text>
                <Text style={styles.mechanicSub}>Dealt upon winning round</Text>
              </View>

              <View style={styles.mechanicBox}>
                <MaterialCommunityIcons name="shield-outline" size={24} color="#00F0FF" />
                <Text style={styles.mechanicValue}>0 HP</Text>
                <Text style={styles.mechanicLabel}>Clash / Tie</Text>
                <Text style={styles.mechanicSub}>Simultaneous move = draw</Text>
              </View>

              <View style={styles.mechanicBox}>
                <MaterialCommunityIcons name="alert-octagon" size={24} color="#FF2A55" />
                <Text style={styles.mechanicValue}>≤ 20 HP</Text>
                <Text style={styles.mechanicLabel}>Critical State</Text>
                <Text style={styles.mechanicSub}>One strike from knockout</Text>
              </View>
            </View>

            {/* Turn Flow */}
            <Text style={styles.sectionTitle}>ROUND FLOW</Text>
            <View style={styles.stepsCard}>
              <View style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepHeading}>Secret Lock-In</Text>
                  <Text style={styles.stepBody}>
                    Both players choose Rock, Paper, or Scissors simultaneously in secret. Choices are never revealed early.
                  </Text>
                </View>
              </View>

              <View style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepHeading}>3-2-1 Reveal</Text>
                  <Text style={styles.stepBody}>
                    Dramatic countdown counts down and reveals both gladiators' cards in the clash zone.
                  </Text>
                </View>
              </View>

              <View style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepHeading}>Damage & Resolution</Text>
                  <Text style={styles.stepBody}>
                    HP drops by 20. If neither reaches 0, the next round commences automatically.
                  </Text>
                </View>
              </View>
            </View>

            {/* Pro Tips */}
            <Text style={styles.sectionTitle}>GLADIATOR TACTICS</Text>
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>💡 Psychological Warfare</Text>
              <Text style={styles.tipText}>
                Humans naturally hesitate to repeat a losing move. If an opponent just lost with Scissors, they often switch to Rock or Paper!
              </Text>
            </View>
          </ScrollView>

          {/* Close Button */}
          <View style={styles.footer}>
            <Button
              title="UNDERSTOOD, TO BATTLE!"
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
  sectionTitle: {
    color: THEME.colors.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 10,
  },
  triangleCard: {
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: '#2A2E3D',
    borderRadius: THEME.radius.lg,
    padding: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  ruleSymbol: {
    fontSize: 26,
  },
  ruleTextCol: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  ruleDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  ruleDivider: {
    height: 1,
    backgroundColor: '#222736',
    marginVertical: 4,
  },
  mechanicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mechanicBox: {
    width: '48%',
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: '#2A2E3D',
    borderRadius: THEME.radius.md,
    padding: 12,
    alignItems: 'center',
  },
  mechanicValue: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 6,
  },
  mechanicLabel: {
    color: THEME.colors.gold,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  mechanicSub: {
    color: THEME.colors.textMuted,
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  stepsCard: {
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: '#2A2E3D',
    borderRadius: THEME.radius.lg,
    padding: 12,
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    color: '#07080B',
    fontSize: 12,
    fontWeight: '900',
  },
  stepContent: {
    flex: 1,
  },
  stepHeading: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  stepBody: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  tipCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderWidth: 1,
    borderColor: THEME.colors.goldBorder,
    borderRadius: THEME.radius.md,
    padding: 12,
  },
  tipTitle: {
    color: THEME.colors.gold,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  tipText: {
    color: '#FFF',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#1E2230',
  },
});
