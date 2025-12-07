import { create } from 'zustand';

type DynamicState = {
  states: Map<string, unknown>;
  init: <T>(name: string, initialValue: T) => void;
  set: <T>(name: string, valueOrUpdater: T | ((prev: T) => T)) => void;
  get: <T>(name: string) => T | undefined;
  remove: (name: string) => void;
  has: (name: string) => boolean;
};

export const useRawDynamicStore = create<DynamicState>((set, get) => ({
  states: new Map(),

  init: (name, initialValue) => {
    set((state) => {
      const newStates = new Map(state.states);
      newStates.set(name, initialValue);
      return { states: newStates };
    });
  },

  set: (name, valueOrUpdater) => {
    set((state) => {
      if (!state.states.has(name)) return state;
      const newStates = new Map(state.states);
      if (typeof valueOrUpdater === 'function') {
        const prev = state.states.get(name);
        newStates.set(name, (valueOrUpdater as (prev: unknown) => unknown)(prev));
      } else {
        newStates.set(name, valueOrUpdater);
      }
      return { states: newStates };
    });
  },

  get: <T,>(name: string) => {
    return get().states.get(name) as T | undefined;
  },

  remove: (name) => {
    set((state) => {
      const newStates = new Map(state.states);
      newStates.delete(name);
      return { states: newStates };
    });
  },

  has: (name) => {
    return get().states.has(name);
  },
}));
