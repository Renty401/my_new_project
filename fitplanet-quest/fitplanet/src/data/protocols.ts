

export interface Protocol {
  id: string;
  title: string;
  type: string;
  xp: number;
  kcalEstimate: number;
  targetReps: number;
  monsterName: string;
  color: string;
  image: string;
}

export const PROTOCOLS: Protocol[] = [
  {
    id: 'quest_jump',
    title: 'Kinetic Leap: 15 Jumps',
    type: 'ATTACK MODE',
    xp: 40,
    kcalEstimate: 60,
    targetReps: 15,
    monsterName: 'LEVEL 1: SMOG MONSTER',
    color: 'var(--neon-cyan)',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'quest_squat',
    title: 'Tectonic Squat: 10 Reps',
    type: 'DEFENSE SHIELD',
    xp: 30,
    kcalEstimate: 50,
    targetReps: 10,
    monsterName: 'LEVEL 2: PLASTIC TOXIN TITAN',
    color: 'var(--neon-magenta)',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'quest_burpee',
    title: 'Quantum Burpee: 5 Reps',
    type: 'BOSS OVERDRIVE',
    xp: 50,
    kcalEstimate: 90,
    targetReps: 5,
    monsterName: 'BOSS: CARBON SINGULARITY',
    color: 'var(--danger)',
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'quest_dash',
    title: 'Velocity Dash: 12 Reps',
    type: 'EVASION PROTOCOL',
    xp: 35,
    kcalEstimate: 70,
    targetReps: 12,
    monsterName: 'LEVEL 3: OVERDRIVE MATRIX',
    color: 'var(--success)',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'quest_cardio',
    title: 'Pulse Cardio: 20 Jacks',
    type: 'CORE REGEN',
    xp: 45,
    kcalEstimate: 80,
    targetReps: 20,
    monsterName: 'RECON: EMISSION CLOUD',
    color: 'var(--warning)',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=500&q=80'
  }
];

export const getProtocol = (id: string): Protocol =>
  PROTOCOLS.find((p) => p.id === id) || PROTOCOLS[0];
