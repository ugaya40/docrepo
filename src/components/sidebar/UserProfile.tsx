import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, Settings, X, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { cacheService } from '../../services/cacheService';

export const UserProfile: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore.getState().logout;
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';
  const [showSettings, setShowSettings] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [cacheStats, setCacheStats] = useState<{ count: number; size: number } | null>(null);

  useEffect(() => {
    if (showSettings) {
      cacheService.getStats().then(setCacheStats);
    }
  }, [showSettings]);

  if (!user) return null;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const avatarUrl = user.user_metadata?.avatar_url || '';
  const name = user.user_metadata?.full_name || user.user_metadata?.user_name || 'User';
  const login = user.user_metadata?.user_name || user.email || '';

  return (
    <div className={`p-4 border-t ${isLight ? 'border-(--color-border) bg-(--color-bg-secondary)/95' : 'border-slate-800 bg-slate-900/95'}`}>
      <div className="flex items-center gap-3">
        <img
          src={avatarUrl}
          alt="User"
          className={`w-9 h-9 rounded-full ${isLight ? 'bg-slate-200 border border-slate-300' : 'bg-slate-800 border border-slate-700'}`}
        />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isLight ? 'text-(--color-text-primary)' : 'text-white'}`}>{name}</p>
          <p className="text-xs text-slate-500 truncate">@{login}</p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className={`p-2 rounded-lg transition-colors ${isLight ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          title="Settings"
        >
          <Settings size={18} />
        </button>
        <button
          onClick={logout}
          className={`p-2 rounded-lg transition-colors ${isLight ? 'text-slate-500 hover:text-red-500 hover:bg-slate-200' : 'text-slate-400 hover:text-red-400 hover:bg-slate-800'}`}
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>

      {showSettings &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowSettings(false);
              setConfirmClear(false);
            }}
          >
            <div
              className={`border rounded-xl w-full max-w-xs shadow-xl ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`flex items-center justify-between p-3 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <h2 className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>Settings</h2>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setConfirmClear(false);
                  }}
                  className={`p-1 rounded transition-colors ${isLight ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-3 space-y-2">
                <div>
                  <button
                    onClick={() => setConfirmClear(true)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${isLight ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-red-400 hover:text-red-300 hover:bg-red-950/50'}`}
                  >
                    <Trash2 size={16} />
                    Clear cache
                  </button>
                  <p className="text-xs text-slate-500 mt-1 px-3">
                    {cacheStats
                      ? `${cacheStats.count} entries, ${formatSize(cacheStats.size)}`
                      : 'Loading...'}
                  </p>
                </div>

                {confirmClear && (
                  <div className={`rounded-lg p-3 space-y-2 ${isLight ? 'bg-red-50 border border-red-200' : 'bg-red-950/30 border border-red-900/50'}`}>
                    <p className={`text-xs ${isLight ? 'text-red-700' : 'text-red-300'}`}>
                      Are you sure? This will reload the page.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmClear(false)}
                        className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors ${isLight ? 'text-slate-600 hover:text-slate-800 bg-slate-200 hover:bg-slate-300' : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700'}`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          await cacheService.clearAll();
                          window.location.reload();
                        }}
                        className="flex-1 px-3 py-1.5 text-xs text-white bg-red-600 hover:bg-red-500 rounded transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
