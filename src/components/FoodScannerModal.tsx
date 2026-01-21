import React, { useRef, useState, useEffect } from 'react';
import { X, Camera, RefreshCw, CheckCircle, AlertTriangle, XCircle, Zap, Loader2, Image as ImageIcon } from 'lucide-react';
import { analyzeFoodImage, FoodAnalysisResult } from '../services/geminiService';
import { COLORS } from '../types';

interface FoodScannerModalProps {
  onClose: () => void;
}

const FoodScannerModal: React.FC<FoodScannerModalProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("No se pudo acceder a la cámara. Verifica los permisos.");
      }
    };

    if (!capturedImage) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [capturedImage]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Match canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        analyzeImage(imageDataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCapturedImage(base64String);
        analyzeImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeFoodImage(base64);
      setResult(analysis);
    } catch (err) {
      setError("Error al analizar la imagen. Intenta enfocar mejor la etiqueta o el alimento.");
      setCapturedImage(null); // Reset to allow retry
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScanner = () => {
    setCapturedImage(null);
    setResult(null);
    setError(null);
  };

  // Helper to render result badge
  const renderRecommendationBadge = (status: string) => {
    switch (status) {
      case 'RECOMMENDED':
        return (
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold">
            <CheckCircle size={20} />
            <span>Recomendado</span>
          </div>
        );
      case 'MODERATE':
        return (
          <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold">
            <AlertTriangle size={20} />
            <span>Consumo Moderado</span>
          </div>
        );
      case 'AVOID':
        return (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full font-bold">
            <XCircle size={20} />
            <span>Evitar</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/70 to-transparent text-white pt-safe-top">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Zap size={20} className="text-accentYellow" />
          Escáner IA
        </h2>
        <button onClick={onClose} className="p-2 bg-white/20 rounded-full backdrop-blur-md">
          <X size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-black flex flex-col justify-center overflow-hidden">
        
        {/* Hidden Canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* 1. Camera View */}
        {!capturedImage && !error && (
          <div className="relative h-full w-full">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="h-full w-full object-cover"
            />
            {/* Viewfinder Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary -mb-1 -mr-1"></div>
              </div>
              <p className="absolute bottom-24 text-white/80 text-sm font-medium bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                Apunta al alimento o tabla nutricional
              </p>
            </div>
          </div>
        )}

        {/* 2. Analyzing State */}
        {capturedImage && isAnalyzing && (
          <div className="absolute inset-0 z-20 bg-black/90 flex flex-col items-center justify-center text-white p-6 text-center">
            <div className="relative mb-6">
              <img src={capturedImage} alt="Capture" className="w-32 h-32 object-cover rounded-2xl opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={48} className="text-primary animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Analizando con IA...</h3>
            <p className="text-gray-400 text-sm">Examinando ingredientes y densidad nutricional.</p>
          </div>
        )}

        {/* 3. Results View */}
        {result && !isAnalyzing && (
          <div className="absolute inset-0 z-20 bg-pearlyGray flex flex-col pt-20 pb-8 px-4 overflow-y-auto">
             <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 mb-6 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Product & Verdict */}
                <div className="flex flex-col items-center mb-6 text-center">
                   <div className="w-24 h-24 rounded-2xl overflow-hidden mb-4 shadow-md border-2 border-white">
                      <img src={capturedImage!} alt="Analyzed Food" className="w-full h-full object-cover" />
                   </div>
                   <h2 className="text-xl font-bold text-darkBlue mb-2">{result.productName}</h2>
                   {renderRecommendationBadge(result.recommendation)}
                   <p className="mt-3 text-sm text-textMedium leading-relaxed">
                     {result.reasoning}
                   </p>
                </div>

                {/* Macros Grid */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                   <div className="bg-gray-50 p-3 rounded-xl text-center">
                      <span className="block text-xs text-textLight uppercase font-bold mb-1">Azúcar</span>
                      <span className="text-sm font-bold text-darkBlue">{result.macros.sugar}</span>
                   </div>
                   <div className="bg-gray-50 p-3 rounded-xl text-center">
                      <span className="block text-xs text-textLight uppercase font-bold mb-1">Carbos</span>
                      <span className="text-sm font-bold text-darkBlue">{result.macros.carbs}</span>
                   </div>
                   <div className="bg-gray-50 p-3 rounded-xl text-center">
                      <span className="block text-xs text-textLight uppercase font-bold mb-1">Proteína</span>
                      <span className="text-sm font-bold text-darkBlue">{result.macros.protein}</span>
                   </div>
                </div>

                {/* Inflammatory Warning */}
                {result.inflammatoryIngredients.length > 0 ? (
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                     <h4 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                        <AlertTriangle size={16} />
                        Ingredientes Inflamatorios
                     </h4>
                     <div className="flex flex-wrap gap-2">
                        {result.inflammatoryIngredients.map((ing, idx) => (
                           <span key={idx} className="text-xs bg-white text-red-600 px-2 py-1 rounded border border-red-100 font-medium">
                             {ing}
                           </span>
                        ))}
                     </div>
                  </div>
                ) : (
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3">
                     <CheckCircle size={20} className="text-green-600" />
                     <p className="text-sm font-medium text-green-800">No se detectaron ingredientes altamente inflamatorios.</p>
                  </div>
                )}
             </div>

             <button 
                onClick={resetScanner}
                className="w-full bg-darkBlue text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-primary transition-colors"
             >
                <RefreshCw size={20} />
                Escanear Otro
             </button>
          </div>
        )}

        {/* Error State */}
        {error && (
           <div className="absolute inset-0 z-20 bg-black/90 flex flex-col items-center justify-center text-white p-6 text-center">
              <AlertTriangle size={48} className="text-red-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Algo salió mal</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <button 
                 onClick={resetScanner}
                 className="bg-white text-darkBlue px-6 py-3 rounded-full font-bold"
              >
                 Intentar de nuevo
              </button>
           </div>
        )}

      </div>

      {/* Controls Footer (Only visible when camera is active) */}
      {!capturedImage && !error && (
        <div className="bg-black p-6 pb-10 flex justify-around items-center">
           <label className="p-4 rounded-full bg-white/10 text-white cursor-pointer hover:bg-white/20 transition-all">
              <ImageIcon size={24} />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
           </label>

           <button 
             onClick={capturePhoto}
             className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group"
           >
              <div className="w-16 h-16 bg-white rounded-full group-active:scale-90 transition-transform"></div>
           </button>

           <button onClick={onClose} className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
              <X size={24} />
           </button>
        </div>
      )}
    </div>
  );
};

export default FoodScannerModal;