import { useEffect, useRef } from "react";
import { useRawDynamicStore } from "./useRawDynamicStore";

export const useDefineDynamicState = <T>(key: string, initialValue: T) => {
  const set = useRawDynamicStore((s) => s.set);
  const remove = useRawDynamicStore((s) => s.remove);
  const initialValueRef = useRef(initialValue);

  useEffect(() => {
    set(key, initialValueRef.current);

    return () => {
      remove(key);
    };
  }, [key, set, remove]);
};