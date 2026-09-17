import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { THEME } from '../constants/theme';
import { UserProfile, RoomData } from '../types/game';
import { Button } from '../components/Button';
import { Multiplayer } from '../services/multiplayer';
import { SoundFX } from '../services/audio';

interface JoinRoomModalProps {
  visible: boolean;
  userProfile: UserProfile;
  initialCode?: string;
  onClose: () => void;
  onRoomJoined: (roomCode: string, room: RoomData) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  visible,
  userProfile,
  initialCode = '',
  onClose,
  onRoomJoined,
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCodeChange = (text: string) => {
    // Force uppercase, remove spaces, limit to 6 chars
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(cleaned);
    if (errorMessage) setErrorMessage(null);
  };

  const handlePaste = async () => {
    SoundFX.playTap();
    try {
      const text = await Clipboard.getStringAsync();
      // Extract 6 character code if URL or text
      const match = text.match(/[A-Z0-9]{6}/i);
      if (match) {
        handleCodeChange(match[0]);
      } else {
        handleCodeChange(text);
      }
    } catch {}
  };

  const handleJoin = async () => {
    if (!code || code.length !== 6) {
      setErrorMessage('ENTER A VALID 6-CHARACTER CODE');
      SoundFX.triggerHaptic('warning');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const guestData = {
      id: userProfile.id,
      username: userProfile.username,
      avatar: userProfile.avatar,
      hp: 100,
      selectedMove: null,
      moveLocked: false,
      score: 0,
      connected: true,
    };

    try {
      const result = await Multiplayer.joinRoom(code, guestData);

      if (result.success && result.room) {
        SoundFX.playVictoryFanfare();
        onRoomJoined(code, result.room);
      } else {
        SoundFX.triggerHaptic('error');
        setErrorMessage(result.error || 'ROOM NOT FOUND');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'FAILED TO CONNECT TO ARENA');
    } finally {
      setLoading(false);
    }
  };

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
              <Ionicons name="enter-outline" size={20} color="#00F0FF" />
              <Text style={styles.headerTitle}>JOIN ARENA ROOM</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Enter the 6-character room code provided by the host:
          </Text>

          {/* Room Code Input Box */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={code}
              onChangeText={handleCodeChange}
              placeholder="R7K2P9"
              placeholderTextColor="#475569"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
            />

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handlePaste}
              style={styles.pasteBtn}
            >
              <Ionicons name="clipboard-outline" size={16} color="#00F0FF" />
              <Text style={styles.pasteText}>PASTE</Text>
            </TouchableOpacity>
          </View>

          {/* Character slots visualizer */}
          <View style={styles.slotsRow}>
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const char = code[idx] || '';
              return (
                <View
                  key={idx}
                  style={[
                    styles.slotBox,
                    char ? styles.slotFilled : styles.slotEmpty,
                  ]}
                >
                  <Text style={styles.slotChar}>{char}</Text>
                </View>
              );
            })}
          </View>

          {/* Error Message */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#FF2A55" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Action Button: JOIN ROOM */}
          <View style={styles.actionContainer}>
            <Button
              title={loading ? 'CONNECTING...' : 'JOIN ROOM'}
              variant="cyber"
              size="lg"
              fullWidth
              loading={loading}
              disabled={code.length !== 6 || loading}
              onPress={handleJoin}
              icon={<MaterialCommunityIcons name="sword" size={20} color="#FFF" />}
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
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
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
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#161922',
    borderWidth: 1.5,
    borderColor: '#2A2E3D',
    borderRadius: THEME.radius.md,
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 4,
    paddingVertical: 8,
  },
  pasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  pasteText: {
    color: '#00F0FF',
    fontSize: 10,
    fontWeight: '800',
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 8,
    gap: 6,
  },
  slotBox: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#121520',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotFilled: {
    borderColor: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  slotEmpty: {
    borderColor: '#222736',
  },
  slotChar: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 42, 85, 0.12)',
    borderWidth: 1,
    borderColor: '#FF2A55',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    width: '100%',
    marginVertical: 10,
  },
  errorText: {
    color: '#FF2A55',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actionContainer: {
    width: '100%',
    marginTop: 12,
  },
});
