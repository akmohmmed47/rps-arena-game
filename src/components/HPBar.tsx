import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';
import { SoundFX } from '../services/audio';

interface HPBarProps {
  currentHp: number;
  maxHp?: number;
  playerName: string;
  isOpponent?: boolean;
  score?: number;
}

export const HPBar: React.FC<HPBarProps> = ({
  currentHp,
  maxHp = 100,
  playerName,
  isOpponent = false,
  score = 0,
}) => {
  const animatedWidth = useRef(new Animated.Value(currentHp)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const prevHpRef = useRef(currentHp);

  const percentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  const isCritical = currentHp <= 20 && currentHp > 0;

  useEffect(() => {
    // Detect damage impact
    if (currentHp < prevHpRef.current) {
      // Screen shake trigger
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 3, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }
    prevHpRef.current = currentHp;

    // Smooth HP bar transition
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 650,
      useNativeDriver: false,
    }).start();
  }, [currentHp, percentage]);

  // Critical HP Pulsing
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (isCritical) {
      SoundFX.playCriticalAlert();
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 450, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.95, duration: 450, useNativeDriver: true }),
        ])
      );
      loop.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => {
      loop && loop.stop();
    };
  }, [isCritical]);

  const getBarColors = (): [string, string] => {
    if (currentHp <= 20) return ['#FF2A55', '#B91C1C'];
    if (currentHp <= 50) return ['#F59E0B', '#D97706'];
    return ['#10B981', '#059669'];
  };

  const widthInterpolate = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: shakeAnim },
            { scale: pulseAnim },
          ],
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.nameContainer}>
          <Text style={[styles.name, isOpponent ? styles.nameOpponent : styles.nameSelf]}>
            {playerName}
          </Text>
          {isCritical && (
            <View style={styles.criticalBadge}>
              <Text style={styles.criticalText}>CRITICAL</Text>
            </View>
          )}
        </View>

        <View style={styles.hpValues}>
          <Text
            style={[
              styles.hpCurrent,
              isCritical ? styles.hpCritical : isOpponent ? styles.hpOpponent : styles.hpSelf,
            ]}
          >
            {Math.max(0, currentHp)}
          </Text>
          <Text style={styles.hpMax}> / {maxHp} HP</Text>
        </View>
      </View>

      {/* HP Track Bar */}
      <View style={[styles.track, isCritical && styles.trackCritical]}>
        <Animated.View style={[styles.fillWrapper, { width: widthInterpolate }]}>
          <LinearGradient
            colors={getBarColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fillGradient}
          />
        </Animated.View>
        <View style={styles.glossOverlay} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  nameSelf: {
    color: THEME.colors.gold,
  },
  nameOpponent: {
    color: THEME.colors.cyan,
  },
  criticalBadge: {
    backgroundColor: '#FF2A55',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  criticalText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  hpValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  hpCurrent: {
    fontSize: 15,
    fontWeight: '900',
  },
  hpSelf: {
    color: '#FFF',
  },
  hpOpponent: {
    color: '#FFF',
  },
  hpCritical: {
    color: '#FF2A55',
  },
  hpMax: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  track: {
    height: 12,
    backgroundColor: '#161922',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2E3D',
    position: 'relative',
  },
  trackCritical: {
    borderColor: '#FF2A55',
    shadowColor: '#FF2A55',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  fillWrapper: {
    height: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fillGradient: {
    flex: 1,
  },
  glossOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
});
