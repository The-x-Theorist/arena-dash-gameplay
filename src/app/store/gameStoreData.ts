import { create } from 'zustand'

interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface GameStoreData {
  players: Player[];
  addPlayers: (players: Player[]) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, player: Player) => void;
}

const useGameStoreData = create<GameStoreData>((set) => ({
  players: [] as Player[],
  addPlayers: (players: Player[]) => set((state: GameStoreData) => ({ players: [...state.players, ...players] })),
  removePlayer: (playerId: string) => set((state: { players: Player[] }) => ({ players: state.players.filter((p) => p.id !== playerId) })),
  updatePlayer: (playerId: string, player: Player) => set((state: { players: Player[] }) => ({ players: state.players.map((p) => p.id === playerId ? player : p) })),
}))

export default useGameStoreData;
