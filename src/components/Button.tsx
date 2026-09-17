import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';
import { SoundFX } from '../services/audio';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'gold' | 'cyber' | 'crimson' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'gold',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    SoundFX.playTap();
    onPress();
  };

  const getGradientColors = (): [string, string, ...string[]] => {
    if (disabled) return ['#2A2E3D', '#1A1C24'];
    switch (variant) {
      case 'gold':
        return ['#FFE066', '#FFD700', '#D4AF37'];
      case 'cyber':
        return ['#38BDF8', '#0EA5E9', '#0284C7'];
      case 'crimson':
        return ['#FF4D6D', '#EF4444', '#B91C1C'];
      case 'dark':
        return ['#222736', '#161922', '#0E1017'];
      case 'ghost':
        return ['transparent', 'transparent'];
    }
  };

  const sizeStyles = {
    sm: { height: 38, paddingHorizontal: 14, fontSize: 12 },
    md: { height: 48, paddingHorizontal: 20, fontSize: 14 },
    lg: { height: 56, paddingHorizontal: 28, fontSize: 16 },
    xl: { height: 64, paddingHorizontal: 32, fontSize: 18 },
  }[size];

  const isGhost = variant === 'ghost';

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.touchable,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          { height: sizeStyles.height, paddingHorizontal: sizeStyles.paddingHorizontal },
          variant === 'gold' && !disabled && styles.goldShadow,
          variant === 'crimson' && !disabled && styles.crimsonShadow,
          variant === 'cyber' && !disabled && styles.cyberShadow,
          variant === 'dark' && styles.darkBorder,
          isGhost && styles.ghostBorder,
          disabled && styles.disabledBorder,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'gold' ? '#07080B' : '#FFFFFF'}
            size="small"
          />
        ) : (
          <View style={styles.contentRow}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text
              style={[
                styles.text,
                { fontSize: sizeStyles.fontSize },
                variant === 'gold' && !disabled ? styles.textDark : styles.textLight,
                disabled && styles.textDisabled,
                isGhost && styles.textGold,
                textStyle,
              ]}
            >
              {title}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: THEME.radius.md,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    borderRadius: THEME.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  textDark: {
    color: '#07080B',
  },
  textLight: {
    color: '#FFFFFF',
  },
  textGold: {
    color: THEME.colors.gold,
  },
  textDisabled: {
    color: THEME.colors.textMuted,
  },
  goldShadow: {
    borderColor: '#FFE77A',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  crimsonShadow: {
    borderColor: '#FFA8B8',
    shadowColor: '#FF2A55',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  cyberShadow: {
    borderColor: '#7DD3FC',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  darkBorder: {
    borderColor: THEME.colors.borderLight,
  },
  ghostBorder: {
    borderColor: THEME.colors.goldDark,
    borderWidth: 1.5,
  },
  disabledBorder: {
    borderColor: '#1E2230',
  },
});
