import { useRawDynamicStore } from "./useRawDynamicStore";

export const createDynamicStore = <T>(key: string, initialValue: T) => {
  const state = useRawDynamicStore.getState();
  if (state.states.has(key)) {
    return;
  }
  state.init(key, initialValue);
};
