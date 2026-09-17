import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';
import { UserProfile, GameSettings } from '../types/game';
import { WARRIOR_AVATARS } from '../constants/avatars';
import { Button } from '../components/Button';
import { SoundFX } from '../services/audio';
import { saveStoredProfile, saveStoredSettings } from '../services/storage';

interface SettingsModalProps {
  visible: boolean;
  userProfile: UserProfile;
  settings: GameSettings;
  onClose: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
  onSettingsUpdated: (updated: GameSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  userProfile,
  settings,
  onClose,
  onProfileUpdated,
  onSettingsUpdated,
}) => {
  const [username, setUsername] = useState<string>(userProfile.username);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(userProfile.avatar);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.soundEnabled);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(settings.hapticsEnabled);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = async () => {
    SoundFX.playTap();
    const cleanUsername = username.trim().slice(0, 16) || 'Gladiator';

    const updatedProfile: UserProfile = {
      ...userProfile,
      username: cleanUsername,
      avatar: selectedAvatar,
    };

    const updatedSettings: GameSettings = {
      ...settings,
      soundEnabled,
      hapticsEnabled,
    };

    SoundFX.setSoundEnabled(soundEnabled);
    SoundFX.setHapticsEnabled(hapticsEnabled);

    await saveStoredProfile(updatedProfile);
    await saveStoredSettings(updatedSettings);

    onProfileUpdated(updatedProfile);
    onSettingsUpdated(updatedSettings);

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
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
              <Ionicons name="settings-sharp" size={20} color="#FFD700" />
              <Text style={styles.headerTitle}>WARRIOR SETTINGS</Text>
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
            {/* Player Identity Section */}
            <Text style={styles.sectionHeader}>GLADIATOR USERNAME (2-16 CHARACTERS)</Text>
            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={18} color="#FFD700" />
              <TextInput
                style={styles.textInput}
                value={username}
                onChangeText={setUsername}
                maxLength={16}
                placeholder="Enter Gladiator name"
                placeholderTextColor="#64748B"
              />
            </View>

            {/* Warrior Avatar Picker */}
            <Text style={styles.sectionHeader}>SELECT AVATAR ARCHETYPE</Text>
            <View style={styles.avatarGrid}>
              {WARRIOR_AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.id;
                return (
                  <TouchableOpacity
                    key={av.id}
                    activeOpacity={0.75}
                    onPress={() => {
                      SoundFX.playTap();
                      setSelectedAvatar(av.id);
                    }}
                    style={[
                      styles.avatarCard,
                      isSelected && styles.avatarCardSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.avatarEmojiCircle,
                        { borderColor: av.color },
                        isSelected && { backgroundColor: 'rgba(255, 215, 0, 0.2)' },
                      ]}
                    >
                      <Text style={styles.avatarEmoji}>{av.emoji}</Text>
                    </View>
                    <Text
                      style={[
                        styles.avatarName,
                        isSelected && { color: THEME.colors.gold },
                      ]}
                    >
                      {av.name}
                    </Text>
                    <Text style={styles.avatarTitle}>{av.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Audio & Haptic Controls */}
            <Text style={styles.sectionHeader}>AUDIO & FEEDBACK</Text>
            <View style={styles.switchGroup}>
              <View style={styles.switchRow}>
                <View style={styles.switchLabelCol}>
                  <Text style={styles.switchLabel}>Sound FX Synthesizer</Text>
                  <Text style={styles.switchSub}>
                    Arcade audio for clashes, strikes & victory fanfare
                  </Text>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={(val) => {
                    setSoundEnabled(val);
                    SoundFX.setSoundEnabled(val);
                  }}
                  trackColor={{ false: '#2A2E3D', true: THEME.colors.gold }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.switchDivider} />

              <View style={styles.switchRow}>
                <View style={styles.switchLabelCol}>
                  <Text style={styles.switchLabel}>Haptic Feedback</Text>
                  <Text style={styles.switchSub}>
                    Vibrations on move selection, damage hits and knockout
                  </Text>
                </View>
                <Switch
                  value={hapticsEnabled}
                  onValueChange={(val) => {
                    setHapticsEnabled(val);
                    SoundFX.setHapticsEnabled(val);
                  }}
                  trackColor={{ false: '#2A2E3D', true: THEME.colors.gold }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Multiplayer Engine Info */}
            <Text style={styles.sectionHeader}>REAL-TIME MULTIPLAYER ENGINE</Text>
            <View style={styles.engineCard}>
              <View style={styles.engineRow}>
                <View style={styles.greenPill} />
                <Text style={styles.engineText}>
                  Engine: Firebase Firestore & WebSocket PubSub
                </Text>
              </View>
              <Text style={styles.engineSub}>
                Real-time room synchronization is active across devices, browsers, and tabs.
              </Text>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <Button
              title={savedSuccess ? 'SETTINGS SAVED!' : 'SAVE & APPLY'}
              variant="gold"
              size="md"
              fullWidth
              onPress={handleSave}
              icon={
                <Ionicons
                  name={savedSuccess ? 'checkmark-circle' : 'save-outline'}
                  size={18}
                  color="#07080B"
                />
              }
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
  sectionHeader: {
    color: THEME.colors.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 10,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#161922',
    borderWidth: 1.5,
    borderColor: '#2A2E3D',
    borderRadius: THEME.radius.md,
    paddingHorizontal: 14,
    height: 48,
  },
  textInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  avatarCard: {
    width: '23%',
    backgroundColor: '#161922',
    borderWidth: 1.5,
    borderColor: '#2A2E3D',
    borderRadius: THEME.radius.md,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  avatarCardSelected: {
    borderColor: THEME.colors.gold,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
  },
  avatarEmojiCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0E1017',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarEmoji: {
    fontSize: 18,
  },
  avatarName: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  avatarTitle: {
    color: THEME.colors.textMuted,
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 1,
  },
  switchGroup: {
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: '#2A2E3D',
    borderRadius: THEME.radius.lg,
    padding: 14,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabelCol: {
    flex: 1,
    paddingRight: 10,
  },
  switchLabel: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  switchSub: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  switchDivider: {
    height: 1,
    backgroundColor: '#222736',
    marginVertical: 12,
  },
  engineCard: {
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: '#2A2E3D',
    borderRadius: THEME.radius.md,
    padding: 12,
  },
  engineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  greenPill: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  engineText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  engineSub: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#1E2230',
  },
});
