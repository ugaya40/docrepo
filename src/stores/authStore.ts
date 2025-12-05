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
          },
        });
      },

      async logout() {
        await supabase.auth.signOut();
        clearOctokit();
        set({ isLoggedIn: false, user: null, session: null, providerToken: null });
      },

      async initialize() {
        set({ isLoading: true });

        const { data: { session } } = await supabase.auth.getSession();
        const persistedToken = get().providerToken;
        const token = session?.provider_token ?? persistedToken;

        if (session && token) {
          initOctokit(token);
          set({
            isLoggedIn: true,
            user: session.user,
            session,
            providerToken: token,
            isLoading: false,
          });
        } else {
          if (session) {
            await supabase.auth.signOut();
          }
          clearOctokit();
          set({
            isLoggedIn: false,
            user: null,
            session: null,
            providerToken: null,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ providerToken: state.providerToken }),
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
