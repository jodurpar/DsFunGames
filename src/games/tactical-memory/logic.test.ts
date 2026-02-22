import { describe, it, expect } from 'vitest';
import { MemoryLogic } from './logic';

describe('MemoryLogic', () => {
    describe('generateDeck', () => {
        it('should generate a deck of 20 cards', () => {
            const deck = MemoryLogic.generateDeck();
            expect(deck.length).toBe(20);
        });

        it('should have 4 cards of each type', () => {
            const deck = MemoryLogic.generateDeck();
            const counts: Record<string, number> = {};
            deck.forEach(c => {
                counts[c.type] = (counts[c.type] || 0) + 1;
            });

            expect(counts['tank']).toBe(4);
            expect(counts['infantry']).toBe(4);
            expect(counts['artillery']).toBe(4);
            expect(counts['air']).toBe(4);
            expect(counts['special']).toBe(4);
        });
    });

    describe('checkMatch', () => {
        it('should return true for identical types', () => {
            expect(MemoryLogic.checkMatch(
                { id: 1, type: 'tank', isFlipped: true, isMatched: false },
                { id: 2, type: 'tank', isFlipped: true, isMatched: false }
            )).toBe(true);
        });

        it('should return false for different types', () => {
            expect(MemoryLogic.checkMatch(
                { id: 1, type: 'tank', isFlipped: true, isMatched: false },
                { id: 2, type: 'air', isFlipped: true, isMatched: false }
            )).toBe(false);
        });
    });
});
