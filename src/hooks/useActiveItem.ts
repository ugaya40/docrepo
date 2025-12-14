import { useState, useEffect, useRef } from 'react';

export function useActiveItem(itemIds: string[], options: { rootSelector?: string; activeZoneRatio?: number; threshold?: number | number[] } = {}) {
  const { rootSelector, activeZoneRatio = 0.2, threshold = 0.1 } = options;
  const [activeId, setActiveId] = useState<string | null>(null);
  const visibleItemsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Ignore very small intersections to prevent flickering/jitter at boundaries.
          // If intersection is tiny (e.g. < 2px), we do NOTHING.
          // This effectively keeps the previous state (hysteresis).
          if (entry.intersectionRect.height >= 2) {
            visibleItemsRef.current.add(entry.target.id);
          }
        } else {
          // Only remove if strictly NOT intersecting
          visibleItemsRef.current.delete(entry.target.id);
        }
      });
    };

    const setActiveItem = () => {
      if (visibleItemsRef.current.size > 0) {
        // Find the first item in the ordered itemIds list that is currently visible.
        const firstVisible = itemIds.find(id => visibleItemsRef.current.has(id));
        if (firstVisible) {
          setActiveId(current => current === firstVisible ? current : firstVisible);
        }
      }
    };

    const intervalId = setInterval(() => setActiveItem(), 50);

    const rootElement = rootSelector ? document.querySelector(rootSelector) : null;

    // Define the active zone ratio (default top 20% of the viewport/root)
    const bottomMarginPct = (1 - activeZoneRatio) * 100;

    const observerOptions: IntersectionObserverInit = {
      root: rootElement,
      rootMargin: `0% 0% -${bottomMarginPct}% 0%`,
      threshold: threshold,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    itemIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    // Initial check to set activeId before scrolling occurs
    const calculateInitialActive = () => {
      let initialActiveId: string | null = null;

      // If we have no items, do nothing
      if (itemIds.length === 0) return;

      const containerHeight = rootElement ? rootElement.clientHeight : window.innerHeight;
      const initialThreshold = containerHeight * activeZoneRatio;

      // Check each item's position
      for (const id of itemIds) {
        const element = document.getElementById(id);
        if (!element) continue;

        const rect = element.getBoundingClientRect();

        if (rect.top <= initialThreshold) {
          initialActiveId = id;
        } else {
          break;
        }
      }

      if (initialActiveId) {
        setActiveId(initialActiveId);
      } else if (itemIds.length > 0) {
        setActiveId(itemIds[0]);
      }
    };

    // Run initial calculation
    requestAnimationFrame(calculateInitialActive);

    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
    // Use itemIds.join(',') to avoid re-running effect when array reference changes but content is same.
    // This is a common pattern to avoid forcing consumers to memoize arrays.
  }, [itemIds.join(','), rootSelector, activeZoneRatio, threshold]);

  return activeId;
}
