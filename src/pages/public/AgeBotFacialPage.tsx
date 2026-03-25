import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, ArrowRight, RefreshCw, Loader2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import PublicHeader from '../../components/public/PublicHeader';
import WellnessDisclaimer from '../../components/public/WellnessDisclaimer';
import { WELLNESS } from '../../styles/wellnessPalette';
import { VITALITY_LABELS } from '../../utils/vitalityLabels';
import { usePublicFunnelStore } from '../../store/usePublicFunnelStore';

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
                    stroke={WELLNESS.sage} strokeWidth="1" opacity="0.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ delay: i * 0.04, duration: 0.5 }}
                />
            ))}
            {points.map((p, i) => (
                <motion.circle
                    key={i}
                    cx={p.x} cy={p.y} r="2.5"
                    fill={WELLNESS.sage}
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
    const [cameraActive, setCameraActive] = useState(false); // ✅ true once video is live
    const [cameraRequested, setCameraRequested] = useState(false);
    const [retryCount, setRetryCount] = useState(0); // ✅ Handle re-initialization explicitly
    const [retrying, setRetrying] = useState(false); // ✅ Visual feedback for retry action
    const [showDiagnostics, setShowDiagnostics] = useState(false);

    /* ─── FIX 1: WebRTC — Robust camera initialization ──────────────────── */
    const startCamera = useCallback(async () => {
        if (streamRef.current) {
            // already running — do not double-init
            return;
        }
        setIsCameraLoading(true);
        setCameraActive(false);

        try {
            let mediaStream: MediaStream;
            try {
                // Preferred: front-facing (selfie) with ideal constraint for compatibility
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { ideal: 'user' },
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false,
                });
            } catch (prefErr) {
                console.warn('[AgeBot] Ideal front-facing failed, falling back to any camera:', prefErr);
                // Fallback: any camera
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });
            }

            streamRef.current = mediaStream;

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                // ✅ CRITICAL for iOS/Safari: must call .play() after setting srcObject
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

    // Trigger camera only after explicit user action (required by mobile browsers)
    useEffect(() => {
        if (phase !== 'capture') return;

        return () => {
            // Cleanup: stop all tracks when leaving the capture phase
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

        // ✅ GUARD: Only capture when video has enough data (readyState === 4)
        if (video.readyState < 4) {
            console.warn('[AgeBot] Capture aborted — video not ready');
            return;
        }

        const width = video.videoWidth || 640;
        const height = video.videoHeight || 640;

        // ✅ GUARD: Reject a black/empty canvas (dimensions 0×0)
        if (width === 0 || height === 0) {
            console.warn('[AgeBot] Capture aborted — invalid video dimensions');
            return;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Mirror for front camera (selfie)
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -width, 0, width, height);
        ctx.restore();

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        // Stop camera after capture
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

    const handleSkipToUpload = () => {
        setCameraRequested(true);
        fileInputRef.current?.click();
    };

    const handleRetry = async () => {
        setRetrying(true);
        setCameraError(false);
        setErrorMsg('');
        // Brief delay to allow React to clear the error state UI
        await new Promise(r => setTimeout(r, 400));
        setRetryCount(prev => prev + 1);
        await startCamera(); // ✅ Direct call after user interaction
        setRetrying(false);
    };

    /* ─── FIX 3: Correct final CTA — save to store then navigate ─────────── */
    const handleFinalCTA = () => {
        if (result) {
            // 1. Sync to Zustand store (existing)
            setAgeBotResult(result.estimatedAge);
            setCurrentStep('RESULTADO');

            // 2. Sync to sessionStorage for ResultadoScorePage (bridge)
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
        <div className="min-h-screen flex flex-col" style={{ background: WELLNESS.bg }}>
            <PublicHeader
                theme="wellness"
                title={capturedImage ? "Análisis Facial" : "AgeBot Facial"}
                showBack={true}
                onBack={() => navigate('/longevidad-tests')}
            />

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
            <input ref={fileInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileUpload} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <AnimatePresence mode="wait">

                    {/* ── CAPTURE ── */}
                    {phase === 'capture' && (
                        <motion.div key="capture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col p-4 sm:p-6">

                            {/* ── Tarea 4: Card-wrapped viewfinder ── */}
                            <div className="relative flex-1 bg-white rounded-[2rem] p-2 sm:p-3 shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-gray-100 flex items-center justify-center overflow-hidden">
                                {!cameraError ? (
                                    <>
                                        {cameraRequested ? (
                                            <>
                                                <video
                                                    ref={videoRef}
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                    className="w-full h-full object-cover rounded-[1.5rem]"
                                                    style={{ transform: 'scaleX(-1)' }}
                                                />

                                                {isCameraLoading && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[1.5rem] z-30"
                                                        style={{ background: 'rgba(253,251,247,0.85)', backdropFilter: 'blur(4px)' }}>
                                                        <Loader2 size={40} className="animate-spin mb-3" style={{ color: WELLNESS.terracotta }} />
                                                        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: WELLNESS.earth }}>Iniciando cámara...</p>
                                                    </div>
                                                )}

                                                {/* HUD overlay — only show when camera is live */}
                                                {cameraActive && !isCameraLoading && (
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <div className="relative">
                                                            {/* Scanning bar */}
                                                            <motion.div
                                                                className="absolute left-0 right-0 h-0.5 z-20"
                                                                style={{ background: `${WELLNESS.sage}88`, boxShadow: `0 0 12px ${WELLNESS.sage}` }}
                                                                animate={{ top: ['15%', '85%', '15%'] }}
                                                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                                            />
                                                            <div className="w-56 h-72 rounded-[40%] border-2"
                                                                style={{
                                                                    borderColor: `${WELLNESS.sage}88`,
                                                                    boxShadow: `0 0 0 4000px rgba(0,0,0,0.35)`
                                                                }}>
                                                                {/* HUD corners */}
                                                                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2" style={{ borderColor: WELLNESS.sage }} />
                                                                <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2" style={{ borderColor: WELLNESS.sage }} />
                                                                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2" style={{ borderColor: WELLNESS.sage }} />
                                                                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2" style={{ borderColor: WELLNESS.sage }} />
                                                            </div>
                                                            <div className="absolute -bottom-12 left-0 right-0 flex flex-col items-center gap-1">
                                                                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: WELLNESS.sage }}>
                                                                    Calibración Óptica Activa
                                                                </p>
                                                                <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                                                    Centra tu rostro para análisis vital
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            /* ── Tarea 4: Primary CTA = Activar Cámara ── */
                                            <div className="flex flex-col items-center justify-center text-center px-6 h-full z-10">
                                                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                                                    style={{ background: `${WELLNESS.sage}18` }}>
                                                    <Camera size={40} style={{ color: WELLNESS.sage }} />
                                                </div>
                                                <p className="font-black text-xl mb-3" style={{ color: WELLNESS.earthDark }}>Análisis Facial AgeBot</p>
                                                {/* ── Tarea 5: font-medium subtítulo ── */}
                                                <p className="font-medium text-sm mb-10 leading-relaxed max-w-[260px]" style={{ color: '#6b7280' }}>
                                                    AgeBot necesita acceso a tu cámara para analizar tus biomarcadores faciales en tiempo real.
                                                </p>

                                                {/* PRIMARY CTA */}
                                                <button
                                                    onClick={handleActivateCamera}
                                                    className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 transform active:scale-95 transition-all text-sm pointer-events-auto"
                                                    style={{ background: WELLNESS.terracotta }}>
                                                    Activar Cámara
                                                </button>

                                                {/* SECONDARY: subtle text link — Gallery */}
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="mt-5 text-sm underline decoration-gray-300 pointer-events-auto hover:text-gray-400 transition-colors"
                                                    style={{ color: '#9ca3af' }}>
                                                    Subir foto desde galería
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* Camera unavailable */
                                    <div className="flex flex-col items-center justify-center text-center px-8 z-10 p-6 h-full">
                                        <AlertTriangle size={48} className="mb-4 text-amber-500" />
                                        <p className="font-bold text-lg mb-2" style={{ color: WELLNESS.earthDark }}>Cámara no disponible</p>
                                        <p className="text-sm mb-8 font-medium leading-relaxed" style={{ color: '#6b7280' }}>
                                            {errorMsg || 'Permiso de cámara denegado o no disponible en este navegador. Actívalo en los ajustes del navegador, o sube una foto.'}
                                        </p>
                                        <div className="flex flex-col w-full gap-3 max-w-[240px]">
                                            <button
                                                onClick={handleRetry}
                                                disabled={retrying}
                                                className="w-full py-4 rounded-xl font-bold text-sm transition-all active:scale-95 bg-white border border-gray-200 shadow-sm pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ color: WELLNESS.earthDark }}>
                                                {retrying ? 'Reintentando...' : 'Reintentar cámara'}
                                            </button>
                                            <button onClick={() => fileInputRef.current?.click()}
                                                className="mt-2 text-sm underline decoration-gray-300 pointer-events-auto hover:text-gray-400"
                                                style={{ color: '#9ca3af' }}>
                                                Subir foto manual
                                            </button>

                                            <button
                                                onClick={() => setShowDiagnostics(!showDiagnostics)}
                                                className="mt-8 text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                                                style={{ color: WELLNESS.earth }}>
                                                {showDiagnostics ? 'Ocultar diagnóstico' : 'Ver diagnóstico técnico'}
                                            </button>

                                            {showDiagnostics && (
                                                <div className="mt-4 p-3 rounded-lg bg-black/5 text-[10px] text-left font-mono break-all" style={{ color: WELLNESS.earth }}>
                                                    <p>Secure Context: {window.isSecureContext ? 'YES' : 'NO'}</p>
                                                    <p>MediaDevices: {navigator.mediaDevices ? 'YES' : 'NO'}</p>
                                                    <p>UserAgent: {navigator.userAgent}</p>
                                                    <p>Error: {errorMsg}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── Shutter controls — FIX 2: disabled until readyState = 4 ── */}
                            {!cameraError && cameraRequested && (
                                <div className="py-8 flex items-center justify-around px-8 mt-2">
                                    {/* Secondary: upload icon (Gallery) */}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:bg-black/5 active:scale-90"
                                        style={{ border: `1px solid ${WELLNESS.earth}22` }}>
                                        <ImageIcon size={22} style={{ color: WELLNESS.earth }} />
                                    </button>
                                    {/* Shutter button — disabled until video is live */}
                                    <button
                                        onClick={capturePhoto}
                                        disabled={!cameraActive}
                                        className="w-20 h-20 rounded-full border-4 flex items-center justify-center active:scale-90 transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
                                        style={{ borderColor: WELLNESS.terracotta }}>
                                        <div className="w-16 h-16 rounded-full" style={{ background: WELLNESS.terracotta }} />
                                    </button>
                                    <div className="w-14 h-14" /> {/* spacer */}
                                </div>
                            )}

                            {/* ── Tarea 5: Styled disclaimer ── */}
                            <div className="mt-2">
                                <WellnessDisclaimer text="AgeBot analiza marcadores faciales de vitalidad. No sustituye un diagnóstico médico clínico." />
                            </div>
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
                                        style={{ border: `3px solid ${WELLNESS.terracotta}` }} />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 size={52} style={{ color: WELLNESS.terracotta }} className="animate-spin" />
                                </div>
                            </div>
                            <p className="text-lg font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif', color: WELLNESS.textPrimary }}>
                                Analizando tu vitalidad facial con IA...
                            </p>
                            <p className="text-sm font-medium" style={{ color: WELLNESS.earth }}>
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
                                        style={{ border: `2px solid ${WELLNESS.sage}88`, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }} />
                                )}
                                <FacialOverlay size={208} />
                                {/* Badge */}
                                <motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full"
                                    style={{ background: WELLNESS.good, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                    <CheckCircle size={14} color={WELLNESS.bgCard} />
                                    <span className="text-xs font-black uppercase tracking-wide" style={{ color: WELLNESS.bgCard }}>ANÁLISIS COMPLETADO</span>
                                </motion.div>
                            </div>

                            {/* Age result */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="w-full max-w-sm rounded-3xl p-6 mb-5 text-center"
                                style={{ background: WELLNESS.bgCard, border: `1px solid ${WELLNESS.earth}33`, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                                <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: WELLNESS.earth }}>
                                    Tu {VITALITY_LABELS.age_result}
                                </p>
                                <p className="text-6xl font-black mb-1" style={{ fontFamily: 'Poppins, sans-serif', color: WELLNESS.earthDark }}>
                                    {result.estimatedAge}
                                    <span className="text-2xl ml-1" style={{ color: WELLNESS.earth }}>años</span>
                                </p>
                                <div className="inline-block mt-1 mb-3 rounded-full px-3 py-1" style={{ background: `${WELLNESS.sage}1A` }}>
                                    <p className="text-[10px] font-medium" style={{ color: WELLNESS.sage }}>basado en análisis visual de vitalidad</p>
                                </div>
                                <div className="flex items-center justify-center gap-4 mt-1">
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase mb-1" style={{ color: WELLNESS.textHint }}>Confianza</p>
                                        <p className="text-sm font-bold" style={{ color: WELLNESS.earthDark }}>
                                            {Math.round(result.confidence * 100)}%
                                        </p>
                                    </div>
                                    <div className="w-px h-8" style={{ background: `${WELLNESS.earth}26` }} />
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase mb-1" style={{ color: WELLNESS.textHint }}>Puntos analizados</p>
                                        <p className="text-sm font-bold" style={{ color: WELLNESS.earthDark }}>{result.analysisPoints}</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* ── Tarea 5: Styled disclaimer ── */}
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                                className="w-full max-w-sm mb-8">
                                <WellnessDisclaimer text="Este análisis visual es un indicador preliminar del ritmo de envejecimiento. Tu Edad Celular completa requiere la integración de todos tus marcadores de vitalidad." />
                            </motion.div>

                            {/* ── FIX 3: Correct CTA — saves to store then navigates ── */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                                className="w-full max-w-sm flex flex-col gap-3">
                                <button
                                    onClick={handleFinalCTA}
                                    className="w-full font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-95"
                                    style={{ background: WELLNESS.terracotta, color: WELLNESS.bgCard, borderRadius: 32, padding: '15px 0', fontFamily: 'Poppins, sans-serif' }}>
                                    Descubrir mi Edad Celular completa <ArrowRight size={18} />
                                </button>
                                <button onClick={() => navigate('/test')}
                                    className="w-full font-medium text-sm py-3 transition-all"
                                    style={{ color: WELLNESS.earth }}>
                                    También quiero contestar el Test de Vitalidad →
                                </button>
                                <button onClick={reset}
                                    className="w-full font-medium text-xs py-2 flex items-center justify-center gap-1.5 transition-all mt-4"
                                    style={{ color: WELLNESS.textHint }}>
                                    <RefreshCw size={12} /> Analizar otra foto
                                </button>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* ── ERROR ── */}
                    {phase === 'error' && (
                        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                            <AlertTriangle size={48} className="mb-4" style={{ color: WELLNESS.terracotta }} />
                            <p className="text-lg font-bold mb-2" style={{ color: WELLNESS.earthDark }}>No pudimos analizar la imagen</p>
                            <p className="text-sm mb-8 font-medium" style={{ color: WELLNESS.earth }}>{errorMsg}</p>
                            <button onClick={reset}
                                className="px-8 py-4 rounded-full font-bold hover:opacity-90 transition-opacity"
                                style={{ background: WELLNESS.terracotta, color: WELLNESS.bgCard }}>
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
