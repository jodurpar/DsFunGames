import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function LanguageSelector({ compact = false }: { compact?: boolean }) {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' }
    ];

    const currentLanguage = languages.find(lang => lang.code === i18n.language.split('-')[0]) || languages[0];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 rounded-xl text-sm font-bold bg-white border border-game-border hover:border-game-accent/30 hover:shadow-sm transition-all group ${compact ? 'p-1.5 sm:p-2' : 'px-3 py-2'}`}
                title={t('common.language')}
            >
                <Globe className={`${compact ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-4 h-4'} text-game-muted group-hover:text-game-accent transition-colors`} />
                {!compact && <span className="hidden sm:inline text-game-text uppercase">{currentLanguage.code}</span>}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-game-border py-2 z-[60] animate-in fade-in zoom-in duration-200">
                    <div className="px-3 py-1 mb-1">
                        <span className="text-[10px] font-bold text-game-muted uppercase tracking-wider">{t('common.language')}</span>
                    </div>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-game-accent/5 ${currentLanguage.code === lang.code ? 'text-game-accent font-bold' : 'text-game-text'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-base leading-none">{lang.flag}</span>
                                <span>{lang.name}</span>
                            </div>
                            {currentLanguage.code === lang.code && <Check className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
