import { Loader2, Share2 } from 'lucide-react';
import { useThemeStore } from '../../../stores/themeStore';
import { useGenerateHtml } from './useGenerateHtml';

interface ShareAsHtmlButtonProps {
  onShareStart?: () => void;
  onShareEnd?: () => void;
}

export const ShareAsHtmlButton: React.FC<ShareAsHtmlButtonProps> = ({
  onShareStart,
  onShareEnd,
}) => {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';
  const { generateHtml, isGenerating } = useGenerateHtml();

  const handleShare = async () => {
    onShareStart?.();

    try {
      const result = await generateHtml();
      if (!result) return;

      if (navigator.canShare?.({ files: [result.file] })) {
        try {
          await navigator.share({ files: [result.file] });
        } catch (shareError) {
          if (shareError instanceof Error && shareError.name !== 'AbortError') {
            throw shareError;
          }
        }
      }
    } catch (e) {
      console.error('Failed to share HTML', e);
    } finally {
      onShareEnd?.();
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isGenerating}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${isLight ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
    >
      {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
      Share HTML
    </button>
  );
};
