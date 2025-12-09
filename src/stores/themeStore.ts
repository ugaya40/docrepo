import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { contentRenderSession } from './sessions/contentRenderSession';

export type Theme = 'light' | 'dark';
export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeStore = {
  theme: Theme;
  mode: ThemeMode;
  setTheme: (theme: Theme) => void;
  setMode: (mode: ThemeMode) => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      mode: 'system',

      setTheme: (theme) => {
        if (get().theme !== theme) {
          contentRenderSession.nextSession();
        }
        set({ theme });
      },

      setMode: (mode) => {
        const currentTheme = get().theme;
        let newTheme = currentTheme;

        if (mode === 'light' || mode === 'dark') {
          newTheme = mode;
        }

        if (currentTheme !== newTheme) {
          contentRenderSession.nextSession();
        }

        set({ mode, theme: newTheme });
      },
    }),
    {
      name: 'docrepo-theme',
      partialize: (state) => ({ mode: state.mode, theme: state.theme }), // 両方永続化
    }
  )
);
