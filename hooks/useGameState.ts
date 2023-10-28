import { create } from "zustand";

interface GameState {
  timedOut: boolean;
  gameIsEnding: boolean;
  gameEnded: boolean;
  winnerAddress: string | undefined;
  contractAddress: string | undefined;
  setGameTimedOut: (state: boolean) => void;
  setGameIsEnding: (state: boolean) => void;
  setGameEnded: (state: boolean) => void;
  setWinnerAddress: (address: string | undefined) => void;
  setContractAddress: (address: string | undefined) => void;
}

const useGameStateStore = create<GameState>((set) => ({
  timedOut: false,
  gameIsEnding: false,
  gameEnded: false,
  winnerAddress: undefined,
  contractAddress: undefined,
  setGameTimedOut: (state: boolean) => set({ timedOut: state }),
  setGameIsEnding: (state: boolean) => set({ gameIsEnding: state }),
  setGameEnded: (state: boolean) => set({ gameEnded: state }),
  setWinnerAddress: (address: string | undefined) =>
    set({ winnerAddress: address }),
  setContractAddress: (address: string | undefined) =>
    set({ contractAddress: address }),
}));

export default useGameStateStore;
