export interface AvatarInfo {
  id: string;
  name: string;
  title: string;
  emoji: string;
  iconName: string;
  color: string;
  bgGradient: [string, string];
  quote: string;
}

export const WARRIOR_AVATARS: AvatarInfo[] = [
  {
    id: 'aurelius',
    name: 'Aurelius',
    title: 'Sun Emperor',
    emoji: '👑',
    iconName: 'crown',
    color: '#FFD700',
    bgGradient: ['#3A2E12', '#1A1406'],
    quote: 'The crown bows to no one.',
  },
  {
    id: 'valkyrie',
    name: 'Valkyrie',
    title: 'Blade Mistress',
    emoji: '⚔️',
    iconName: 'sword-cross',
    color: '#00F0FF',
    bgGradient: ['#0A2540', '#051321'],
    quote: 'Swift as lighting, sharp as frost.',
  },
  {
    id: 'kaido',
    name: 'Kaido',
    title: 'Titan Brawler',
    emoji: '🥊',
    iconName: 'boxing-glove',
    color: '#FF7700',
    bgGradient: ['#3D1B06', '#1A0C02'],
    quote: 'Pure raw power crushes all technique.',
  },
  {
    id: 'kage',
    name: 'Kage',
    title: 'Shadow Shinobi',
    emoji: '🥷',
    iconName: 'ninja',
    color: '#A855F7',
    bgGradient: ['#28103F', '#12051E'],
    quote: 'You cannot defeat what you cannot see.',
  },
  {
    id: 'ryujin',
    name: 'Ryujin',
    title: 'Dragon Knight',
    emoji: '🐉',
    iconName: 'fire',
    color: '#EF4444',
    bgGradient: ['#3B0D0D', '#1B0404'],
    quote: 'The arena burns in dragon fire.',
  },
  {
    id: 'aegis',
    name: 'Aegis',
    title: 'Iron Sentinel',
    emoji: '🛡️',
    iconName: 'shield',
    color: '#10B981',
    bgGradient: ['#063022', '#02160F'],
    quote: 'An unbreakable bastion against any strike.',
  },
  {
    id: 'morgana',
    name: 'Morgana',
    title: 'Void Sorceress',
    emoji: '🔮',
    iconName: 'crystal-ball',
    color: '#EC4899',
    bgGradient: ['#3B0728', '#1A0212'],
    quote: 'I foresee every move you will make.',
  },
  {
    id: 'cyber',
    name: 'Cyber-01',
    title: 'Arena Mecha',
    emoji: '🤖',
    iconName: 'robot',
    color: '#38BDF8',
    bgGradient: ['#0B2E42', '#041520'],
    quote: 'Calculating victory probability: 99.8%.',
  },
];

export const getAvatarById = (id: string): AvatarInfo => {
  return WARRIOR_AVATARS.find((a) => a.id === id) || WARRIOR_AVATARS[0];
};
