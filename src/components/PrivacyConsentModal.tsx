import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Loader2, Check } from 'lucide-react';
import {
  DecisionesConsentimiento,
  VERSION_POLITICA,
  registrarConsentimiento,
} from '../services/consentService';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onAccept: () => void | Promise<void>;
}

/**
 * Consentimiento informado del paciente.
 *
 * El texto anterior prometía «encriptación militar», cifrado «de extremo a
 * extremo» y «confidencialidad absoluta». Ninguna de las tres es cierta: el
 * cifrado es AES-GCM en el almacenamiento del dispositivo, los datos viajan
 * cifrados en tránsito pero el servidor los lee, y ningún sistema puede
 * garantizar confidencialidad absoluta. Prometerlo en la pantalla donde alguien
 * firma el tratamiento de su historia clínica no es un exceso de marketing: es
 * una declaración falsa en el peor sitio posible.
 *
 * Lo que dice ahora se puede sostener frente a un auditor, y las tres casillas
 * son independientes porque son tres tratamientos distintos. Solo el primero es
 * obligatorio: condicionar el servicio a aceptar los otros dos haría que ese
 * consentimiento no fuese libre y, por tanto, no fuese válido.
 */
const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({ isOpen, onAccept }) => {
  const [decisiones, setDecisiones] = useState<DecisionesConsentimiento>({
    datosClinicos: false,
    iaGenerativa: false,
    biometriaFacial: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const alternar = (clave: keyof DecisionesConsentimiento) =>
    setDecisiones((previas) => ({ ...previas, [clave]: !previas[clave] }));

  const handleAccept = async () => {
    if (isSubmitting || !decisiones.datosClinicos) return;
    setIsSubmitting(true);
    try {
      await registrarConsentimiento(decisiones);
    } finally {
      setIsSubmitting(false);
      await onAccept();
    }
  };

  const OPCIONES: {
    clave: keyof DecisionesConsentimiento;
    titulo: string;
    detalle: string;
    obligatoria?: boolean;
  }[] = [
    {
      clave: 'datosClinicos',
      titulo: 'Tratamiento de mis datos clínicos',
      detalle:
        'Autorizo a mi médico y a la clínica a registrar y consultar mi historia, mis biomarcadores y mi adherencia al tratamiento a través de esta aplicación.',
      obligatoria: true,
    },
    {
      clave: 'iaGenerativa',
      titulo: 'Asistente con inteligencia artificial',
      detalle:
        'Autorizo que se envíe información de mi perfil a un modelo de lenguaje de un proveedor externo para responder mis consultas. El asistente no sustituye a mi médico.',
    },
    {
      clave: 'biometriaFacial',
      titulo: 'Análisis facial para estimar edad aparente',
      detalle:
        'Autorizo el análisis de una fotografía de mi rostro con este fin. Es un dato biométrico y puedo revocarlo cuando quiera.',
    },
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-darkBlue/90 backdrop-blur-xl" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-consentimiento"
        className="bg-white w-full max-w-sm max-h-[92vh] overflow-y-auto rounded-[2rem] p-6 shadow-2xl relative animate-in zoom-in-95 duration-500 flex flex-col items-center"
      >
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 shrink-0">
          <ShieldCheck size={28} strokeWidth={2.5} />
        </div>

        <h3
          id="titulo-consentimiento"
          className="text-xl font-black text-darkBlue text-center leading-tight mb-3"
        >
          Tus datos y tu consentimiento
        </h3>

        {/* Afirmaciones verificables, ninguna absoluta. */}
        <p className="text-[calc(13px*var(--escala-texto,1))] font-medium text-slate-600 leading-relaxed text-center mb-5">
          Tu información viaja cifrada y se guarda cifrada en este dispositivo. La
          tratan tu médico y la clínica para tu seguimiento, y no se vende ni se
          cede con fines comerciales. Puedes retirar cualquiera de estos permisos
          cuando quieras desde Configuración.
        </p>

        <div className="w-full space-y-2.5">
          {OPCIONES.map(({ clave, titulo, detalle, obligatoria }) => {
            const marcada = decisiones[clave];
            return (
              <button
                key={clave}
                type="button"
                role="checkbox"
                aria-checked={marcada}
                onClick={() => alternar(clave)}
                className={`w-full flex items-start gap-3 text-left p-3.5 rounded-2xl border-2 transition-all active:scale-[0.99] ${
                  marcada ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`w-6 h-6 mt-0.5 rounded-lg flex items-center justify-center shrink-0 border-2 transition-colors ${
                    marcada ? 'bg-primary border-primary text-white' : 'border-slate-300 text-transparent'
                  }`}
                >
                  <Check size={15} strokeWidth={3.5} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[calc(13px*var(--escala-texto,1))] font-black text-darkBlue leading-snug">
                    {titulo}
                    {obligatoria ? (
                      <span className="text-rose-600 font-black"> *</span>
                    ) : (
                      <span className="text-slate-500 font-bold"> (opcional)</span>
                    )}
                  </span>
                  <span className="block text-[calc(12px*var(--escala-texto,1))] font-medium text-slate-600 leading-snug mt-1">
                    {detalle}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="w-full text-[calc(12px*var(--escala-texto,1))] font-medium text-slate-500 mt-3">
          <span className="text-rose-600 font-black">*</span> Imprescindible para usar la
          aplicación. Las otras dos son opcionales: si las rechazas, el resto sigue
          funcionando igual.
        </p>

        <button
          onClick={handleAccept}
          disabled={isSubmitting || !decisiones.datosClinicos}
          className="w-full bg-darkBlue text-white py-4 rounded-2xl font-black text-sm tracking-wide shadow-xl shadow-darkBlue/20 mt-5 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 size={20} className="animate-spin text-white" />
          ) : (
            <>
              <span>Confirmar y continuar</span>
              <ArrowRight size={20} />
            </>
          )}
        </button>

        <p className="mt-4 text-[calc(12px*var(--escala-texto,1))] font-bold text-slate-500 text-center">
          Política de privacidad · versión {VERSION_POLITICA}
        </p>
      </div>
    </div>
  );
};

export default PrivacyConsentModal;
