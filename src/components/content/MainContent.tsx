import { memo, useRef, useEffect, useCallback } from 'react';
import { Header } from './Header';
import { Breadcrumb } from './Breadcrumb';
import { DocumentView } from './DocumentView';
import { useFileTreeStore } from '../../stores/fileTreeStore';
import { useLayoutStore } from '../../stores/layoutStore';
import { useThemeStore } from '../../stores/themeStore';
import { MOBILE_BREAKPOINT } from '../../lib/constants';

export const MainContent: React.FC = memo(() => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const selectedFile = useFileTreeStore((s) => s.selectedFile);
  const sidebarOpen = useLayoutStore((s) => s.sidebarOpen);
  const headerVisible = useLayoutStore((s) => s.headerVisible);
  const setHeaderVisible = useLayoutStore.getState().setHeaderVisible;
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [selectedFile?.path]);

  const handleScroll = useCallback(() => {
    if (window.innerWidth >= MOBILE_BREAKPOINT) return;

    const el = scrollRef.current;
    if (!el) return;

    const currentScrollTop = el.scrollTop;
    const isScrollingDown = currentScrollTop > lastScrollTop.current;
    const isScrollingUp = currentScrollTop < lastScrollTop.current;

    if (isScrollingDown && currentScrollTop > 50) {
      setHeaderVisible(false);
    } else if (isScrollingUp) {
      setHeaderVisible(true);
    }

    lastScrollTop.current = currentScrollTop;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <main className={`flex-1 flex flex-col h-full relative w-full transition-[margin] duration-300 ease-in-out ${sidebarOpen ? 'md:ml-72' : 'md:ml-0'} ${isLight ? 'bg-(--color-bg-primary)' : 'bg-slate-950'}`}>
      <Header />
      <div ref={scrollRef} className={`flex-1 overflow-y-auto overscroll-none p-4 md:p-8 custom-scrollbar transition-[padding] duration-200 ${headerVisible ? 'pt-25' : 'pt-4'} md:pt-8`}>
        <Breadcrumb />
        <DocumentView />
      </div>
    </main>
  );
});
