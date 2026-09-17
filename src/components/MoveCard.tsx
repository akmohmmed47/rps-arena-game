import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Move } from '../types/game';
import { THEME } from '../constants/theme';
import { SoundFX } from '../services/audio';

interface MoveCardProps {
  move: Move;
  isSelected: boolean;
  isDisabled: boolean;
  isLocked: boolean;
  onSelect: (move: Move) => void;
  size?: 'normal' | 'compact' | 'mini';
}

const MOVE_DETAILS: Record<
  Move,
  {
    title: string;
    subtitle: string;
    icon: string;
    symbol: string;
    beats: string;
    gradient: [string, string];
    accentColor: string;
  }
> = {
  rock: {
    title: 'ROCK',
    subtitle: 'Crushes Blades',
    icon: 'hand-back-fist',
    symbol: '🪨',
    beats: 'Beats Scissors',
    gradient: ['#2A1D0E', '#140E06'],
    accentColor: '#F59E0B',
  },
  paper: {
    title: 'PAPER',
    subtitle: 'Smothers Titan',
    icon: 'hand-front-right',
    symbol: '📜',
    beats: 'Beats Rock',
    gradient: ['#0A2540', '#051321'],
    accentColor: '#00F0FF',
  },
  scissors: {
    title: 'SCISSORS',
    subtitle: 'Slices Aegis',
    icon: 'content-cut',
    symbol: '⚔️',
    beats: 'Beats Paper',
    gradient: ['#3A0E1A', '#1C060C'],
    accentColor: '#FF2A55',
  },
};

export const MoveCard: React.FC<MoveCardProps> = ({
  move,
  isSelected,
  isDisabled,
  isLocked,
  onSelect,
  size = 'normal',
}) => {
  const details = MOVE_DETAILS[move];

  const handlePress = () => {
    if (isDisabled || isLocked) return;
    SoundFX.playTap();
    onSelect(move);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      disabled={isDisabled || isLocked}
      style={[
        styles.touchable,
        isSelected && styles.selectedGlow,
        isDisabled && !isSelected && styles.dimmed,
      ]}
    >
      <LinearGradient
        colors={
          isSelected
            ? ['#3D2E0A', '#1C1605']
            : details.gradient
        }
        style={[
          styles.card,
          isSelected && styles.cardSelected,
          isDisabled && !isSelected && styles.cardDisabled,
        ]}
      >
        {/* Selected / Locked Badge */}
        {isSelected && (
          <View style={styles.lockedBadge}>
            <Ionicons name="lock-closed" size={10} color="#07080B" />
            <Text style={styles.lockedText}>LOCKED</Text>
          </View>
        )}

        {/* Move Icon */}
        <View
          style={[
            styles.iconWrapper,
            { borderColor: isSelected ? THEME.colors.gold : details.accentColor },
            isSelected && styles.iconWrapperSelected,
          ]}
        >
          <Text style={styles.symbolText}>{details.symbol}</Text>
        </View>

        {/* Move Name */}
        <Text
          style={[
            styles.title,
            isSelected ? styles.titleSelected : { color: details.accentColor },
          ]}
        >
          {details.title}
        </Text>

        {/* Tactical Subtitle */}
        <Text style={styles.subtitle}>{details.beats}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: THEME.radius.lg,
  },
  card: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: THEME.radius.lg,
    borderWidth: 1.5,
    borderColor: '#2A2E3D',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 125,
  },
  cardSelected: {
    borderColor: THEME.colors.gold,
    borderWidth: 2,
    backgroundColor: '#1C1605',
  },
  cardDisabled: {
    opacity: 0.45,
    borderColor: '#1C202C',
  },
  selectedGlow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
    elevation: 8,
  },
  dimmed: {
    opacity: 0.45,
  },
  lockedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: THEME.colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  lockedText: {
    color: '#07080B',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 8,
  },
  iconWrapperSelected: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
  },
  symbolText: {
    fontSize: 22,
  },
  title: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  titleSelected: {
    color: THEME.colors.gold,
  },
  subtitle: {
    fontSize: 9,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
