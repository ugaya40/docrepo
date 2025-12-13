import { useState, useRef, useEffect, lazy, Suspense, isValidElement } from 'react';
import type { ReactNode, ReactElement } from 'react';
import { Copy, Check } from 'lucide-react';

const MermaidRenderer = lazy(() =>
  import('./MermaidRenderer').then((m) => ({ default: m.MermaidRenderer }))
);

const extractTextFromChildren = (children: ReactNode): string => {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('');
  }
  if (isValidElement(children)) {
    const element = children as ReactElement<{ children?: ReactNode }>;
    return extractTextFromChildren(element.props.children);
  }
  return '';
};

export const CodeRenderer = (props: React.ComponentProps<'code'>) => {
  const { children, className, ...rest } = props;
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const match = /language-(\w+)/.exec(className || '');

  const isBlock = Boolean(match);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (match && match[1] === 'mermaid') {
    return (
      <Suspense
        fallback={
          <div className="flex justify-center my-1 p-4 bg-slate-900/50 rounded-lg text-slate-500 text-sm">
            Loading diagram...
          </div>
        }
      >
        <MermaidRenderer chart={String(children).replace(/\n$/, '')} />
      </Suspense>
    );
  }

  if (isBlock) {
    const code = extractTextFromChildren(children).replace(/\n$/, '');

    const handleCopy = async () => {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="relative group">
        <button
          onClick={handleCopy}
          className={`absolute top-2 right-2 p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-opacity z-10 ${copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          title="Copy code"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
        <code {...rest} className={className}>
          {children}
        </code>
      </div>
    );
  }

  return (
    <code {...rest} className={className}>
      {children}
    </code>
  );
};
