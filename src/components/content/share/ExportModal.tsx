import { createPortal } from 'react-dom';
import { Download, Share2, X, FileText, CheckCircle2 } from 'lucide-react';
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
    a.click();
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-modal-pop ${isLight ? 'bg-white shadow-slate-200/50' : 'bg-slate-900 shadow-black/50'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isLight ? 'border-slate-100 bg-slate-50/80' : 'border-slate-800 bg-slate-900/50'}`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isLight ? 'bg-green-100 text-green-600' : 'bg-green-900/30 text-green-400'}`}>
              <CheckCircle2 size={18} />
            </div>
            <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Export Ready</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className={`p-1.5 rounded-lg transition-colors ${isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">

          {/* File Card */}
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800 bg-slate-900/30'}`}>
            <div className={`p-2.5 rounded-lg ${isLight ? 'bg-white shadow-sm text-indigo-500 border border-slate-100' : 'bg-slate-800 text-indigo-400 border border-slate-700'}`}>
              <FileText size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{result.fileName}</p>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                {(result.blob.size / 1024).toFixed(1)} KB • HTML Document
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all transform active:scale-95 ${isLight
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20'
                }`}
            >
              <Download size={16} />
              Download
            </button>

            <button
              onClick={handleShare}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${isLight
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  : 'bg-slate-800 border-slate-700/50 text-slate-300 hover:bg-slate-800/80 hover:border-slate-600'
                }`}
            >
              <Share2 size={16} />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
