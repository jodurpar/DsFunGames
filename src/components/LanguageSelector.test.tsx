import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => {
        return {
            t: (str: string) => str,
            i18n: {
                changeLanguage: vi.fn(),
                language: 'en',
            },
        };
    },
}));

describe('LanguageSelector Component', () => {
    it('renders correctly with current language', () => {
        render(<LanguageSelector />);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();

        // Default language is en, so 'en' should be visible in text
        expect(screen.getByText('en')).toBeInTheDocument();
    });

    it('opens dropdown when clicked', async () => {
        render(<LanguageSelector />);
        const button = screen.getByRole('button');

        // Click to open
        fireEvent.click(button);

        // Check if languages are visible
        expect(screen.getByText('English')).toBeInTheDocument();
        expect(screen.getByText('Español')).toBeInTheDocument();
    });
});
