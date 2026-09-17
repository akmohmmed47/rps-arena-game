export const THEME = {
  colors: {
    // Backgrounds
    background: '#07080B',
    surface: '#0E1017',
    surfaceElevated: '#161922',
    surfaceCard: '#1C202C',
    overlay: 'rgba(7, 8, 11, 0.85)',
    modalBackdrop: 'rgba(0, 0, 0, 0.8)',

    // Gold Primary Palette
    goldBright: '#FFE066',
    gold: '#FFD700',
    goldDark: '#D4AF37',
    goldDeep: '#997300',
    goldGlow: 'rgba(255, 215, 0, 0.35)',
    goldSubtle: 'rgba(255, 215, 0, 0.12)',
    goldBorder: '#473A14',
    goldGradient: ['#FFE77A', '#FFD700', '#D4AF37'],

    // Secondary Accents
    cyan: '#00F0FF',
    cyanGlow: 'rgba(0, 240, 255, 0.25)',
    crimson: '#FF2A55',
    crimsonDark: '#B91C1C',
    crimsonGlow: 'rgba(255, 42, 85, 0.35)',
    emerald: '#10B981',
    emeraldGlow: 'rgba(16, 185, 129, 0.3)',

    // Text & Grayscale
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textGold: '#FFD700',
    borderLight: '#2A2E3D',
    borderMuted: '#1E2230',
  },
  typography: {
    title: {
      fontSize: 28,
      fontWeight: '900' as const,
      letterSpacing: 2,
    },
    heading: {
      fontSize: 20,
      fontWeight: '800' as const,
      letterSpacing: 1,
    },
    subheading: {
      fontSize: 16,
      fontWeight: '700' as const,
    },
    body: {
      fontSize: 14,
      fontWeight: '500' as const,
    },
    caption: {
      fontSize: 12,
      fontWeight: '600' as const,
      letterSpacing: 0.5,
    },
  },
  shadows: {
    goldGlow: {
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 14,
      elevation: 8,
    },
    crimsonGlow: {
      shadowColor: '#FF2A55',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 10,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
};
