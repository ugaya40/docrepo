import { create } from 'zustand';
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

export const useContentRenderSessionStore = create<ContentRenderSessionStore>((set, get) => {
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
