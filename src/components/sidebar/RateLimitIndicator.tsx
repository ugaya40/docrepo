import { Activity } from 'lucide-react';
import { useRateLimitStore } from '../../stores/rateLimitStore';
import { useThemeStore } from '../../stores/themeStore';

export const RateLimitIndicator: React.FC = () => {
  const remaining = useRateLimitStore((s) => s.remaining);
  const limit = useRateLimitStore((s) => s.limit);
  const resetAt = useRateLimitStore((s) => s.resetAt);
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  if (remaining === null || limit === null) {
    return null;
  }

  const percentage = (remaining / limit) * 100;
  const isCritical = percentage < 3;
  const isLow = percentage < 10;

  const remainingColor = isCritical ? 'text-red-500' : isLow ? 'text-amber-500' : '';

  const formatResetTime = (date: Date | null) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.max(0, Math.floor((date.getTime() - now.getTime()) / 1000 / 60));
    return `${diff}min`;
  };

  return (
    <div className={`px-4 py-2 text-xs border-t ${isLight ? 'border-(--color-border) text-slate-500' : 'border-slate-800 text-slate-400'}`}>
      <div className="flex items-center gap-2">
        <Activity size={12} className={remainingColor} />
        <span>remaining API : <span className={remainingColor}>{remaining.toLocaleString()}</span> / {limit.toLocaleString()}</span>
        {resetAt && (
          <span className="text-slate-500">({formatResetTime(resetAt)})</span>
        )}
      </div>
    </div>
  );
};
