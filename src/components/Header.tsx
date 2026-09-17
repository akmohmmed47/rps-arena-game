import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { THEME } from '../constants/theme';
import { UserProfile } from '../types/game';
import { getAvatarById } from '../constants/avatars';
import { SoundFX } from '../services/audio';

interface HeaderProps {
  userProfile: UserProfile | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings?: () => void;
  onOpenStats?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenStats,
  showBack = false,
  onBack,
  title,
}) => {
  const avatar = userProfile ? getAvatarById(userProfile.avatar) : null;

  return (
    <View style={styles.header}>
      {/* Left: Back button or Player Profile Tag */}
      {showBack ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.iconButton}
        >
          <Ionicons name="arrow-back" size={20} color="#FFD700" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onOpenStats}
          style={styles.profileTag}
        >
          <View
            style={[
              styles.avatarMini,
              { borderColor: avatar?.color || THEME.colors.gold },
            ]}
          >
            <Text style={styles.avatarEmoji}>{avatar?.emoji || '👑'}</Text>
          </View>
          <View>
            <Text style={styles.usernameText} numberOfLines={1}>
              {userProfile?.username || 'Gladiator'}
            </Text>
            <View style={styles.ratingRow}>
              <MaterialCommunityIcons name="trophy" size={10} color="#FFD700" />
              <Text style={styles.ratingText}>
                {userProfile?.arenaRating || 1000} MMR
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Middle: Screen Title or Brand Tag */}
      {title && (
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{title}</Text>
        </View>
      )}

      {/* Right: Quick Controls */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onToggleSound}
          style={styles.iconButton}
        >
          <Ionicons
            name={soundEnabled ? 'volume-high' : 'volume-mute'}
            size={20}
            color={soundEnabled ? '#FFD700' : THEME.colors.textMuted}
          />
        </TouchableOpacity>

        {onOpenSettings && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onOpenSettings}
            style={styles.iconButton}
          >
            <Ionicons name="settings-sharp" size={19} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#161922',
    backgroundColor: '#07080B',
  },
  profileTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#121520',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222736',
  },
  avatarMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1C202C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  avatarEmoji: {
    fontSize: 14,
  },
  usernameText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    maxWidth: 110,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    color: THEME.colors.gold,
    fontSize: 10,
    fontWeight: '700',
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  titleText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#121520',
    borderWidth: 1,
    borderColor: '#222736',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
