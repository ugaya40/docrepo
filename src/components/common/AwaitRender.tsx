import { useState, useEffect, type ReactNode } from 'react';

interface AwaitRenderProps {
  children: ReactNode;
  pending?: ReactNode;
  scope?: string;
}

export const AwaitRender: React.FC<AwaitRenderProps> = ({
  children,
  pending,
  scope,
}) => {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const target = scope ? document.querySelector(scope) : document.body;
    if (!target) return;

    const checkStatus = () => {
      const pendingElements = target.querySelectorAll('[data-rendering="pending"]');
      setIsComplete(pendingElements.length === 0);
    };

    checkStatus();

    const observer = new MutationObserver(checkStatus);
    observer.observe(target, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-rendering'],
      childList: true,
    });

    return () => observer.disconnect();
  }, [scope]);

  return isComplete ? children : (pending ?? null);
};
