import { Loader2, Printer } from 'lucide-react';
import { useThemeStore } from '../../../stores/themeStore';
import { AwaitRender } from '../../common/AwaitRender';

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
    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${disabled ? 'opacity-50 cursor-wait' : ''} ${isLight ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
  >
    {disabled ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
    {label}
  </button>
);

export const PrintButton: React.FC = () => {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const handlePrint = () => {
    if (!isLight) {
      useThemeStore.getState().setTheme('light');
      return;
    }
    window.print();
  };

  const label = isLight ? 'Print' : 'Prepare Print (to light theme)';

  return (
    <AwaitRender scope="#document-content" pending={<MainButton disabled isLight={isLight} label={label} onClick={handlePrint} />}>
      <MainButton isLight={isLight} label={label} onClick={handlePrint} />
    </AwaitRender>
  );
};

