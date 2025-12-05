import { create } from 'zustand';
import { MOBILE_BREAKPOINT } from '../lib/constants';

type LayoutState = {
  sidebarOpen: boolean;
  headerVisible: boolean;
};

type LayoutActions = {
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  initSidebarByWidth: () => void;
  setHeaderVisible: (visible: boolean) => void;
};

export type LayoutStore = LayoutState & LayoutActions;

export const useLayoutStore = create<LayoutStore>((set, get) => ({
  sidebarOpen: true,
  headerVisible: true,

  openSidebar() {
    set({ sidebarOpen: true });
  },

  closeSidebar() {
    set({ sidebarOpen: false });
  },

  toggleSidebar() {
    set({ sidebarOpen: !get().sidebarOpen });
  },

  initSidebarByWidth() {
    set({ sidebarOpen: window.innerWidth >= MOBILE_BREAKPOINT });
  },

  setHeaderVisible(visible) {
    set({ headerVisible: visible });
  },
}));
