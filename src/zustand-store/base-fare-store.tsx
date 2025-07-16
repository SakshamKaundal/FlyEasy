import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FareState {
  fares: {
    infant: number;
    child: number;
    adult: number;
  };
  setFares: (fares: { infant: number; child: number; adult: number }) => void;
  resetFares: () => void;
}

export const useFareStore = create<FareState>()(
  persist(
    (set) => ({
      fares: {
        infant: 0,
        child: 0,
        adult: 0,
      },
      setFares: (fares) => set({ fares }),
      resetFares: () =>
        set({
          fares: {
            infant: 0,
            child: 0,
            adult: 0,
          },
        }),
    }),
    {
      name: 'fare-storage',
    }
  )
);