import { Loader2, Download } from 'lucide-react';
import { useThemeStore } from '../../../stores/themeStore';
import { useHtmlGenerateSession, htmlGenerateSession } from '../../../stores/sessions/htmlGenerateSession';

interface DownloadAsHtmlButtonProps {
  onDownloadStart?: () => void;
  onDownloadEnd?: () => void;
}

export const DownloadAsHtmlButton: React.FC<DownloadAsHtmlButtonProps> = ({
  onDownloadStart,
  onDownloadEnd,
}) => {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';
  const { state } = useHtmlGenerateSession();

  const handleDownload = async () => {
    onDownloadStart?.();

    try {
      const context = htmlGenerateSession.getContext();
      const result = await context.getHtml();
      if (!result) return;

      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      onDownloadEnd?.();
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={state.isGenerating}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${isLight ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
    >
      {state.isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
      Download HTML
    </button>
  );
};
