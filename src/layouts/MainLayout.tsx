import { Outlet, Link } from 'react-router-dom';
import { Gamepad2, Github } from 'lucide-react';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-game-bg text-game-text selection:bg-game-accent selection:text-white">
      <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50 bg-game-bg/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-game-accent/10 group-hover:bg-game-accent/20 transition-colors">
              <Gamepad2 className="w-6 h-6 text-game-accent" />
            </div>
            <span className="font-bold text-xl tracking-tight">DsFunGames</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-game-muted hover:text-white transition-colors">
              Library
            </Link>
            <a href="#" className="text-sm font-medium text-game-muted hover:text-white transition-colors">
              Leaderboards
            </a>
            <a href="#" className="text-sm font-medium text-game-muted hover:text-white transition-colors">
              Community
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="p-2 text-game-muted hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-game-muted text-sm">
          <p>&copy; {new Date().getFullYear()} DsFunGames. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
