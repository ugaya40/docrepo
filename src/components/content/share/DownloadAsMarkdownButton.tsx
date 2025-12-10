import { FileDown, Loader2 } from 'lucide-react';
import { useThemeStore } from '../../../stores/themeStore';
import { useContentStore } from '../../../stores/contentStore';
import { useFileTreeStore } from '../../../stores/fileTreeStore';
import { useState } from 'react';

interface DownloadAsMarkdownButtonProps {
  onDownloadStart?: () => void;
  onDownloadEnd?: () => void;
}

export const DownloadAsMarkdownButton: React.FC<DownloadAsMarkdownButtonProps> = ({
  onDownloadStart,
  onDownloadEnd,
}) => {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';
  const content = useContentStore((s) => s.content);
  const selectedFile = useFileTreeStore((s) => s.selectedFile);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!content || !selectedFile) return;

    onDownloadStart?.();
    setIsDownloading(true);

    try {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.name.endsWith('.md')
        ? selectedFile.name
        : `${selectedFile.name}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
      onDownloadEnd?.();
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading || !content}
      className={`w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors ${isLight
        ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
        : 'text-slate-300 hover:text-white hover:bg-slate-700'
        }`}
    >
      {isDownloading ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <FileDown size={20} />
      )}
      Download MD
    </button>
  );
};
