import { create } from 'zustand';
import { useRawDynamicStore } from '../dynamic/useRawDynamicStore';
import { createDynamicStore } from '../dynamic/createDynamicStore';
import { removeDynamicStore } from '../dynamic/removeDynamicStore';

export type ContentRenderSessionState = {
  pendingRenderCount: number;
};

const initialState: ContentRenderSessionState = {
  pendingRenderCount: 0,
};

const getSessionKey = (id: number) => `contentRenderSession_${id}`;

type ContentRenderSessionStore = {
  sessionId: number;
  getSessionKey: () => string;
  nextSession: () => void;
};

const useContentRenderSessionStore = create<ContentRenderSessionStore>((set, get) => {
  
  createDynamicStore(getSessionKey(0), { ...initialState });

  return {
    sessionId: 0,

    getSessionKey: () => getSessionKey(get().sessionId),

    nextSession: () => {
      const prevId = get().sessionId;
      removeDynamicStore(getSessionKey(prevId));
      const newId = prevId + 1;
      createDynamicStore(getSessionKey(newId), { ...initialState });
      set({ sessionId: newId });
    },
  };
});

export const useContentRenderSession = () => {
  const sessionKey = useContentRenderSessionStore((s) => s.getSessionKey());

  const state = useRawDynamicStore((s) =>
    s.states.get(sessionKey) as ContentRenderSessionState | undefined
  ) ?? initialState;

  return { state };
};

export const contentRenderSession = {

  nextSession: () => useContentRenderSessionStore.getState().nextSession(),

  getContext: () => {
    const sessionKey = useContentRenderSessionStore.getState().getSessionKey();

    const updateState = (updater: (prev: ContentRenderSessionState) => ContentRenderSessionState) => {
      useRawDynamicStore.getState().set(sessionKey, updater);
    };

    return {
      incrementPendingRender: () => updateState(prev => ({ ...prev, pendingRenderCount: prev.pendingRenderCount + 1 })),
      decrementPendingRender: () => updateState(prev => ({ ...prev, pendingRenderCount: Math.max(0, prev.pendingRenderCount - 1) })),
    }
  }
};

