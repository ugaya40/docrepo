import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { contentRenderSession } from './sessions/contentRenderSession';

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
        contentRenderSession.nextSession();
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' }));
      },
      setTheme: (theme) => {
        if (get().theme !== theme) {
          contentRenderSession.nextSession();
        }
        set({ theme });
      },
    }),
    {
      name: 'docrepo-theme',
    }
  )
);
