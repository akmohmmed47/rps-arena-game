import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface DamageFloaterProps {
  damage: number;
  type: 'damage_taken' | 'damage_dealt' | 'tie';
  visible: boolean;
}

export const DamageFloater: React.FC<DamageFloaterProps> = ({
  damage,
  type,
  visible,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
      opacity.setValue(1);
      scale.setValue(0.5);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -50,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.spring(scale, {
            toValue: 1.3,
            friction: 4,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(700),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [visible, damage]);

  if (!visible) return null;

  const isTie = type === 'tie';
  const isDealt = type === 'damage_dealt';

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <View
        style={[
          styles.badge,
          isTie
            ? styles.badgeTie
            : isDealt
            ? styles.badgeDealt
            : styles.badgeTaken,
        ]}
      >
        <Text
          style={[
            styles.text,
            isTie
              ? styles.textTie
              : isDealt
              ? styles.textDealt
              : styles.textTaken,
          ]}
        >
          {isTie ? 'CLASH!' : isDealt ? `+${damage} HIT` : `-${damage} HP`}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 99,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTaken: {
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    borderColor: '#FF2A55',
    shadowColor: '#FF2A55',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 8,
  },
  badgeDealt: {
    backgroundColor: 'rgba(245, 158, 11, 0.95)',
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 8,
  },
  badgeTie: {
    backgroundColor: 'rgba(56, 189, 248, 0.95)',
    borderColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 8,
  },
  text: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  textTaken: {
    color: '#FFFFFF',
  },
  textDealt: {
    color: '#07080B',
  },
  textTie: {
    color: '#07080B',
  },
});
