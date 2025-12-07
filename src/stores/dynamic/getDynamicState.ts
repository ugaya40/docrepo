import { useRawDynamicStore } from "./useRawDynamicStore";

export const getDynamicState = <T>(key: string): T => {
  const state = useRawDynamicStore.getState();
  if (!state.states.has(key)) {
    throw new Error(`Dynamic state "${key}" is not defined. Use useDefineDynamicState to define it first.`);
  }
  return state.states.get(key) as T;
};
