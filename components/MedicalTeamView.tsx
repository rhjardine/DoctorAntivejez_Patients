
import React from 'react';
import { User, Award, CheckCircle, ChevronRight, Mail, Phone, Instagram, Globe } from 'lucide-react';

const MedicalTeamView: React.FC = () => {
  const doctors = [
    {
      name: "Dr. Juan Carlos Méndez",
      title: "MD Cirujano - Especialista en Medicina Antienvejecimiento",
      bio: [
        "Médico cirujano graduado en la Universidad de Los Andes 1992.",
        "Miembro fundador de la Federación Iberoamericana de Medicina Antienvejecimiento (FISMAL).",
        "Especialista en Medicina Antienvejecimiento egresado de A4M, UNAM y Univ. de Sevilla.",
        "Director y fundador del Centro Médico y Académico Latinoamericano de Medicina Antienvejecimiento (CMA / ALMA)."
      ],
      // Imagen actualizada para representar al Dr. Juan Carlos Méndez institucionalmente
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600",
      accent: "border-primary",
      social: {
        instagram: "@doctorantivejez",
        web: "www.doctorantivejez.com"
      }
    },
    {
      name: "Dra. Zuraida Rojas",
      title: "MD Anestesióloga - Medicina Regenerativa",
      bio: [
        "MD Cirujano (UDO). Anestesióloga / Antienvejecimiento (UCV/UCLA).",
        "MSc. Medicina del Dolor, Regenerativa y Bioreguladora (ULA/IMEDAR).",
        "Docente adjunto del Postgrado de Anestesiología (UCV).",
        "Miembro referente internacional SISDET Colombia."
      ],
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400",
      accent: "border-orange-500"
    },
    {
      name: "Dra. Saraí Medina",
      title: "MD Cirujano - Especialista en Salud Ocupacional",
      bio: [
        "MD Cirujano (UCV).",
        "Medicina Antienvejecimiento y Formación Profesional en Centro Médico Doctor Antivejez.",
        "Diplomados en Medicina Integrativa y Salud Ocupacional.",
        "Liderazgo en atención primaria y medicina integrativa."
      ],
      image: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=400",
      accent: "border-primary"
    }
  ];

  return (
    <div className="flex flex-col gap-6 p-4 pb-32 animate-in fade-in slide-in-from-right duration-500">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-black text-darkBlue uppercase tracking-tighter">Mi Equipo Médico</h2>
        <div className="h-1 w-12 bg-primary mx-auto mt-2 rounded-full"></div>
      </div>

      {doctors.map((doc, index) => (
        <div key={index} className="bg-white rounded-[2rem] shadow-xl border border-gray-50 overflow-hidden flex flex-col">
          {/* Image Area with Branding Background for Primary Doctor */}
          <div className={`w-full h-72 relative border-b-8 ${doc.accent} ${index === 0 ? 'bg-[#293B64]' : ''}`}>
            <img 
              src={doc.image} 
              alt={doc.name} 
              className={`w-full h-full object-cover ${index === 0 ? 'opacity-90 mix-blend-luminosity hover:mix-blend-normal transition-all' : ''}`} 
            />
            <div className="absolute top-4 left-4">
              <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-sm">
                <CheckCircle size={20} className="text-primary" />
              </div>
            </div>
            
            {/* Social Overlay for first doctor card specifically */}
            {doc.social && (
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
                 <div className="bg-primary text-white py-1.5 px-4 rounded-xl flex items-center gap-2 shadow-lg backdrop-blur-md">
                    <Instagram size={14} />
                    <span className="text-[10px] font-black tracking-wider uppercase">{doc.social.instagram}</span>
                 </div>
                 <div className="bg-white/90 text-darkBlue py-1.5 px-4 rounded-xl flex items-center gap-2 shadow-lg backdrop-blur-md">
                    <Globe size={14} className="text-primary" />
                    <span className="text-[10px] font-black tracking-wider uppercase">{doc.social.web}</span>
                 </div>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            <h3 className="text-xl font-black text-darkBlue leading-tight mb-1">{doc.name}</h3>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">{doc.title}</p>
            
            <ul className="space-y-3">
              {doc.bio.map((item, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                  <p className="text-[11px] text-textMedium leading-tight font-medium">{item}</p>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-4 border-t border-gray-50 flex gap-3">
               <button className="flex-1 bg-pearlyGray py-3 rounded-xl text-[10px] font-black uppercase text-darkBlue tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                  <Mail size={14} /> Contactar
               </button>
               <button className="flex-1 bg-darkBlue py-3 rounded-xl text-[10px] font-black uppercase text-white tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-colors">
                  <Phone size={14} /> Reservar Cita
               </button>
            </div>
          </div>
        </div>
      ))}

      <div className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/20 text-center shadow-inner">
         <p className="text-xs font-bold text-darkBlue leading-relaxed italic">
            "Nuestro compromiso con la innovación nos coloca a la vanguardia de la biotecnología aplicada a la salud y al bienestar."
         </p>
      </div>
    </div>
  );
};

export default MedicalTeamView;
