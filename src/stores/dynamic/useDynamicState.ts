import { useRawDynamicStore } from "./useRawDynamicStore";

export const useDynamicState = <T>(key: string) => {
  const has = useRawDynamicStore((s) => s.states.has(key));
  if (!has) {
    throw new Error(`Dynamic state "${key}" is not defined. Use useDefineDynamicState to define it first.`);
  }

  const value = useRawDynamicStore((s) => s.states.get(key) as T);

  const setValue = (valueOrUpdater: T | ((prev: T) => T)) => {
    useRawDynamicStore.getState().set(key, valueOrUpdater);
  };

  return [value, setValue] as const;
};