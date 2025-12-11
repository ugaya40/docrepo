import { useMemo } from 'react';
import { FileText } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { remarkAlert } from 'remark-github-blockquote-alert';
import remarkEmoji from 'remark-emoji';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { useFileTreeStore } from '../../stores/fileTreeStore';
import { useContentStore } from '../../stores/contentStore';
import { useThemeStore } from '../../stores/themeStore';
import { LinkRenderer } from './renderer/LinkRenderer';
import { CodeRenderer } from './renderer/CodeRenderer';
import { ImageRenderer } from './renderer/ImageRenderer';

export const DocumentView: React.FC = () => {
  const selectedFile = useFileTreeStore((s) => s.selectedFile);
  const content = useContentStore((s) => s.content);
  const isLoadingContent = useContentStore((s) => s.isLoadingContent);
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const components = useMemo(() => ({
    a: LinkRenderer,
    img: ImageRenderer,
    code: CodeRenderer,
  }), []);

  if (!selectedFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-600">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <FileText size={40} className={isLight ? 'text-slate-400' : 'text-slate-700'} />
        </div>
        <p className="text-lg font-medium">No document selected</p>
        <p className="text-sm">Select a file from the explorer to view</p>
      </div>
    );
  }

  if (isLoadingContent) {
    return (
      <div className="max-w-3xl mx-auto w-full">
        <div className="space-y-4 animate-pulse">
          <div className={`h-8 rounded w-3/4 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}></div>
          <div className={`h-4 rounded w-full ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}></div>
          <div className={`h-4 rounded w-5/6 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}></div>
          <div className={`h-32 rounded w-full mt-6 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full animate-content-fadeIn">
      <div className={`prose max-w-none w-full ${isLight ? '' : 'prose-invert'}`}>
        {selectedFile.name.toLowerCase().endsWith('.md') ? (
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath, remarkAlert, remarkEmoji]}
            rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
            components={components}>
            {content ?? ''}
          </Markdown>
        ) : (
          <pre className={`p-4 rounded-lg overflow-x-auto border text-sm whitespace-pre-wrap ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <code className={isLight ? 'text-slate-700' : 'text-slate-300'}>{content}</code>
          </pre>
        )}
      </div>
    </div>
  );
};
