import { describe, it, expect } from 'vitest';
import { calcularScore, QUESTIONS } from '../pages/public/TestAntivejezPage';

describe('calcularScore', () => {
    it('todas las respuestas negativas = score 0 o mínimo', () => {
        const answers: Record<string, boolean> = {};
        QUESTIONS.filter(q => q.direction === 'negative').forEach(q => {
            answers[q.id] = true;
        });
        const result = calcularScore(answers);
        expect(result.score).toBeLessThanOrEqual(5);
    });

    it('todas las respuestas positivas = score 100 o máximo', () => {
        const answers: Record<string, boolean> = {};
        QUESTIONS.forEach(q => {
            answers[q.id] = q.direction === 'positive';
        });
        const result = calcularScore(answers);
        expect(result.score).toBe(100);
    });

    it('sin respuestas = score saludable por ausencia de síntomas (84)', () => {
        const result = calcularScore({});
        // Por la fórmula (negNotMarked + posSum) / maxPoints
        // Sin respuestas, negNotMarked = maxPossibleNegative.
        // score = 49 / 58 = ~84%
        expect(result.score).toBe(84);
    });

    it('respuestas del grupo 5 (edad >75) reducen el score significativamente', () => {
        const baseResult = calcularScore({});
        const oldResult = calcularScore({ 'R45a': true }); // >75 años
        expect(oldResult.score).toBeLessThan(baseResult.score);
    });

    it('la categoría CRITICO se asigna cuando score < 40', () => {
        const answers: Record<string, boolean> = {};
        QUESTIONS.filter(q => q.direction === 'negative').forEach(q => {
            answers[q.id] = true;
        });
        const result = calcularScore(answers);
        expect(result.category).toBe('CRITICO');
    });

    it('la categoría EXCELENTE se asigna cuando score >= 80', () => {
        const answers: Record<string, boolean> = {};
        QUESTIONS.forEach(q => {
            answers[q.id] = q.direction === 'positive';
        });
        const result = calcularScore(answers);
        expect(result.category).toBe('EXCELENTE');
    });

    it('las dimensiones por grupo se calculan independientemente', () => {
        const answers = { 'R1a': true }; // Negativo en Grupo 1
        const result = calcularScore(answers);
        expect(result.dimensiones.grupo1).toBeLessThan(100);
        // Grupo 2 tiene R13a (positive), si no se marca, el score es ~82%
        expect(result.dimensiones.grupo2).toBe(82);
    });
});
