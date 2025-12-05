import { create } from 'zustand';

type RateLimitState = {
  remaining: number | null;
  limit: number | null;
  resetAt: Date | null;
};

type RateLimitActions = {
  update: (remaining: number, limit: number, resetTimestamp: number) => void;
  clear: () => void;
};

export type RateLimitStore = RateLimitState & RateLimitActions;

const initialState: RateLimitState = {
  remaining: null,
  limit: null,
  resetAt: null,
};

export const useRateLimitStore = create<RateLimitStore>((set) => ({
  ...initialState,

  update(remaining, limit, resetTimestamp) {
    set({
      remaining,
      limit,
      resetAt: new Date(resetTimestamp * 1000),
    });
  },

  clear() {
    set(initialState);
  },
}));
