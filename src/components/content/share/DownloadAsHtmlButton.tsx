import { useState } from 'react';
import { Loader2, FileText } from 'lucide-react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { remarkAlert } from 'remark-github-blockquote-alert';
import remarkEmoji from 'remark-emoji';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import { useContentStore } from '../../../stores/contentStore';
import { useFileTreeStore } from '../../../stores/fileTreeStore';
import { useRepoContextStore } from '../../../stores/repoContextStore';
import { useThemeStore } from '../../../stores/themeStore';
import { rehypeEmbedImages } from '../download/rehypeEmbedImages';
import { rehypeMermaid } from '../download/rehypeMermaid';
import { createHtmlDocument } from '../download/htmlTemplate';

interface DownloadAsHtmlButtonProps {
  downloadTheme: 'light' | 'dark';
  onDownloadStart?: () => void;
  onDownloadEnd?: () => void;
}

export const DownloadAsHtmlButton: React.FC<DownloadAsHtmlButtonProps> = ({
  downloadTheme,
  onDownloadStart,
  onDownloadEnd,
}) => {
  const content = useContentStore((s) => s.content);
  const selectedFile = useFileTreeStore((s) => s.selectedFile);
  const selectedRepo = useRepoContextStore((s) => s.selectedRepo);
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadHtml = async () => {
    if (isGenerating || !content || !selectedFile || !selectedRepo) return;
    setIsGenerating(true);
    onDownloadStart?.();

    try {
      const file = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkAlert)
        .use(remarkEmoji)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeEmbedImages, {
          filePath: selectedFile.path,
          repoOwner: selectedRepo.owner,
          repoName: selectedRepo.name,
        })
        .use(rehypeMermaid)
        .use(rehypeKatex)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(content);

      const htmlContent = createHtmlDocument(selectedFile.name, String(file), downloadTheme);

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.name.replace(/\.md$/i, '.html');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (e) {
      console.error('Failed to generate HTML', e);
    } finally {
      setIsGenerating(false);
      onDownloadEnd?.();
    }
  };

  return (
    <button
      onClick={handleDownloadHtml}
      disabled={isGenerating}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${isLight ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
    >
      {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
      download HTML ({downloadTheme})
    </button>
  );
};
