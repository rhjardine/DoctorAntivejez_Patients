import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, RefreshCw, Sparkles, AlertTriangle, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

const AgeBotFacialPage: React.FC = () => {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    // Inicialización ultra-segura de la cámara (Compatible con Redmi/Xiaomi/iOS)
    const startCamera = async () => {
        setCameraError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            });

            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                // ATRIBUTOS CRÍTICOS PARA REDMI/XIAOMI
                videoRef.current.setAttribute('playsinline', 'true');
                videoRef.current.muted = true;

                // Promesa controlada para evitar bloqueos
                await videoRef.current.play().catch(e => {
                    console.error("Error reproduciendo video:", e);
                });
            }
        } catch (err: any) {
            console.error("Error accediendo a la cámara:", err);
            setCameraError('No pudimos acceder a tu cámara. Por favor verifica los permisos de tu navegador.');
        }
    };

    useEffect(() => {
        startCamera();
        return () => {
            // Limpieza segura del stream al salir de la vista
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = canvas.toDataURL('image/jpeg');
                setPhoto(imageData);
            }
        }
    };

    const retakePhoto = () => {
        setPhoto(null);
    };

    const analyzePhoto = () => {
        setIsAnalyzing(true);
        // Simulación de análisis con IA para redireccionar luego a los resultados
        setTimeout(() => {
            setIsAnalyzing(false);
            // Apagamos la cámara antes de navegar
            if (stream) stream.getTracks().forEach(track => track.stop());
            navigate('/resultado');
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-[#FAF7F2] flex flex-col font-sans">
            {/* HEADER */}
            <div className="bg-white/80 backdrop-blur-md px-4 py-4 flex items-center gap-4 border-b border-[#E8DFD5] z-10 sticky top-0">
                <button
                    onClick={() => {
                        if (stream) stream.getTracks().forEach(track => track.stop());
                        navigate('/longevidad');
                    }}
                    className="w-10 h-10 flex items-center justify-center bg-[#F4EBE6] rounded-xl text-[#9E5B4B] active:scale-95 transition-transform"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h2 className="text-lg font-black text-[#4A3B32] uppercase tracking-tight">AgeBot IA</h2>
                    <p className="text-[10px] font-bold text-[#8A796F] uppercase tracking-widest">Análisis Epigenético Facial</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                {/* ELEMENTOS DECORATIVOS NUDE/TERRACOTA */}
                <div className="absolute top-10 left-10 w-48 h-48 bg-[#E8DFD5] rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#D6B5A7] rounded-full blur-3xl opacity-30 pointer-events-none"></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-sm flex flex-col items-center z-10"
                >
                    {cameraError ? (
                        <div className="bg-rose-50 border-2 border-rose-200 rounded-[2rem] p-6 text-center shadow-lg w-full mb-6">
                            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                            <h3 className="text-lg font-black text-rose-800 mb-2">Cámara Bloqueada</h3>
                            <p className="text-sm text-rose-600 mb-4">{cameraError}</p>
                            <button onClick={startCamera} className="bg-rose-500 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md">
                                Reintentar
                            </button>
                        </div>
                    ) : (
                        <div className="relative w-full aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#7D4638]/20 border-[6px] border-white bg-[#E8DFD5] mb-8">

                            {!photo ? (
                                // MODO CÁMARA (Atributos autoPlay, playsInline y muted son obligatorios en Redmi)
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                />
                            ) : (
                                // MODO FOTO CAPTURADA
                                <div className="relative w-full h-full">
                                    <img src={photo} alt="Rostro capturado" className="w-full h-full object-cover transform scale-x-[-1]" />
                                    {isAnalyzing && (
                                        <div className="absolute inset-0 bg-[#4A3B32]/70 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                            <BrainCircuit className="w-16 h-16 text-[#E8C5B8] animate-pulse mb-4" />
                                            <h3 className="text-lg font-black uppercase tracking-widest">Escaneando...</h3>
                                            <p className="text-xs font-medium text-[#D6B5A7]">Evaluando marcadores de estrés oxidativo</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Marco de Escaneo (Overlay decorativo) */}
                            {!photo && (
                                <div className="absolute inset-0 border-2 border-[#9E5B4B]/30 m-4 rounded-[2rem] pointer-events-none">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#9E5B4B] rounded-tl-[1.5rem]"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#9E5B4B] rounded-tr-[1.5rem]"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#9E5B4B] rounded-bl-[1.5rem]"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#9E5B4B] rounded-br-[1.5rem]"></div>
                                </div>
                            )}

                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                    )}

                    {/* CONTROLES */}
                    {!cameraError && (
                        <div className="w-full">
                            {!photo ? (
                                <button
                                    onClick={takePhoto}
                                    className="w-full bg-gradient-to-r from-[#9E5B4B] to-[#7D4638] text-white py-5 rounded-[2rem] shadow-xl shadow-[#7D4638]/30 flex items-center justify-center gap-3 active:scale-95 transition-transform"
                                >
                                    <Camera className="w-6 h-6" />
                                    <span className="text-sm font-black uppercase tracking-widest">Capturar Rostro</span>
                                </button>
                            ) : (
                                <div className="flex gap-4">
                                    <button
                                        onClick={retakePhoto}
                                        disabled={isAnalyzing}
                                        className="flex-1 bg-white text-[#8A796F] py-4 rounded-2xl border border-[#E8DFD5] shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Retomar</span>
                                    </button>
                                    <button
                                        onClick={analyzePhoto}
                                        disabled={isAnalyzing}
                                        className="flex-1 bg-[#4A3B32] text-white py-4 rounded-2xl shadow-xl shadow-[#4A3B32]/20 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
                                    >
                                        <Sparkles className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                                        <span className="text-xs font-black uppercase tracking-widest">
                                            {isAnalyzing ? 'Procesando' : 'Analizar IA'}
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default AgeBotFacialPage;