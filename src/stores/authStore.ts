import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { initOctokit, clearOctokit } from '../lib/github';

type AuthState = {
  isLoggedIn: boolean;
  user: User | null;
  session: Session | null;
  providerToken: string | null;
  isLoading: boolean;
};

type AuthActions = {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
};

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      session: null,
      providerToken: null,
      isLoading: true,

      async login() {
        await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            scopes: 'repo read:user',
            redirectTo: window.location.origin + import.meta.env.BASE_URL,
          },
        });
      },

      async logout() {
        try {
          await supabase.auth.signOut();
        }
        finally {
          clearOctokit();
          localStorage.removeItem('auth-storage'); // Force clear persistence
          set({ isLoggedIn: false, user: null, session: null, providerToken: null });
        }
      },

      async initialize() {
        set({ isLoading: true });

        const { data: { session } } = await supabase.auth.getSession();
        const persistedToken = get().providerToken;
        const token = session?.provider_token ?? persistedToken;

        if (token) {
          initOctokit(token);
          set({
            isLoggedIn: true,
            user: session?.user ?? get().user,
            session: session ?? null,
            providerToken: token,
            isLoading: false,
          });
        } else {
          clearOctokit();
          set({
            isLoggedIn: false,
            session: null,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ providerToken: state.providerToken, user: state.user }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (!error && state) {
            state.initialize();
          }
        };
      },
    }
  )
);
