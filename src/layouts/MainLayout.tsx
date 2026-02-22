import { Outlet, Link, useLocation } from 'react-router-dom';
import { Gamepad2, Github, LayoutGrid } from 'lucide-react';

export default function MainLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-game-bg">
      {isHome && (
        <header className="border-b border-game-border sticky top-0 z-50 bg-white/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="bg-game-accent p-2 rounded-xl shadow-accent group-hover:rotate-6 transition-transform">
                  <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xl sm:text-2xl font-extrabold tracking-tighter text-game-text text-nowrap">
                  DsFun<span className="text-game-accent">Games</span>
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-1 border-l border-game-border pl-8">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isHome ? 'bg-game-accent/5 text-game-accent' : 'text-game-muted hover:text-game-text hover:bg-slate-100'}`}
                >
                  Library
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {!isHome && (
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-bold text-game-muted hover:text-game-text hover:bg-slate-100 transition-all border border-transparent hover:border-game-border"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Games</span>
                </Link>
              )}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl text-game-muted hover:text-game-text hover:bg-slate-100 transition-all border border-transparent hover:border-game-border"
              >
                <Github className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            </div>
        </header>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-game-border py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-6 sm:gap-8">
          <div className="flex items-center gap-2 opacity-60 grayscale hover:grayscale-0 transition-all">
            <Gamepad2 className="w-5 h-5 text-game-accent" />
            <span className="font-extrabold tracking-tighter text-xl text-game-text">DsFunGames</span>
          </div>
          <p className="text-sm text-game-muted max-w-md leading-relaxed">
            Crafting minimal, high-quality strategy experiences for the modern web. Built with focus and precision.
          </p>
          <div className="w-12 h-1 bg-game-accent/10 rounded-full" />
          <p className="text-[12px] font-medium text-game-muted/60 uppercase tracking-widest">
            © {new Date().getFullYear()} Strategy Gaming Studio
          </p>
        </div>
      </footer>
    </div>
  );
}
