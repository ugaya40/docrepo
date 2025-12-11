import { useEffect, useCallback } from 'react';

export const PRINT_CONTAINER_ID = 'print-container';
export const CONTENT_ID = 'document-content';

export function usePrintSync() {
  const syncContent = useCallback(() => {
    const printContainer = document.getElementById(PRINT_CONTAINER_ID);
    const content = document.getElementById(CONTENT_ID);

    if (!printContainer || !content) return;

    printContainer.innerHTML = '';
    const clone = content.cloneNode(true) as HTMLElement;

    cleanPrintClone(clone);

    printContainer.appendChild(clone);
  }, []);

  const cleanup = useCallback(() => {
    const printContainer = document.getElementById(PRINT_CONTAINER_ID);
    if (printContainer) {
      printContainer.innerHTML = '';
    }
  }, []);

  const handlePrint = useCallback(() => {
    syncContent();
    window.print();
  }, []);

  useEffect(() => {
    const onBeforePrint = () => {
      syncContent();
    };

    const onAfterPrint = () => {
      cleanup();
    };

    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, []);

  return { handlePrint };
}

function cleanPrintClone(element: HTMLElement) {
  if (element.classList.contains('prose-invert')) {
    element.classList.remove('prose-invert');
  }
  if (element.classList.contains('animate-content-fadeIn')) {
    element.classList.remove('animate-content-fadeIn');
  }
}
