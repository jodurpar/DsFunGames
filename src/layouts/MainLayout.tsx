import { Outlet, Link, useLocation } from 'react-router-dom';
import { Gamepad2, Github } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

export default function MainLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-game-bg">
      <header className={`border-b border-game-border sticky top-0 z-50 bg-white/80 backdrop-blur-xl transition-all duration-300 ${isHome ? 'h-16 sm:h-20' : 'h-8 sm:h-10'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8 h-full">
            <Link to="/" className="flex items-center gap-2 group">
              <div className={`bg-game-accent rounded-xl shadow-accent group-hover:rotate-6 transition-all ${isHome ? 'p-2' : 'p-1'}`}>
                <Gamepad2 className={`${isHome ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-4 h-4 sm:w-4.5 sm:h-4.5'} text-white`} />
              </div>
              <span className={`font-extrabold tracking-tighter text-game-text text-nowrap transition-all ${isHome ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}>
                DsFun<span className="text-game-accent">Games</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 border-l border-game-border pl-6 h-1/2 mt-0.5">
              <Link
                to="/"
                className={`px-3 py-1 rounded-lg text-[13px] font-bold transition-all ${isHome ? 'bg-game-accent/5 text-game-accent' : 'text-game-muted hover:text-game-text hover:bg-slate-50'}`}
              >
                {t('common.title')}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSelector compact={!isHome} />
            <a
              href="https://github.com/jodurpar/dsfungames"
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-xl text-game-muted hover:text-game-text hover:bg-slate-100 transition-all border border-transparent hover:border-game-border ${isHome ? 'p-2.5' : 'p-1.5'}`}
            >
              <Github className={`${isHome ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-4 h-4 sm:w-5 sm:h-5'}`} />
            </a>
          </div>
        </div>
      </header>

      <main className={`flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isHome ? 'py-6 sm:py-10' : 'py-2 sm:py-4'}`}>
        <Outlet />
      </main>

      <footer className={`${isHome ? 'bg-white border-t border-game-border py-10 sm:py-16' : 'bg-white/50 backdrop-blur-sm border-t border-game-border py-3'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isHome ? (
            <div className="flex flex-col items-center text-center gap-6 sm:gap-8">
              <div className="flex items-center gap-2 opacity-60 grayscale hover:grayscale-0 transition-all">
                <Gamepad2 className="w-5 h-5 text-game-accent" />
                <span className="font-extrabold tracking-tighter text-xl text-game-text">DsFunGames</span>
              </div>
              <p className="text-sm text-game-muted max-w-md leading-relaxed">
                {t('home.heroSubtitle')}
              </p>
              <div className="w-12 h-1 bg-game-accent/10 rounded-full" />
              <div className="flex items-center gap-8">
                <p className="text-[12px] font-medium text-game-muted/60 uppercase tracking-widest">
                  © {new Date().getFullYear()} {t('common.studio')}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 opacity-40 grayscale">
                <Gamepad2 className="w-3.5 h-3.5 text-game-accent" />
                <span className="font-extrabold tracking-tighter text-xs text-game-text">DsFunGames</span>
              </div>
              <p className="text-[10px] font-semibold text-game-muted/60 uppercase tracking-widest">
                © {new Date().getFullYear()} {t('common.studio')}
              </p>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
