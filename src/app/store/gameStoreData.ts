import { create } from 'zustand'

interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  orbsCollected: number;
}

export interface GameStoreData {
  players: Player[];
  orb: { x: number, y: number };
  orbsCollected: {
    playerId: string;
    playerName: string;
    orbCollected: number;
  }[];
  setOrb: (orb: { x: number, y: number }) => void;
  setPlayers: (players: Player[]) => void;
  setOrbsCollected: (orbsCollected: { playerId: string, playerName: string, orbCollected: number }[]) => void;
  addPlayers: (players: Player[]) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, player: Player) => void;
}

const useGameStoreData = create<GameStoreData>((set) => ({
  players: [] as Player[],
  orb: {
    x: 0,
    y: 0,
  },
  orbsCollected: [] as { playerId: string, playerName: string, orbCollected: number }[],
  setOrb: (orb: { x: number, y: number }) => set({ orb }),
  setPlayers: (players: Player[]) => set({ players }),
  setOrbsCollected: (orbsCollected: { playerId: string, playerName: string, orbCollected: number }[]) => set({ orbsCollected }),
  addPlayers: (players: Player[]) => set((state: GameStoreData) => ({ players: [...state.players, ...players] })),
  removePlayer: (playerId: string) => set((state: { players: Player[] }) => ({ players: state.players.filter((p) => p.id !== playerId) })),
  updatePlayer: (playerId: string, player: Player) => set((state: { players: Player[] }) => ({ players: state.players.map((p) => p.id === playerId ? player : p) })),
}))

export default useGameStoreData;
