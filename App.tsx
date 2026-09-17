import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { THEME } from './src/constants/theme';
import { UserProfile, GameSettings, RoomData } from './src/types/game';
import {
  getStoredProfile,
  getStoredSettings,
  saveStoredProfile,
} from './src/services/storage';
import { SoundFX } from './src/services/audio';
import { Multiplayer } from './src/services/multiplayer';
import { createAiPlayerData, AiBotProfile } from './src/services/aiBot';

import { Header } from './src/components/Header';
import { HomeScreen } from './src/screens/HomeScreen';
import { CreateRoomModal } from './src/screens/CreateRoomModal';
import { JoinRoomModal } from './src/screens/JoinRoomModal';
import { BattleScreen } from './src/screens/BattleScreen';
import { GameOverModal } from './src/screens/GameOverModal';
import { HowToPlayModal } from './src/screens/HowToPlayModal';
import { SettingsModal } from './src/screens/SettingsModal';
import { LeaderboardModal } from './src/screens/LeaderboardModal';
import { AiSelectionModal } from './src/screens/AiSelectionModal';

export default function App() {
  // Preload vector icon fonts for web and native
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    hapticsEnabled: true,
    bgmEnabled: true,
  });

  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<'home' | 'battle'>('home');
  const [activeRoomCode, setActiveRoomCode] = useState<string>('');
  const [activeRoom, setActiveRoom] = useState<RoomData | null>(null);

  // Modal Visibility
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [joinModalVisible, setJoinModalVisible] = useState<boolean>(false);
  const [initialJoinCode, setInitialJoinCode] = useState<string>('');
  const [howToPlayVisible, setHowToPlayVisible] = useState<boolean>(false);
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const [statsVisible, setStatsVisible] = useState<boolean>(false);
  const [aiSelectVisible, setAiSelectVisible] = useState<boolean>(false);
  const [gameOverRoom, setGameOverRoom] = useState<RoomData | null>(null);

  // Initialize storage & settings
  useEffect(() => {
    async function loadData() {
      try {
        const profile = await getStoredProfile();
        const storedSettings = await getStoredSettings();
        setUserProfile(profile);
        setSettings(storedSettings);
        SoundFX.setSoundEnabled(storedSettings.soundEnabled);
        SoundFX.setHapticsEnabled(storedSettings.hapticsEnabled);
        Multiplayer.setPlayerId(profile.id);

        // Check for URL query param `?room=CODE`
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const roomParam = urlParams.get('room') || urlParams.get('join');
          if (roomParam && roomParam.length === 6) {
            setInitialJoinCode(roomParam.toUpperCase());
            setJoinModalVisible(true);
          }
        } else {
          Linking.getInitialURL().then((url) => {
            if (url) {
              const match = url.match(/[?&]room=([A-Za-z0-9]{6})/);
              if (match && match[1]) {
                setInitialJoinCode(match[1].toUpperCase());
                setJoinModalVisible(true);
              }
            }
          });
        }
      } catch (e) {
        console.warn('Initialization error:', e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleToggleSound = () => {
    const nextVal = !settings.soundEnabled;
    const updated = { ...settings, soundEnabled: nextVal };
    setSettings(updated);
    SoundFX.setSoundEnabled(nextVal);
  };

  // Starting 1v1 multiplayer battle
  const handleRoomReady = (roomCode: string, room: RoomData) => {
    setActiveRoomCode(roomCode);
    setActiveRoom(room);
    setCreateModalVisible(false);
    setJoinModalVisible(false);
    setCurrentScreen('battle');
  };

  // Starting AI Solo Practice Battle
  const handleStartAiBattle = (bot: AiBotProfile) => {
    if (!userProfile) return;

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

    const aiData = createAiPlayerData(bot);
    const roomCode = Multiplayer.createAiBattle(
      hostData,
      aiData,
      bot.difficulty,
      bot.selectMove
    );

    const initialAiRoom: RoomData = {
      roomCode,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      status: 'choosing',
      round: 1,
      host: hostData,
      guest: aiData,
      currentRoundWinner: null,
      currentRoundDamage: 0,
      revealCountdown: 3,
      history: [],
      winnerId: null,
      isAiBattle: true,
      aiDifficulty: bot.difficulty,
    };

    setActiveRoomCode(roomCode);
    setActiveRoom(initialAiRoom);
    setAiSelectVisible(false);
    setCreateModalVisible(false);
    setCurrentScreen('battle');
  };

  const handleLeaveBattle = () => {
    SoundFX.playTap();
    if (activeRoomCode) {
      Multiplayer.leaveRoom(activeRoomCode);
    }
    setActiveRoomCode('');
    setActiveRoom(null);
    setGameOverRoom(null);
    setCurrentScreen('home');
  };

  const handleRematchStarted = (resetRoom: RoomData) => {
    setActiveRoom(resetRoom);
    setGameOverRoom(null);
    setCurrentScreen('battle');
  };

  if (!fontsLoaded || loading || !userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.appContainer} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#07080B" />

        {/* Global Header */}
        <Header
          userProfile={userProfile}
          soundEnabled={settings.soundEnabled}
          onToggleSound={handleToggleSound}
          onOpenSettings={() => setSettingsVisible(true)}
          onOpenStats={() => setStatsVisible(true)}
          showBack={currentScreen === 'battle'}
          onBack={handleLeaveBattle}
          title={currentScreen === 'battle' ? 'ARENA COMBAT' : undefined}
        />

        {/* Screen 1: Home Screen */}
        {currentScreen === 'home' && (
          <HomeScreen
            userProfile={userProfile}
            onCreateRoom={() => setCreateModalVisible(true)}
            onJoinRoom={() => {
              setInitialJoinCode('');
              setJoinModalVisible(true);
            }}
            onVsAi={() => setAiSelectVisible(true)}
            onHowToPlay={() => setHowToPlayVisible(true)}
            onSettings={() => setSettingsVisible(true)}
            onStats={() => setStatsVisible(true)}
          />
        )}

        {/* Screen 2: Battle Screen */}
        {currentScreen === 'battle' && activeRoom && (
          <BattleScreen
            roomCode={activeRoomCode}
            initialRoom={activeRoom}
            userProfile={userProfile}
            onGameOver={(room) => setGameOverRoom(room)}
            onLeaveBattle={handleLeaveBattle}
          />
        )}

        {/* Modals */}
        <CreateRoomModal
          visible={createModalVisible}
          userProfile={userProfile}
          onClose={() => setCreateModalVisible(false)}
          onRoomReady={handleRoomReady}
          onStartBotFight={() => {
            setCreateModalVisible(false);
            setAiSelectVisible(true);
          }}
        />

        <JoinRoomModal
          visible={joinModalVisible}
          userProfile={userProfile}
          initialCode={initialJoinCode}
          onClose={() => setJoinModalVisible(false)}
          onRoomJoined={handleRoomReady}
        />

        <AiSelectionModal
          visible={aiSelectVisible}
          onClose={() => setAiSelectVisible(false)}
          onSelectBot={handleStartAiBattle}
        />

        {gameOverRoom && (
          <GameOverModal
            visible={!!gameOverRoom}
            room={gameOverRoom}
            userProfile={userProfile}
            onProfileUpdated={(updated) => setUserProfile(updated)}
            onRematchStarted={handleRematchStarted}
            onReturnHome={handleLeaveBattle}
          />
        )}

        <HowToPlayModal
          visible={howToPlayVisible}
          onClose={() => setHowToPlayVisible(false)}
        />

        <SettingsModal
          visible={settingsVisible}
          userProfile={userProfile}
          settings={settings}
          onClose={() => setSettingsVisible(false)}
          onProfileUpdated={(updated) => setUserProfile(updated)}
          onSettingsUpdated={(updated) => setSettings(updated)}
        />

        <LeaderboardModal
          visible={statsVisible}
          userProfile={userProfile}
          onClose={() => setStatsVisible(false)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#07080B',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
