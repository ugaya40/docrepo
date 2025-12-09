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
          aria-label="Settings"
          className={`p-2.5 rounded-lg transition-colors ${isLight ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          title="Settings"
        >
          <Settings size={24} />
        </button>
      </div>

      {showSettings &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowSettings(false);
              setConfirmClear(false);
            }}
          >
            <div
              className={`animate-modal-pop border w-full max-w-md shadow-2xl rounded-2xl overflow-hidden ${isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900 border-slate-700 shadow-black/50'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`flex items-center justify-between p-4 border-b ${isLight ? 'border-slate-200 bg-slate-100/60' : 'border-slate-800 bg-slate-800/60'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Settings size={20} />
                  </div>
                  <div>
                    <h2 className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Settings</h2>
                    <p className="text-xs text-slate-500">Manage your preferences</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setConfirmClear(false);
                  }}
                  aria-label="Close settings"
                  className={`p-2 rounded-lg transition-colors ${isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 space-y-6">

                {/* Data Management Section */}
                <div>
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Data Management</h3>

                  {!confirmClear ? (
                    <button
                      onClick={() => setConfirmClear(true)}
                      className={`w-full group relative flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${isLight
                          ? 'border-slate-200 bg-white hover:border-red-200 hover:shadow-sm hover:shadow-red-50'
                          : 'border-slate-800 bg-slate-900/50 hover:border-red-900/50 hover:bg-red-950/10'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${isLight
                            ? 'bg-red-50 text-red-500 group-hover:bg-red-100 group-hover:text-red-600'
                            : 'bg-red-950/30 text-red-500 group-hover:bg-red-950/50 group-hover:text-red-400'
                          }`}>
                          <Trash2 size={18} />
                        </div>
                        <div className="text-left">
                          <p className={`text-sm font-medium transition-colors ${isLight
                              ? 'text-slate-700 group-hover:text-red-700'
                              : 'text-slate-200 group-hover:text-red-400'
                            }`}>Clear Cache</p>
                          <p className="text-xs text-slate-500">Remove all locally cached data</p>
                        </div>
                      </div>

                      <div className={`text-right text-xs ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>
                        {cacheStats ? (
                          <>
                            <p>{cacheStats.count} files</p>
                            <p>{formatSize(cacheStats.size)}</p>
                          </>
                        ) : (
                          <span>Loading...</span>
                        )}
                      </div>
                    </button>
                  ) : (
                    <div className={`rounded-xl border p-4 space-y-3 animate-content-fadeIn ${isLight
                        ? 'bg-red-50 border-red-100'
                        : 'bg-red-950/20 border-red-900/50'
                      }`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full shrink-0 ${isLight ? 'bg-red-100 text-red-600' : 'bg-red-900/30 text-red-400'}`}>
                          <Trash2 size={18} />
                        </div>
                        <div>
                          <h4 className={`text-sm font-semibold ${isLight ? 'text-red-900' : 'text-red-200'}`}>Clear all cached data?</h4>
                          <p className={`text-xs mt-1 ${isLight ? 'text-red-700' : 'text-red-300/80'}`}>
                            This action cannot be undone. The page will reload to apply changes.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 pl-12">
                        <button
                          onClick={() => setConfirmClear(false)}
                          className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${isLight
                              ? 'bg-white border border-red-200 text-red-700 hover:bg-red-50'
                              : 'bg-slate-900 border border-red-900/50 text-red-300 hover:bg-red-950/50'
                            }`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            await cacheService.clearAll();
                            window.location.reload();
                          }}
                          className="flex-1 px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm transition-colors"
                        >
                          Confirm Clear
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Account Section */}
                <div>
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Account</h3>

                  <button
                    onClick={logout}
                    className={`w-full group relative flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${isLight
                        ? 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-800/80'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${isLight
                          ? 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                        }`}>
                        <LogOut size={18} />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-medium transition-colors ${isLight
                            ? 'text-slate-700 group-hover:text-slate-900'
                            : 'text-slate-200 group-hover:text-white'
                          }`}>Sign Out</p>
                        <p className="text-xs text-slate-500">Sign out of your account</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Footer Info */}
                <div className="pt-2 flex justify-center">
                  <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>
                    docRepo v{import.meta.env.VITE_APP_VERSION}
                  </p>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
