import { Loader2, Printer } from 'lucide-react';
import { useThemeStore } from '../../../stores/themeStore';
import { useContentRenderSession } from '../../../stores/sessions/contentRenderSession';
import { usePrintSync } from '../../../hooks/usePrintSync';

type MainButtonProps = {
  disabled?: boolean;
  isLight: boolean;
  label: string;
  onClick: () => void;
};

const MainButton: React.FC<MainButtonProps> = ({ disabled, isLight, label, onClick }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap transition-colors ${disabled ? 'opacity-50 cursor-wait' : ''} ${isLight ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
  >
    {disabled ? <Loader2 size={20} className="animate-spin" /> : <Printer size={20} />}
    {label}
  </button>
);

export const PrintButton: React.FC = () => {
  const { handlePrint } = usePrintSync();
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';
  const { state: sessionState } = useContentRenderSession();
  const isPrintReady = sessionState.pendingRenderCount === 0;

  return <MainButton disabled={!isPrintReady} isLight={isLight} label="Print" onClick={handlePrint} />;
};

