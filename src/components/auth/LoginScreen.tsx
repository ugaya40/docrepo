import { Database } from 'lucide-react';
import { SiGithub } from '@icons-pack/react-simple-icons';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';

export const LoginScreen: React.FC = () => {
  const login = useAuthStore((s) => s.login);
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isLight ? 'bg-slate-100' : 'bg-slate-950'}`}>
      <div className={`w-full max-w-md border rounded-2xl p-8 shadow-2xl text-center ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Database size={32} className="text-white" />
          </div>
        </div>
        <h1 className={`text-3xl font-bold mb-2 tracking-tight ${isLight ? 'text-slate-800' : 'text-white'}`}>docRepo</h1>
        <p className={`mb-8 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          A GitHub Markdown viewer with math, Mermaid diagrams, and private repo support
        </p>

        <button
          onClick={login}
          className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-3 border border-slate-700 group"
        >
          <SiGithub size={20} className="text-white group-hover:scale-110 transition-transform" />
          <span>Sign in with GitHub</span>
        </button>
      </div>
    </div>
  );
};
