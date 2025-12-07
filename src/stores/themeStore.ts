import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useContentRenderSessionStore } from './sequences/contentRenderSession';

type Theme = 'light' | 'dark';

type ThemeStore = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        useContentRenderSessionStore.getState().nextSession();
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' }));
      },
      setTheme: (theme) => {
        if (get().theme !== theme) {
          useContentRenderSessionStore.getState().nextSession();
        }
        set({ theme });
      },
    }),
    {
      name: 'docrepo-theme',
    }
  )
);
