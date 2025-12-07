import { useRawDynamicStore } from "./useRawDynamicStore";

export const removeDynamicStore = (key: string) => {
  useRawDynamicStore.getState().remove(key);
};
