import { createPortal } from 'react-dom';
import { Download, Share2, X } from 'lucide-react';
import { useThemeStore } from '../../../stores/themeStore';
import type { HtmlGenerateResult } from '../../../stores/sessions/htmlGenerateSession';

interface ExportModalProps {
  result: HtmlGenerateResult;
  onDownload: () => void;
  onShare: () => void;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  result,
  onDownload,
  onShare,
  onClose,
}) => {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const handleDownload = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onDownload();
  };

  const handleShare = async () => {
    if (navigator.canShare?.({ files: [result.file] })) {
      try {
        await navigator.share({ files: [result.file] });
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          console.error('Share failed', e);
        }
      }
    }
    onShare();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className={`relative rounded-xl shadow-2xl p-5 min-w-72 ${isLight ? 'bg-white' : 'bg-slate-800'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 p-1 rounded transition-colors ${isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'}`}
        >
          <X size={16} />
        </button>

        <div className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
          HTML Generated
        </div>
        <div className={`text-xs mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          {result.fileName}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isLight ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
          >
            <Download size={14} />
            Download
          </button>

          <button
            onClick={handleShare}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
          >
            <Share2 size={14} />
            Share
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
