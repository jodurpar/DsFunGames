import { useState, useEffect, ReactNode } from 'react';
import { RotateCw, Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function OrientationGuard({ children, locked = false }: { children: ReactNode, locked?: boolean }) {
    const { t } = useTranslation();
    const [isPortrait, setIsPortrait] = useState(false);

    useEffect(() => {
        if (!locked) return;

        const checkOrientation = () => {
            // Logic: If height > width and width is reasonably small (mobile/tablet), trigger it
            const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 1024;
            setIsPortrait(portrait);
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, [locked]);

    const handleTacticalMode = async () => {
        try {
            // Request Fullscreen first (required for orientation lock in many browsers)
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            }
            // Attempt to lock orientation to landscape
            if (screen.orientation && 'lock' in screen.orientation) {
                // @ts-ignore - ScreenOrientation.lock is not always in types
                await screen.orientation.lock('landscape');
            }
        } catch (err) {
            console.warn("Manual tactical mode request failed:", err);
            // On desktops or browsers that don't support lock, we just stay here
            // but the user's intent was recorded.
        }
    };

    if (!locked || !isPortrait) return <>{children}</>;

    return (
        <div className="fixed inset-0 z-[100] bg-game-text flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-game-accent/40 via-transparent to-transparent" />
            </div>

            <div className="relative mb-8">
                <div className="absolute inset-0 bg-game-accent/20 blur-3xl rounded-full scale-150" />
                <div className="relative bg-white/5 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <RotateCw className="w-16 h-16 text-game-accent animate-spin-slow mb-6 mx-auto" style={{ animationDuration: '3s' }} />
                    <div className="flex items-center justify-center gap-3 text-white/40 uppercase tracking-[0.3em] text-[10px] font-black">
                        <Monitor className="w-4 h-4" />
                        Display Protocol
                    </div>
                </div>
            </div>

            <div className="relative space-y-6 max-w-sm">
                <div className="space-y-4">
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">
                        {t('common.rotateToCombat')}
                    </h2>
                    <p className="text-white/60 text-sm leading-relaxed font-medium">
                        {t('common.rotateDesc')}
                    </p>
                </div>

                <button
                    onClick={handleTacticalMode}
                    className="w-full premium-button flex items-center justify-center gap-3 bg-game-accent hover:bg-game-accent-light text-white py-4 rounded-2xl font-bold shadow-accent transition-all active:scale-95"
                >
                    <RotateCw className="w-5 h-5" />
                    {t('common.tacticalMode')}
                </button>
            </div>

            <div className="mt-12 flex gap-1 opacity-20">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-8 h-1 bg-game-accent/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-game-accent animate-ping"
                            style={{ animationDelay: `${i * 0.2}s`, animationDuration: '2s' }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
