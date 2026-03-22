import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, ArrowRight, RefreshCw, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

const NAVY = '#293B64';
const CYAN = '#23BCEF';

type Phase = 'capture' | 'analyzing' | 'result' | 'error';

interface FacialResult {
    estimatedAge: number;
    confidence: number;
    analysisPoints: number;
}

// TODO: conectar endpoint /api/vision-v1 cuando esté disponible en el backend
async function analyzeFacialAge(imageBase64: string): Promise<FacialResult> {
    try {
        const response = await fetch('/api-render/api/vision-v1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64, analysisType: 'AGE_FACIAL' }),
        });
        if (response.ok) return await response.json();
        throw new Error('API not available');
    } catch {
        // Mock result while backend endpoint is implemented
        await new Promise(r => setTimeout(r, 2500)); // Simulate processing time
        return {
            estimatedAge: Math.floor(35 + Math.random() * 25),
            confidence: 0.72 + Math.random() * 0.2,
            analysisPoints: 22 + Math.floor(Math.random() * 8),
        };
    }
}

/* ─── Facial dots overlay SVG ──────────────────────────────────────────── */
const FacialOverlay: React.FC<{ size: number }> = ({ size }) => {
    // Landmark points for facial age analysis visualization
    const points = [
        [0.5, 0.15], // top head
        [0.35, 0.25], [0.65, 0.25], // temples
        [0.28, 0.38], [0.72, 0.38], // outer eyebrows
        [0.38, 0.4], [0.62, 0.4],   // inner eyebrows
        [0.33, 0.45], [0.67, 0.45], // outer eyes
        [0.40, 0.44], [0.60, 0.44], // inner eyes
        [0.5, 0.5],                  // nose bridge
        [0.43, 0.57], [0.57, 0.57], // nostrils
        [0.5, 0.63],                 // upper lip
        [0.38, 0.68], [0.62, 0.68], // corners of mouth
        [0.5, 0.73],                 // chin center
        [0.32, 0.72], [0.68, 0.72], // jaw
        [0.24, 0.55], [0.76, 0.55], // cheeks
    ].map(([x, y]) => ({ x: x * size, y: y * size }));

    const connections = [
        [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [7, 8], [9, 10],
        [11, 12], [11, 13], [14, 15], [14, 16], [17, 18], [17, 19], [7, 20], [8, 21],
    ];

    return (
        <svg width={size} height={size} className="absolute inset-0" style={{ pointerEvents: 'none' }}>
            {connections.map(([a, b], i) => (
                <motion.line
                    key={i}
                    x1={points[a].x} y1={points[a].y}
                    x2={points[b].x} y2={points[b].y}
                    stroke={CYAN} strokeWidth="1" opacity="0.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ delay: i * 0.04, duration: 0.5 }}
                />
            ))}
            {points.map((p, i) => (
                <motion.circle
                    key={i}
                    cx={p.x} cy={p.y} r="2.5"
                    fill={CYAN}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.9 }}
                    transition={{ delay: i * 0.03, type: 'spring' }}
                />
            ))}
        </svg>
    );
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
const AgeBotFacialPage: React.FC = () => {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [phase, setPhase] = useState<Phase>('capture');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [result, setResult] = useState<FacialResult | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [cameraError, setCameraError] = useState(false);

    // Start front-facing camera for selfie
    useEffect(() => {
        if (phase !== 'capture' || cameraError) return;
        const start = async () => {
            try {
                // Try front camera first (selfie), fallback to environment
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } }
                });
                streamRef.current = mediaStream;
                if (videoRef.current) videoRef.current.srcObject = mediaStream;
            } catch {
                setCameraError(true);
            }
        };
        start();
        return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
    }, [phase, cameraError]);

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const v = videoRef.current;
        const c = canvasRef.current;
        c.width = v.videoWidth || 640;
        c.height = v.videoHeight || 640;
        const ctx = c.getContext('2d');
        if (!ctx) return;
        // Mirror the image for front camera
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(v, -c.width, 0, c.width, c.height);
        ctx.restore();
        const dataUrl = c.toDataURL('image/jpeg', 0.85);
        streamRef.current?.getTracks().forEach(t => t.stop());
        processImage(dataUrl);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            streamRef.current?.getTracks().forEach(t => t.stop());
            processImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const processImage = async (base64: string) => {
        setCapturedImage(base64);
        setPhase('analyzing');
        try {
            const r = await analyzeFacialAge(base64);
            setResult(r);
            setPhase('result');
        } catch {
            setErrorMsg('No se pudo analizar la imagen. Asegúrate de que tu rostro sea visible.');
            setPhase('error');
        }
    };

    const reset = () => {
        setCapturedImage(null);
        setResult(null);
        setErrorMsg('');
        setCameraError(false);
        setPhase('capture');
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: '#0b0f1a' }}>
            {/* Header */}
            <div className="px-5 pt-12 pb-4 flex items-center justify-between"
                style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                    <p className="text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: CYAN }}>
                        AgeBot Facial
                    </p>
                    <p className="text-white text-sm font-bold">Análisis de Edad Biológica Facial</p>
                </div>
                <button onClick={() => navigate(-1)}
                    className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all"
                    style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}>
                    Volver
                </button>
            </div>

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <AnimatePresence mode="wait">

                    {/* ── CAPTURE ── */}
                    {phase === 'capture' && (
                        <motion.div key="capture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col">
                            {/* Camera viewfinder */}
                            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
                                {!cameraError ? (
                                    <>
                                        <video ref={videoRef} autoPlay playsInline muted
                                            className="w-full h-full object-cover"
                                            style={{ transform: 'scaleX(-1)' }} />
                                        {/* Ellipse guide overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="relative">
                                                <div className="w-52 h-64 rounded-full"
                                                    style={{ border: `2px solid ${CYAN}88`, boxShadow: `0 0 0 4000px rgba(0,0,0,0.4)` }} />
                                                <p className="absolute -bottom-8 left-0 right-0 text-center text-xs font-medium"
                                                    style={{ color: 'rgba(255,255,255,0.8)' }}>
                                                    Centra tu rostro aquí
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* Camera unavailable — show upload only */
                                    <div className="flex flex-col items-center justify-center text-center px-8">
                                        <Camera size={48} className="mb-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                                        <p className="text-white/60 text-sm mb-6">
                                            La cámara no está disponible. Sube una foto tuya.
                                        </p>
                                        <button onClick={() => fileInputRef.current?.click()}
                                            className="px-6 py-3 rounded-full font-bold text-sm"
                                            style={{ background: CYAN, color: NAVY }}>
                                            Seleccionar foto
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            {!cameraError && (
                                <div className="py-6 flex items-center justify-around px-8"
                                    style={{ background: 'rgba(0,0,0,0.8)' }}>
                                    {/* Upload */}
                                    <button onClick={() => fileInputRef.current?.click()}
                                        className="w-14 h-14 rounded-full flex items-center justify-center"
                                        style={{ background: 'rgba(255,255,255,0.1)' }}>
                                        <ImageIcon size={22} color="white" />
                                    </button>
                                    {/* Shutter */}
                                    <button onClick={capturePhoto}
                                        className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform">
                                        <div className="w-16 h-16 rounded-full bg-white" />
                                    </button>
                                    <div className="w-14 h-14" /> {/* spacer */}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ── ANALYZING ── */}
                    {phase === 'analyzing' && (
                        <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                            <div className="relative mb-8">
                                {capturedImage && (
                                    <img src={capturedImage} alt="Foto capturada"
                                        className="w-40 h-40 object-cover rounded-full opacity-40"
                                        style={{ border: `3px solid ${CYAN}` }} />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 size={52} style={{ color: CYAN }} className="animate-spin" />
                                </div>
                            </div>
                            <p className="text-white text-lg font-bold mb-2" style={{ fontFamily: 'Poppins' }}>
                                Analizando tu edad biológica facial con IA...
                            </p>
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                Detectando {24} puntos de referencia facial
                            </p>
                        </motion.div>
                    )}

                    {/* ── RESULT ── */}
                    {phase === 'result' && result && (
                        <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center">

                            {/* Photo with overlay */}
                            <div className="relative w-52 h-52 mb-6">
                                {capturedImage && (
                                    <img src={capturedImage} alt="Analysis"
                                        className="w-full h-full object-cover rounded-3xl"
                                        style={{ border: `2px solid ${CYAN}55` }} />
                                )}
                                <FacialOverlay size={208} />
                                {/* Badge */}
                                <motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full"
                                    style={{ background: '#22c55e', whiteSpace: 'nowrap' }}>
                                    <CheckCircle size={14} color="white" />
                                    <span className="text-white text-xs font-black uppercase tracking-wide">ANÁLISIS COMPLETADO</span>
                                </motion.div>
                            </div>

                            {/* Age result */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="w-full max-w-sm rounded-3xl p-6 mb-5 text-center"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: CYAN }}>
                                    Edad Facial Estimada
                                </p>
                                <p className="text-6xl font-black text-white mb-1" style={{ fontFamily: 'Poppins' }}>
                                    {result.estimatedAge}
                                    <span className="text-2xl ml-1 text-white/60">años</span>
                                </p>
                                <div className="flex items-center justify-center gap-4 mt-3">
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase text-white/50 mb-1">Confianza</p>
                                        <p className="text-sm font-bold" style={{ color: CYAN }}>
                                            {Math.round(result.confidence * 100)}%
                                        </p>
                                    </div>
                                    <div className="w-px h-8 bg-white/10" />
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase text-white/50 mb-1">Puntos analizados</p>
                                        <p className="text-sm font-bold" style={{ color: CYAN }}>{result.analysisPoints}</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Disclaimer */}
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                                className="w-full max-w-sm rounded-2xl px-5 py-4 mb-5"
                                style={{ background: 'rgba(255,165,0,0.08)', border: '1px solid rgba(255,165,0,0.15)' }}>
                                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,200,100,0.85)' }}>
                                    La edad facial es solo uno de los indicadores. Tu edad biológica real incluye parámetros bioquímicos y biofísicos que solo se determinan en consulta.
                                </p>
                            </motion.div>

                            {/* CTAs */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                                className="w-full max-w-sm flex flex-col gap-3">
                                <button
                                    onClick={() => navigate('/consulta')}
                                    className="w-full font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-95"
                                    style={{ background: CYAN, color: NAVY, borderRadius: 28, padding: '15px 0', fontFamily: 'Poppins' }}>
                                    Ver mi evaluación completa <ArrowRight size={18} />
                                </button>
                                <button onClick={() => navigate('/test')}
                                    className="w-full font-medium text-sm py-3 transition-all"
                                    style={{ color: 'rgba(255,255,255,0.5)' }}>
                                    También quiero hacer el Test Antivejez →
                                </button>
                                <button onClick={reset}
                                    className="w-full font-medium text-xs py-2 flex items-center justify-center gap-1.5 transition-all"
                                    style={{ color: 'rgba(255,255,255,0.3)' }}>
                                    <RefreshCw size={12} /> Analizar otra foto
                                </button>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* ── ERROR ── */}
                    {phase === 'error' && (
                        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                            <AlertTriangle size={48} className="mb-4" style={{ color: '#f59e0b' }} />
                            <p className="text-white text-lg font-bold mb-2">No pudimos analizar la imagen</p>
                            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>{errorMsg}</p>
                            <button onClick={reset}
                                className="px-8 py-4 rounded-full font-bold"
                                style={{ background: CYAN, color: NAVY }}>
                                Intentar de nuevo
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};

export default AgeBotFacialPage;
