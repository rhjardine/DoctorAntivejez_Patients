import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Dna, Filter, Database, Activity, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BiomicsPage: React.FC = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

    // Particle animation logic
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: any[] = [];
        const particleCount = 150; // Performance optimized count

        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            color: string;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;

                // Omics colors: Blue, Green, Orange (Methylation, Expression, Metabolic)
                const colors = ['#3B82F6', '#10B981', '#F59E0B'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvas!.width) this.x = 0;
                if (this.x < 0) this.x = canvas!.width;
                if (this.y > canvas!.height) this.y = 0;
                if (this.y < 0) this.y = canvas!.height;
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Draw background gradient (dark blue to lighter blue)
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#1e3a8a');
            gradient.addColorStop(1, '#172554');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="relative w-full h-full bg-darkBlue overflow-hidden">
            {/* Background Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-60" />

            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-darkBlue/80 backdrop-blur-md border-b border-white/10">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-sky-500/20 p-2 rounded-lg">
                            <Dna className="text-sky-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-white font-black text-lg uppercase tracking-wide leading-none">Explorador Ómico</h1>
                            <p className="text-[10px] text-sky-200 font-bold uppercase tracking-wider">Dataset: 24,500 puntos (WebGL)</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors">
                            <Filter size={20} />
                        </button>
                        <button className="p-2 bg-sky-500 rounded-lg text-white font-bold shadow-lg shadow-sky-500/30">
                            <Activity size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* HUD Overlay */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                {/* Central Focus (Optional Visualization Mockup) */}
            </div>

            {/* Floating Cards (Bottom) */}
            <div className="absolute bottom-24 left-0 right-0 z-10 px-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-darkBlue/80 backdrop-blur-xl border border-sky-500/30 p-4 rounded-2xl shadow-xl"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Dna size={14} className="text-sky-400" />
                            <span className="text-[10px] font-black text-white uppercase tracking-wider">Saturación Epigenética</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-sky-400">0.742</span>
                            <span className="text-[10px] font-bold text-emerald-400 mb-1.5 uppercase">Estable</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-darkBlue/80 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-2xl shadow-xl"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <RefreshCw size={14} className="text-emerald-400" />
                            <span className="text-[10px] font-black text-white uppercase tracking-wider">Tasa de Renovación</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-emerald-400">12.4%</span>
                            <span className="text-[10px] font-bold text-sky-400 mb-1.5 uppercase">Óptimo</span>
                        </div>
                    </motion.div>
                </div>

                {/* Filter Bar */}
                <div className="flex justify-center gap-6 py-2 bg-darkBlue/90 backdrop-blur-sm rounded-full border border-white/5 mx-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Metilación</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Expresión</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Metabólico</span>
                    </div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute right-4 bottom-44 z-20"
            >
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-xl">
                    <span className="text-[9px] font-black text-white uppercase flex items-center gap-2">
                        <Filter size={12} /> Filtros Ómicos
                    </span>
                </div>
            </motion.div>
        </div>
    );
};

export default BiomicsPage;
