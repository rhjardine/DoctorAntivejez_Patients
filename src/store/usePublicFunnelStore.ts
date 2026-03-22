import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Types ──────────────────────────────────────────────────────────────
type Category = 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'CRITICO';
type FunnelStep = 'LANDING' | 'TEST' | 'AGEBOT' | 'RESULTADO' | 'CONSULTA' | 'BOOKED';
type BookingType = 'basica' | 'profunda';

interface PublicFunnelState {
    // Lead data
    leadName: string | null;
    leadEmail: string | null;
    leadPhone: string | null;
    leadCountry: string | null;

    // Test result
    testScore: number | null;
    testCategory: Category | null;
    testDimensiones: Record<string, number> | null;
    testCompletedAt: string | null;

    // AgeBot result
    ageBotEstimatedAge: number | null;
    ageBotCompletedAt: string | null;

    // Funnel state
    currentStep: FunnelStep;
    bookingType: BookingType | null;

    // ─── Actions ──────────────────────────────────────────────────────────
    setLead: (name: string, email: string, phone?: string, country?: string) => void;
    setTestResult: (
        score: number,
        category: string,
        dimensiones: Record<string, number>
    ) => void;
    setAgeBotResult: (age: number) => void;
    setCurrentStep: (step: FunnelStep) => void;
    setBookingType: (type: BookingType) => void;
    resetFunnel: () => void;
}

// ─── Initial state ───────────────────────────────────────────────────────
const initialState = {
    leadName: null,
    leadEmail: null,
    leadPhone: null,
    leadCountry: null,
    testScore: null,
    testCategory: null,
    testDimensiones: null,
    testCompletedAt: null,
    ageBotEstimatedAge: null,
    ageBotCompletedAt: null,
    currentStep: 'LANDING' as FunnelStep,
    bookingType: null,
};

// ─── Store ───────────────────────────────────────────────────────────────
export const usePublicFunnelStore = create<PublicFunnelState>()(
    persist(
        (set) => ({
            ...initialState,

            setLead: (name, email, phone, country) =>
                set({
                    leadName: name,
                    leadEmail: email,
                    leadPhone: phone ?? null,
                    leadCountry: country ?? null,
                }),

            setTestResult: (score, category, dimensiones) =>
                set({
                    testScore: score,
                    testCategory: category as Category,
                    testDimensiones: dimensiones,
                    testCompletedAt: new Date().toISOString(),
                }),

            setAgeBotResult: (age) =>
                set({
                    ageBotEstimatedAge: age,
                    ageBotCompletedAt: new Date().toISOString(),
                }),

            setCurrentStep: (step) => set({ currentStep: step }),

            setBookingType: (type) => set({ bookingType: type }),

            resetFunnel: () => set(initialState),
        }),
        {
            name: 'da_funnel_v1',
            storage: createJSONStorage(() => localStorage),
            // Only persist non-sensitive funnel metadata — NOT phone, name (PII not needed after session)
            partialize: (state) => ({
                leadEmail: state.leadEmail,
                testScore: state.testScore,
                testCategory: state.testCategory,
                testDimensiones: state.testDimensiones,
                testCompletedAt: state.testCompletedAt,
                currentStep: state.currentStep,
            }),
        }
    )
);
