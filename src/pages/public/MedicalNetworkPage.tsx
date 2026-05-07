import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CheckCircle, Clock } from 'lucide-react';
import PublicHeader from '../../components/public/PublicHeader';
import { MEDICAL_NETWORK, getAvailableCountries } from '../../data/medicalNetwork';

const NAVY = '#293B64';
const CYAN = '#23BCEF';

const MedicalNetworkPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

    const countries = getAvailableCountries();
    const filteredDoctors = selectedCountry
        ? MEDICAL_NETWORK.filter(d => d.countries.includes(selectedCountry))
        : MEDICAL_NETWORK;

    // Dr. Mendez first, then others, then unavailable placeholders
    const sortedDoctors = [...filteredDoctors].sort((a, b) => {
        if (a.isFounder) return -1;
        if (b.isFounder) return 1;
        if (a.availableForBooking !== b.availableForBooking) {
            return a.availableForBooking ? -1 : 1;
        }
        return 0;
    });

    const handleCTA = () => {
        const subject = encodeURIComponent('Postulación para unirme a la Red Médica ALMA');
        const body = encodeURIComponent('Hola equipo ALMA,\n\nSoy médico y estoy interesado(a) en certificarme y unirme a la red de especialistas antienvejecimiento.\n\nNombre:\nEspecialidad:\nPaís/Ciudad:\n\nQuedo atento(a) a sus comentarios.');
        window.location.href = `mailto:info@doctorantivejez.com?subject=${subject}&body=${body}`;
    };

    return (
        <div className="min-h-screen flex flex-col items-center pb-12" style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #0f1d38 100%)` }}>
            <PublicHeader
                showBack={true}
                onBack={() => navigate('/longevidad')}
            />

            <div className="w-full max-w-md px-5 mt-8 flex-1 flex flex-col">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <h1 className="text-[26px] font-black text-white mb-2 leading-tight" style={{ fontFamily: 'Poppins' }}>
                        Nuestra Red Médica
                    </h1>
                    <p className="text-[13px] mx-auto leading-relaxed max-w-[300px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        Especialistas certificados por la Academia ALMA en medicina antienvejecimiento y longevidad.
                    </p>
                </motion.div>

                {/* Filters */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                    className="flex overflow-x-auto no-scrollbar gap-2 mb-6 pb-2 -mx-5 px-5">
                    <button
                        onClick={() => setSelectedCountry(null)}
                        className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={{
                            background: selectedCountry === null ? CYAN : 'transparent',
                            color: selectedCountry === null ? NAVY : 'rgba(255,255,255,0.7)',
                            border: `1px solid ${selectedCountry === null ? 'transparent' : 'rgba(255,255,255,0.2)'}`
                        }}
                    >
                        Todos
                    </button>
                    {countries.map(country => (
                        <button
                            key={country}
                            onClick={() => setSelectedCountry(country)}
                            className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                            style={{
                                background: selectedCountry === country ? CYAN : 'transparent',
                                color: selectedCountry === country ? NAVY : 'rgba(255,255,255,0.7)',
                                border: `1px solid ${selectedCountry === country ? 'transparent' : 'rgba(255,255,255,0.2)'}`
                            }}
                        >
                            {country}
                        </button>
                    ))}
                </motion.div>

                {/* Doctor Cards */}
                <div className="flex flex-col gap-4 mb-10 min-h-[400px]">
                    <AnimatePresence mode="popLayout">
                        {sortedDoctors.map((doc, idx) => (
                            <motion.div
                                layout
                                key={doc.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                className="relative rounded-2xl p-4 flex gap-4 overflow-hidden"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${doc.isFounder ? 'rgba(35,188,239,0.4)' : 'rgba(255,255,255,0.1)'}`
                                }}
                            >
                                {/* Left: Avatar */}
                                <div className="relative shrink-0">
                                    <img
                                        src={doc.imageUrl}
                                        alt={doc.name}
                                        className="w-[60px] h-[60px] rounded-full object-cover z-10 relative"
                                        style={{ border: `2px solid ${doc.accentColor}88` }}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.style.display = 'none';
                                            target.parentElement!.innerHTML += `<div class="w-[60px] h-[60px] rounded-full flex items-center justify-center font-black text-xl z-20 relative" style="background:${doc.accentColor}20; color:${doc.accentColor}; box-shadow: inset 0 0 0 2px ${doc.accentColor}88">${doc.name.replace('Dr. ', '').replace('Dra. ', '').substring(0, 2)}</div>`;
                                        }}
                                    />
                                </div>

                                {/* Right: Info */}
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-[15px] font-semibold text-white leading-tight">
                                            {doc.name}
                                        </h3>
                                        {doc.isFounder && (
                                            <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded" style={{ background: `${CYAN}25`, color: CYAN }}>
                                                Fundador
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs mt-0.5 leading-snug" style={{ color: doc.accentColor }}>
                                        {doc.specialty}
                                    </p>

                                    <div className="flex items-center gap-1.5 mt-2">
                                        <MapPin size={10} style={{ color: 'rgba(255,255,255,0.5)' }} />
                                        <span className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                            {doc.location.split(',')[0]}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {doc.modality.map(m => (
                                            <span key={m} className="px-1.5 py-0.5 rounded border text-[9px] uppercase tracking-wider font-bold"
                                                style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}>
                                                {m}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-3.5">
                                        {doc.availableForBooking ? (
                                            <button
                                                onClick={() => navigate(`/consulta?tipo=basica&doctorId=${doc.id}`)}
                                                className="w-full text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                                                style={{ background: 'rgba(35,188,239,0.1)', color: CYAN, border: `1px solid ${CYAN}40` }}
                                            >
                                                Agendar consulta <CheckCircle size={12} />
                                            </button>
                                        ) : (
                                            <div className="w-full text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5"
                                                style={{ background: 'rgba(255,167,38,0.1)', color: '#FFA726', border: `1px dashed #FFA72640` }}>
                                                <Clock size={12} /> Próximamente
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Footer CTA (B2B) */}
                <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    onClick={handleCTA}
                    className="mx-auto text-xs font-semibold px-6 py-3 rounded-[28px] border transition-all hover:bg-white/5 active:scale-95 text-center mt-auto"
                    style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.8)' }}
                >
                    ¿Tu médico debería unirse a la red ALMA? →
                </motion.button>
            </div>
        </div>
    );
};

export default MedicalNetworkPage;
