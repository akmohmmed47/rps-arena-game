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
import { AI_BOTS, AiBotProfile } from '../services/aiBot';
import { getAvatarById } from '../constants/avatars';
import { SoundFX } from '../services/audio';

interface AiSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectBot: (bot: AiBotProfile) => void;
}

export const AiSelectionModal: React.FC<AiSelectionModalProps> = ({
  visible,
  onClose,
  onSelectBot,
}) => {
  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'easy':
        return { text: 'RECRUIT', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'medium':
        return { text: 'VETERAN', color: '#00F0FF', bg: 'rgba(0, 240, 255, 0.15)' };
      case 'hard':
        return { text: 'WARLORD', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'grandmaster':
        return { text: 'GRANDMASTER', color: '#FF2A55', bg: 'rgba(255, 42, 85, 0.15)' };
      default:
        return { text: 'BOT', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.15)' };
    }
  };

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
              <MaterialCommunityIcons name="robot" size={20} color="#FFD700" />
              <Text style={styles.headerTitle}>SELECT AI OPPONENT</Text>
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

          <Text style={styles.subtitle}>
            Test your skills in instant 100 HP combat against specialized AI bots:
          </Text>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {AI_BOTS.map((bot) => {
              const avatar = getAvatarById(bot.avatar);
              const badge = getDifficultyBadge(bot.difficulty);
              return (
                <TouchableOpacity
                  key={bot.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    SoundFX.playTap();
                    onSelectBot(bot);
                  }}
                  style={styles.botCard}
                >
                  <View
                    style={[
                      styles.avatarCircle,
                      { borderColor: avatar.color },
                    ]}
                  >
                    <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
                  </View>

                  <View style={styles.botInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.botName}>{bot.name}</Text>
                      <View
                        style={[
                          styles.diffBadge,
                          { backgroundColor: badge.bg, borderColor: badge.color },
                        ]}
                      >
                        <Text style={[styles.diffText, { color: badge.color }]}>
                          {badge.text}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.botQuote}>"{bot.quote}"</Text>
                  </View>

                  <MaterialCommunityIcons
                    name="sword-cross"
                    size={20}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
    maxWidth: 440,
    maxHeight: '85%',
    backgroundColor: '#0E1017',
    borderRadius: THEME.radius.xl,
    borderWidth: 1.5,
    borderColor: '#2A2E3D',
    overflow: 'hidden',
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
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
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 14,
  },
  scrollArea: {
    width: '100%',
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 10,
  },
  botCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161922',
    borderWidth: 1.5,
    borderColor: '#2A2E3D',
    borderRadius: THEME.radius.lg,
    padding: 12,
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0E1017',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  botInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  botName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  diffBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  botQuote: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
  },
});
