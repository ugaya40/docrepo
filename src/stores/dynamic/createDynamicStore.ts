import { useRawDynamicStore } from "./useRawDynamicStore";

export const createDynamicStore = <T>(key: string, initialValue: T) => {
  const state = useRawDynamicStore.getState();
  if (state.states.has(key)) {
    throw new Error(`Dynamic store "${key}" already exists.`);
  }
  state.init(key, initialValue);
};
