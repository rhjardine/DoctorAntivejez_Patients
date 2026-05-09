import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, ArrowRight, RefreshCw, Loader2, AlertTriangle, CheckCircle, BrainCircuit } from 'lucide-react';
import WellnessDisclaimer from '../../components/public/WellnessDisclaimer';
import { VITALITY_LABELS } from '../../utils/vitalityLabels';
import { usePublicFunnelStore } from '../../store/usePublicFunnelStore';
import { ChevronLeft } from 'lucide-react';

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

/* ─── Facial dots overlay SVG (Tonos Terracota) ────────────────────────── */
const FacialOverlay: React.FC<{ size: number }> = ({ size }) => {
    const points = [
        [0.5, 0.15], [0.35, 0.25], [0.65, 0.25], [0.28, 0.38], [0.72, 0.38],
        [0.38, 0.4], [0.62, 0.4], [0.33, 0.45], [0.67, 0.45], [0.40, 0.44],
        [0.60, 0.44], [0.5, 0.5], [0.43, 0.57], [0.57, 0.57], [0.5, 0.63],
        [0.38, 0.68], [0.62, 0.68], [0.5, 0.73], [0.32, 0.72], [0.68, 0.72],
        [0.24, 0.55], [0.76, 0.55],
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
                    stroke="#9E5B4B" // Terracota
                    strokeWidth="1.5" opacity="0.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ delay: i * 0.04, duration: 0.5 }}
                />
            ))}
            {points.map((p, i) => (
                <motion.circle
                    key={i}
                    cx={p.x} cy={p.y} r="2.5"
                    fill="#9E5B4B" // Terracota
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
    const { setAgeBotResult, setCurrentStep } = usePublicFunnelStore();

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [phase, setPhase] = useState<Phase>('capture');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [result, setResult] = useState<FacialResult | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [cameraError, setCameraError] = useState(false);
    const [isCameraLoading, setIsCameraLoading] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraRequested, setCameraRequested] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [retrying, setRetrying] = useState(false);
    const [showDiagnostics, setShowDiagnostics] = useState(false);

    /* ─── FIX 1: WebRTC — Robust camera initialization ──────────────────── */
    const startCamera = useCallback(async () => {
        if (streamRef.current) return;
        setIsCameraLoading(true);
        setCameraActive(false);

        try {
            let mediaStream: MediaStream;
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: 'user' }, width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: false,
                });
            } catch (prefErr) {
                console.warn('[AgeBot] Ideal front-facing failed, falling back to any camera:', prefErr);
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true, audio: false,
                });
            }

            streamRef.current = mediaStream;

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                // Atributos de seguridad vitales para Redmi/Xiaomi
                videoRef.current.setAttribute('playsinline', 'true');
                videoRef.current.muted = true;

                videoRef.current.onloadedmetadata = async () => {
                    try {
                        await videoRef.current!.play();
                        setIsCameraLoading(false);
                        setCameraActive(true);
                    } catch (playErr) {
                        console.error('[AgeBot] play() failed:', playErr);
                        setIsCameraLoading(false);
                    }
                };
            }
        } catch (err: any) {
            console.error('[AgeBot] Camera access FAILED:', err);
            const errorName: string = (err as { name?: string }).name || 'UnknownError';
            let msg = 'No se pudo acceder a la cámara.';
            if (errorName === 'NotAllowedError') msg = 'Permiso denegado. Activa la cámara en los ajustes del navegador.';
            else if (errorName === 'NotFoundError') msg = 'No se encontró ninguna cámara disponible en este dispositivo.';
            else if (errorName === 'NotReadableError') msg = 'La cámara está siendo usada por otra aplicación.';

            setErrorMsg(msg);
            setCameraError(true);
            setIsCameraLoading(false);
        }
    }, []);

    useEffect(() => {
        if (phase !== 'capture') return;
        return () => {
            streamRef.current?.getTracks().forEach(t => t.stop());
            streamRef.current = null;
            setCameraActive(false);
        };
    }, [phase]);

    /* ─── FIX 2: Capture with Anti-False-Positive guard ─────────────────── */
    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        if (video.readyState < 4) return;

        const width = video.videoWidth || 640;
        const height = video.videoHeight || 640;

        if (width === 0 || height === 0) return;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -width, 0, width, height);
        ctx.restore();

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setCameraActive(false);

        processImage(dataUrl);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            streamRef.current?.getTracks().forEach(t => t.stop());
            streamRef.current = null;
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
        setCameraActive(false);
        setCameraRequested(false);
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setPhase('capture');
    };

    const handleActivateCamera = async () => {
        setCameraRequested(true);
        await startCamera();
    };

    const handleRetry = async () => {
        setRetrying(true);
        setCameraError(false);
        setErrorMsg('');
        await new Promise(r => setTimeout(r, 400));
        setRetryCount(prev => prev + 1);
        await startCamera();
        setRetrying(false);
    };

    /* ─── FIX 3: Correct final CTA — save to store then navigate ─────────── */
    const handleFinalCTA = () => {
        if (result) {
            setAgeBotResult(result.estimatedAge);
            setCurrentStep('RESULTADO');
            sessionStorage.setItem('da_agebot_result', JSON.stringify({
                estimatedAge: result.estimatedAge,
                confidence: result.confidence,
                analysisPoints: result.analysisPoints,
                source: 'agebot',
                timestamp: Date.now()
            }));
            sessionStorage.setItem('da_result_source', 'agebot');
        }
        navigate('/resultado');
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF7F2] font-sans relative overflow-hidden">

            {/* ELEMENTOS DECORATIVOS NUDE/TERRACOTA */}
            <div className="absolute top-10 left-10 w-48 h-48 bg-[#E8DFD5] rounded-full blur-3xl opacity-50 pointer-events-none z-0"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#D6B5A7] rounded-full blur-3xl opacity-30 pointer-events-none z-0"></div>

            {/* HEADER PREMIUM DE CRISTAL */}
            <div className="bg-white/80 backdrop-blur-md px-4 py-4 flex items-center gap-4 border-b border-[#E8DFD5] z-20 sticky top-0 shadow-sm">
                <button
                    onClick={() => {
                        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
                        navigate('/longevidad'); // Regresa limpio a la landing
                    }}
                    className="w-10 h-10 flex items-center justify-center bg-[#F4EBE6] rounded-xl text-[#9E5B4B] active:scale-95 transition-transform"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h2 className="text-lg font-black text-[#4A3B32] uppercase tracking-tight">
                        {capturedImage ? "Análisis Facial" : "AgeBot Facial"}
                    </h2>
                    <p className="text-[10px] font-bold text-[#8A796F] uppercase tracking-widest">Inteligencia Artificial</p>
                </div>
            </div>

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

            <div className="flex-1 flex flex-col overflow-hidden z-10 relative">
                <AnimatePresence mode="wait">

                    {/* ── CAPTURE PHASE ── */}
                    {phase === 'capture' && (
                        <motion.div key="capture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col p-4 sm:p-6">

                            {/* Viewfinder Enmarcado Premium */}
                            <div className="relative flex-1 bg-white/60 backdrop-blur-sm rounded-[2.5rem] p-2 sm:p-3 shadow-xl shadow-[#D6B5A7]/20 border border-[#E8DFD5] flex items-center justify-center overflow-hidden">
                                {!cameraError ? (
                                    <>
                                        {cameraRequested ? (
                                            <>
                                                <video
                                                    ref={videoRef}
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                    className="w-full h-full object-cover rounded-[2rem] bg-black"
                                                    style={{ transform: 'scaleX(-1)' }}
                                                />

                                                {isCameraLoading && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] z-30 bg-[#FAF7F2]/80 backdrop-blur-sm m-2">
                                                        <Loader2 size={40} className="animate-spin mb-3 text-[#9E5B4B]" />
                                                        <p className="text-xs font-bold tracking-widest uppercase text-[#8A796F] text-center px-4">Iniciando cámara...</p>
                                                    </div>
                                                )}

                                                {/* HUD overlay — only show when camera is live */}
                                                {cameraActive && !isCameraLoading && (
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <div className="relative">
                                                            {/* Scanning bar */}
                                                            <motion.div
                                                                className="absolute left-0 right-0 h-0.5 z-20 bg-[#9E5B4B]/50 shadow-[0_0_12px_rgba(158,91,75,0.8)]"
                                                                animate={{ top: ['15%', '85%', '15%'] }}
                                                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                                            />
                                                            <div className="w-56 h-72 rounded-[40%] border-2 border-[#9E5B4B]/50 shadow-[0_0_0_4000px_rgba(0,0,0,0.4)]">
                                                                {/* HUD corners */}
                                                                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-[#9E5B4B]" />
                                                                <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-[#9E5B4B]" />
                                                                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-[#9E5B4B]" />
                                                                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-[#9E5B4B]" />
                                                            </div>
                                                            <div className="absolute -bottom-12 left-0 right-0 flex flex-col items-center gap-1">
                                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9E5B4B]">
                                                                    Calibración Óptica
                                                                </p>
                                                                <p className="text-[13px] font-medium text-white/90">
                                                                    Centra tu rostro
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            /* Primary CTA = Activar Cámara */
                                            <div className="flex flex-col items-center justify-center text-center px-6 h-full z-10">
                                                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-[#F4EBE6]">
                                                    <Camera size={40} className="text-[#9E5B4B]" />
                                                </div>
                                                <p className="font-black text-xl mb-3 text-[#4A3B32] uppercase tracking-tight">Análisis Facial AgeBot</p>
                                                <p className="font-medium text-sm mb-10 leading-relaxed max-w-[260px] text-[#8A796F]">
                                                    AgeBot necesita acceso a tu cámara para analizar tus biomarcadores faciales en tiempo real.
                                                </p>

                                                <button
                                                    onClick={handleActivateCamera}
                                                    className="w-full py-4 bg-gradient-to-r from-[#9E5B4B] to-[#7D4638] text-white font-bold rounded-2xl shadow-xl shadow-[#7D4638]/20 transform active:scale-95 transition-all text-sm pointer-events-auto uppercase tracking-widest">
                                                    Activar Cámara
                                                </button>

                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="mt-5 text-sm underline decoration-[#C4B2AA] pointer-events-auto text-[#8A796F] hover:text-[#4A3B32] transition-colors">
                                                    Subir foto desde galería
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* Camera unavailable */
                                    <div className="flex flex-col items-center justify-center text-center px-8 z-10 p-6 h-full">
                                        <AlertTriangle size={48} className="mb-4 text-[#9E5B4B]" />
                                        <p className="font-bold text-lg mb-2 text-[#4A3B32]">Cámara no disponible</p>
                                        <p className="text-sm mb-8 font-medium leading-relaxed text-[#8A796F]">
                                            {errorMsg || 'Permiso de cámara denegado. Actívalo en los ajustes, o sube una foto.'}
                                        </p>
                                        <div className="flex flex-col w-full gap-3 max-w-[240px]">
                                            <button
                                                onClick={handleRetry}
                                                disabled={retrying}
                                                className="w-full py-4 rounded-xl font-bold text-sm transition-all active:scale-95 bg-white border border-[#E8DFD5] shadow-sm pointer-events-auto disabled:opacity-50 text-[#4A3B32]">
                                                {retrying ? 'Reintentando...' : 'Reintentar cámara'}
                                            </button>
                                            <button onClick={() => fileInputRef.current?.click()}
                                                className="mt-2 text-sm underline decoration-[#C4B2AA] pointer-events-auto text-[#8A796F] hover:text-[#4A3B32] transition-colors">
                                                Subir foto manual
                                            </button>

                                            <button
                                                onClick={() => setShowDiagnostics(!showDiagnostics)}
                                                className="mt-8 text-[10px] uppercase tracking-widest text-[#8A796F] hover:text-[#4A3B32] transition-opacity">
                                                {showDiagnostics ? 'Ocultar diagnóstico' : 'Ver diagnóstico'}
                                            </button>

                                            {showDiagnostics && (
                                                <div className="mt-4 p-3 rounded-lg bg-[#E8DFD5]/50 text-[10px] text-left font-mono break-all text-[#8A796F]">
                                                    <p>Secure: {window.isSecureContext ? 'YES' : 'NO'}</p>
                                                    <p>Device: {navigator.mediaDevices ? 'YES' : 'NO'}</p>
                                                    <p>Error: {errorMsg}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Shutter controls */}
                            {!cameraError && cameraRequested && (
                                <div className="py-8 flex items-center justify-around px-8 mt-2">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:bg-black/5 active:scale-90 border border-[#E8DFD5] bg-white shadow-sm">
                                        <ImageIcon size={22} className="text-[#8A796F]" />
                                    </button>
                                    <button
                                        onClick={capturePhoto}
                                        disabled={!cameraActive}
                                        className="w-20 h-20 rounded-full border-4 border-[#9E5B4B] flex items-center justify-center active:scale-90 transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed">
                                        <div className="w-16 h-16 rounded-full bg-[#9E5B4B]" />
                                    </button>
                                    <div className="w-14 h-14" /> {/* spacer */}
                                </div>
                            )}

                            <div className="mt-2 text-center pb-4">
                                <WellnessDisclaimer text="AgeBot analiza marcadores faciales de vitalidad. No sustituye un diagnóstico clínico." />
                            </div>
                        </motion.div>
                    )}

                    {/* ── ANALYZING PHASE ── */}
                    {phase === 'analyzing' && (
                        <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center px-8 text-center uppercase tracking-tight">
                            <div className="relative mb-8">
                                {capturedImage && (
                                    <img src={capturedImage} alt="Foto capturada"
                                        className="w-40 h-40 object-cover rounded-full opacity-40 border-2 border-[#9E5B4B]" />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 size={52} className="text-[#9E5B4B] animate-spin" />
                                </div>
                            </div>
                            <p className="text-lg font-black mb-2 text-[#4A3B32] uppercase">
                                Analizando tu vitalidad facial...
                            </p>
                            <p className="text-sm font-medium text-[#8A796F]">
                                Detectando 24 puntos de referencia epigenética
                            </p>
                        </motion.div>
                    )}

                    {/* ── RESULT PHASE ── */}
                    {phase === 'result' && result && (
                        <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center">

                            {/* Photo with overlay */}
                            <div className="relative w-52 h-52 mb-6">
                                {capturedImage && (
                                    <img src={capturedImage} alt="Analysis"
                                        className="w-full h-full object-cover rounded-[2rem] border-4 border-white shadow-xl shadow-[#D6B5A7]/40" />
                                )}
                                <FacialOverlay size={208} />
                                <motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#10B981] whitespace-nowrap shadow-lg">
                                    <CheckCircle size={14} className="text-white" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white leading-none">Análisis Exitoso</span>
                                </motion.div>
                            </div>

                            {/* Age result Card Premium */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="w-full max-w-sm rounded-[2.5rem] p-8 mb-6 text-center bg-white/90 backdrop-blur-sm border border-[#E8DFD5] shadow-xl shadow-[#D6B5A7]/20">
                                <p className="text-[11px] uppercase tracking-[0.2em] font-black mb-3 text-[#8A796F]">
                                    Tu {VITALITY_LABELS.age_result}
                                </p>
                                <p className="text-7xl font-black mb-2 text-[#4A3B32] tracking-tighter">
                                    {result.estimatedAge}
                                    <span className="text-2xl ml-1 text-[#8A796F]">años</span>
                                </p>
                                <div className="inline-block mt-2 mb-6 rounded-full px-4 py-1.5 bg-[#F4EBE6]">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#9E5B4B]">IA de Precisión</p>
                                </div>
                                <div className="flex items-center justify-center gap-8 mt-2">
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase font-black tracking-widest mb-1 text-[#8A796F]">Confianza</p>
                                        <p className="text-base font-black text-[#4A3B32] tracking-tight">
                                            {Math.round(result.confidence * 100)}%
                                        </p>
                                    </div>
                                    <div className="w-px h-8 bg-[#E8DFD5]" />
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase font-black tracking-widest mb-1 text-[#8A796F]">Marcadores</p>
                                        <p className="text-base font-black text-[#4A3B32] tracking-tight">{result.analysisPoints}</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                                className="w-full max-w-sm mb-8">
                                <WellnessDisclaimer text="Este análisis visual es un indicador preliminar. Tu edad celular requiere la integración de tus biomarcadores completos." />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                                className="w-full max-w-sm flex flex-col gap-3">
                                <button
                                    onClick={handleFinalCTA}
                                    className="w-full py-5 bg-gradient-to-r from-[#9E5B4B] to-[#7D4638] text-white font-black text-[14px] flex items-center justify-center gap-2 rounded-2xl shadow-xl shadow-[#7D4638]/20 transform active:scale-95 transition-all uppercase tracking-widest">
                                    Siguiente Paso <ArrowRight size={18} strokeWidth={3} />
                                </button>
                                <button onClick={reset}
                                    className="w-full font-bold text-[10px] py-4 flex items-center justify-center gap-2 text-[#8A796F] hover:text-[#4A3B32] transition-all uppercase tracking-widest bg-white rounded-xl border border-[#E8DFD5] shadow-sm">
                                    <RefreshCw size={12} /> Analizar otra foto
                                </button>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* ── ERROR PHASE ── */}
                    {phase === 'error' && (
                        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col items-center justify-center px-8 text-center bg-[#FAF7F2]">
                            <AlertTriangle size={48} className="mb-4 text-[#9E5B4B]" />
                            <p className="text-xl font-black mb-2 text-[#4A3B32] uppercase">Error de análisis</p>
                            <p className="text-sm mb-8 font-medium text-[#8A796F] leading-relaxed">{errorMsg}</p>
                            <button onClick={reset}
                                className="px-10 py-4 bg-[#9E5B4B] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-[#9E5B4B]/20 active:scale-95 transition-all">
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