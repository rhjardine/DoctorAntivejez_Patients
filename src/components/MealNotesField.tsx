import React, { useEffect, useRef, useState } from 'react';
import { PencilLine, Check, Lock } from 'lucide-react';
import { patientNotesService } from '../services/patientNotesService';

interface Props {
  /** Identificador de la comida (desayuno, almuerzo, cena, meriendas). */
  mealId: string;
  mealLabel: string;
}

const SAVE_DELAY_MS = 700;
const MAX_LENGTH = 500;

/**
 * Campo de notas del paciente para una comida.
 *
 * Guardado diferido: escribir no debe disparar un cifrado por pulsación.
 * El aviso de privacidad es deliberadamente visible — estas notas no llegan
 * al médico, y el paciente tiene que saberlo antes de escribir.
 */
const MealNotesField: React.FC<Props> = ({ mealId, mealLabel }) => {
  const [value, setValue] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedFlagRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    patientNotesService.get(mealId).then((stored) => {
      if (cancelled) return;
      setValue(stored);
      setIsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [mealId]);

  // Limpiar temporizadores al desmontar: sin esto, un guardado pendiente
  // dispararía un setState sobre un componente ya desmontado.
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (savedFlagRef.current) clearTimeout(savedFlagRef.current);
    },
    [],
  );

  const handleChange = (next: string) => {
    setValue(next);
    setIsSaved(false);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      await patientNotesService.set(mealId, next);
      setIsSaved(true);
      if (savedFlagRef.current) clearTimeout(savedFlagRef.current);
      savedFlagRef.current = setTimeout(() => setIsSaved(false), 2000);
    }, SAVE_DELAY_MS);
  };

  const fieldId = `meal-notes-${mealId}`;

  return (
    <div className="mt-3 bg-white rounded-[1.5rem] border border-slate-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={fieldId}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#107da8]"
        >
          <PencilLine size={13} />
          Mis notas · {mealLabel}
        </label>

        {isSaved && (
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-emerald-600">
            <Check size={12} /> Guardado
          </span>
        )}
      </div>

      <textarea
        id={fieldId}
        value={value}
        disabled={!isLoaded}
        maxLength={MAX_LENGTH}
        onChange={(e) => handleChange(e.target.value)}
        rows={3}
        placeholder={`¿Cómo te sentó tu ${mealLabel.toLowerCase()}? Anota lo que quieras recordar.`}
        className="w-full resize-none bg-[#f8fafc] border border-slate-100 rounded-2xl px-4 py-3 text-sm font-medium text-[#293b64] placeholder:text-slate-400 outline-none focus:border-[#23bcef] transition-colors disabled:opacity-50"
      />

      <p className="flex items-start gap-1.5 mt-2 text-[10px] font-medium leading-relaxed text-slate-400">
        <Lock size={11} className="flex-shrink-0 mt-0.5" />
        Estas notas son privadas y se guardan solo en este dispositivo. Tu médico
        no las ve — coméntaselo en tu consulta.
      </p>
    </div>
  );
};

export default MealNotesField;
