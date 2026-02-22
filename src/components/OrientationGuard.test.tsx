import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OrientationGuard from './OrientationGuard';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('OrientationGuard Component', () => {
    it('renders children when not locked', () => {
        render(
            <OrientationGuard locked={false}>
                <div data-testid="child">Child Content</div>
            </OrientationGuard>
        );

        expect(screen.getByTestId('child')).toBeInTheDocument();

        // The rotate message should not be visible when not locked
        expect(screen.queryByText('common.rotateToCombat')).toBeNull();
    });

    it('renders children when locked but in landscape (simulated by default jsdom)', () => {
        // jsdom screen by default is generic, often not triggering portrait media query
        // In our component, portrait is defined as height > width.
        // We can temporarily mock window innerHeight/innerWidth to simulate landscape
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 });

        render(
            <OrientationGuard locked={true}>
                <div data-testid="child">Child Content</div>
            </OrientationGuard>
        );

        expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('shows overlay when locked and in portrait mode', () => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 390 });
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 844 });

        render(
            <OrientationGuard locked={true}>
                <div data-testid="child">Child Content</div>
            </OrientationGuard>
        );

        // Should not render children
        expect(screen.queryByTestId('child')).toBeNull();
        // Should render the overlay messages
        expect(screen.getByText('Display Protocol')).toBeInTheDocument();
        expect(screen.getByText('common.rotateToCombat')).toBeInTheDocument();
        expect(screen.getByText('common.tacticalMode')).toBeInTheDocument();
    });
});
