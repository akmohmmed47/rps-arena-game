import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { THEME } from '../constants/theme';
import { SoundFX } from '../services/audio';

interface TauntBarProps {
  onSendTaunt: (text: string) => void;
  disabled?: boolean;
}

const TAUNT_OPTIONS = [
  { label: '🔥 Fire', text: '🔥 FIRE!' },
  { label: '⚔️ Clash', text: '⚔️ EN GUARDE!' },
  { label: '🛡️ Shield', text: '🛡️ IMPENETRABLE!' },
  { label: '😎 GG', text: '😎 GOOD GAME' },
  { label: '😱 Nani?!', text: '😱 NANI?!' },
  { label: '👑 Crown', text: '👑 BOW DOWN' },
];

export const TauntBar: React.FC<TauntBarProps> = ({ onSendTaunt, disabled }) => {
  const handleTaunt = (text: string) => {
    if (disabled) return;
    SoundFX.playTap();
    onSendTaunt(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerLabel}>BATTLE EMOTES:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TAUNT_OPTIONS.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            activeOpacity={0.7}
            disabled={disabled}
            onPress={() => handleTaunt(item.text)}
            style={[styles.tauntChip, disabled && styles.chipDisabled]}
          >
            <Text style={styles.tauntText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#1A1E2B',
  },
  headerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  scrollContent: {
    gap: 8,
    paddingHorizontal: 4,
  },
  tauntChip: {
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: '#2A2E3D',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  tauntText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
