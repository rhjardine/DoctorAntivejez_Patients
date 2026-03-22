interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
    totalActiveDays: number;
    milestones: number[];
    pulseHistory: PulseEntry[];
}

interface PulseEntry {
    date: string;
    value: 1 | 2 | 3 | 4 | 5;
    recordedAt: string;
}

const BioStreakService = {
    // Lee racha actual (solo localStorage con prefijo da_)
    getCurrentStreak(): StreakData {
        const raw = localStorage.getItem('da_streak_v1');
        if (!raw) return {
            currentStreak: 0, longestStreak: 0,
            lastActiveDate: '', totalActiveDays: 0,
            milestones: [], pulseHistory: []
        };
        return JSON.parse(raw);
    },

    // Registra actividad del día (llamar desde Pulso Matutino)
    recordActivity(date?: string): StreakData {
        const today = date || new Date().toISOString().split('T')[0];
        const data = this.getCurrentStreak();

        if (data.lastActiveDate === today) return data; // ya registrado hoy

        const yesterday = new Date(Date.now() - 86400000)
            .toISOString().split('T')[0];

        const newStreak = data.lastActiveDate === yesterday
            ? data.currentStreak + 1
            : 1; // racha rota

        const updated: StreakData = {
            ...data,
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, data.longestStreak),
            lastActiveDate: today,
            totalActiveDays: data.totalActiveDays + 1,
            milestones: [7, 21, 30, 60, 90].filter(m => newStreak === m).length > 0
                ? Array.from(new Set([...data.milestones, newStreak]))
                : data.milestones
        };

        localStorage.setItem('da_streak_v1', JSON.stringify(updated));
        return updated;
    },

    // Registra pulso matutino
    recordPulse(value: 1 | 2 | 3 | 4 | 5): void {
        const today = new Date().toISOString().split('T')[0];
        const data = this.getCurrentStreak();

        const alreadyToday = data.pulseHistory.some(p => p.date === today);
        if (alreadyToday) return;

        const newEntry: PulseEntry = {
            date: today,
            value,
            recordedAt: new Date().toISOString()
        };

        // Mantener solo últimos 30 días
        const history = [newEntry, ...data.pulseHistory].slice(0, 30);
        const updated = { ...data, pulseHistory: history };

        localStorage.setItem('da_streak_v1', JSON.stringify(updated));
        this.recordActivity(today); // registrar actividad al hacer pulso
    },

    // Calcula texto del próximo hito
    getNextMilestone(current: number): { days: number, message: string } {
        const milestones = [7, 21, 30, 60, 90];
        const next = milestones.find(m => m > current);
        if (!next) return { days: 0, message: "¡Eres un Bio-Élite!" };
        return {
            days: next - current,
            message: `${next - current} días para "${getMilestoneBadge(next)}"`
        };
    },

    // Verifica si el pulso ya fue registrado hoy
    isPulseRegisteredToday(): boolean {
        const today = new Date().toISOString().split('T')[0];
        const data = this.getCurrentStreak();
        return data.pulseHistory.some(p => p.date === today);
    }
};

function getMilestoneBadge(days: number): string {
    const badges: Record<number, string> = {
        7: 'Bio-Activado', 21: 'Constancia Celular',
        30: 'Un Mes de Vitalidad', 60: 'Longevity Warrior', 90: 'Bio-Élite'
    };
    return badges[days] || 'Longevity Master';
}

export { BioStreakService, getMilestoneBadge };
export type { StreakData, PulseEntry };
