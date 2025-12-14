import { useEffect, useRef } from "react";
import { useRawDynamicStore } from "./useRawDynamicStore";

export const useDefineDynamicState = <T>(key: string, initialValue: T) => {
  const remove = useRawDynamicStore((s) => s.remove);
  const initialValueRef = useRef(initialValue);
  const prevKeyRef = useRef<string | null>(null);

  const state = useRawDynamicStore.getState();

  if (prevKeyRef.current !== key) {
    if (state.states.has(key)) {
      return;
    }
    state.init(key, initialValueRef.current);
    prevKeyRef.current = key;
  }

  useEffect(() => {
    return () => {
      remove(key);
    };
  }, [key, remove]);
};