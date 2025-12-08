import { memo } from 'react';
import { useLayoutStore } from '../../stores/layoutStore';
import { useThemeStore } from '../../stores/themeStore';
import { SideHeader } from './SideHeader';
import { FileTree } from './FileTree';
import { RateLimitIndicator } from './RateLimitIndicator';
import { UserProfile } from './UserProfile';

export const Sidebar: React.FC = memo(() => {
  const sidebarOpen = useLayoutStore((s) => s.sidebarOpen);
  const theme = useThemeStore((s) => s.theme);

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-72 border-r
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${theme === 'light' ? 'bg-(--color-bg-secondary) border-(--color-border)' : 'bg-slate-900 border-slate-800'}
      `}
    >
      <SideHeader />
      <FileTree />
      <RateLimitIndicator />
      <UserProfile />
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
