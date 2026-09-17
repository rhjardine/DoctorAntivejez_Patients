/**
 * Inferencia local de edad aparente.
 *
 * Lo que se prueba aquí es el contrato que el paciente percibe: que la
 * librería no se carga hasta que hace falta, que los tres desenlaces de
 * detección se distinguen entre sí, que un fallo al descargar los pesos no se
 * confunde con un fallo de encuadre, y que la salida remota está apagada salvo
 * activación explícita.
 *
 * `@vladmandic/face-api` se sustituye por un doble: jsdom no implementa
 * `canvas.getContext`, y lo que importa comprobar no es TensorFlow sino cómo
 * se traduce su respuesta a lo que ve el paciente.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

/** Cuántas veces se ha evaluado el módulo: mide la carga diferida. */
let vecesImportado = 0;
/** Detecciones que devolverá el doble en la siguiente llamada. */
let deteccionesSimuladas: Array<{ score: number }> = [];
/** Si está activo, `loadFromUri` falla como si no hubiera red. */
let fallarCargaPesos = false;
let edadSimulada = 41.6;

const cargasDePesos: string[] = [];

vi.mock('@vladmandic/face-api', () => {
    vecesImportado += 1;
    const cargar = async (uri: string) => {
        if (fallarCargaPesos) throw new Error('fetch failed');
        cargasDePesos.push(uri);
    };
    return {
        nets: {
            tinyFaceDetector: { loadFromUri: cargar },
            ageGenderNet: {
                loadFromUri: cargar,
                predictAgeAndGender: async () => ({ age: edadSimulada, gender: 'female' }),
            },
        },
        TinyFaceDetectorOptions: class {
            constructor(public opts?: unknown) {}
        },
        detectAllFaces: async () => deteccionesSimuladas,
        extractFaces: async (_src: unknown, dets: unknown[]) =>
            dets.map(() => ({ width: 62, height: 62 })),
    };
});

import {
    calcularDimensiones,
    cargarAnalizador,
    estimarEdadLocal,
    ErrorCargaModelo,
    MAX_LADO,
    _resetAnalizador,
} from '../services/localFaceAgeService';
import { featureFlags } from '../config/featureFlags';

/** Sustituto de un canvas: el doble de face-api nunca lo dibuja. */
const lienzoFalso = {} as HTMLCanvasElement;

beforeEach(() => {
    _resetAnalizador();
    deteccionesSimuladas = [];
    fallarCargaPesos = false;
    edadSimulada = 41.6;
    cargasDePesos.length = 0;
});

describe('carga diferida', () => {
    it('no importa la librería hasta que se pide un análisis', () => {
        // El módulo de servicio ya está importado por este propio test y aun
        // así el doble no se ha evaluado: la referencia vive dentro de un
        // import() que nadie ha ejecutado todavía.
        expect(vecesImportado).toBe(0);
    });

    it('la carga se comparte entre llamadas concurrentes y se memoiza', async () => {
        deteccionesSimuladas = [{ score: 0.9 }];

        const [a, b] = await Promise.all([cargarAnalizador(), cargarAnalizador()]);
        expect(a).toBe(b);

        await cargarAnalizador();
        // Dos redes × una sola carga, aunque se haya pedido tres veces.
        expect(cargasDePesos).toHaveLength(2);
        expect(cargasDePesos.every(uri => uri === '/models')).toBe(true);
    });
});

describe('estados de detección', () => {
    it('0 rostros → pide reencuadrar, sin inventar una edad', async () => {
        deteccionesSimuladas = [];
        const r = await estimarEdadLocal(lienzoFalso);
        expect(r.estado).toBe('sin-rostro');
        expect(r).not.toHaveProperty('estimatedAge');
    });

    it('1 rostro → devuelve la edad redondeada y la confianza real del detector', async () => {
        deteccionesSimuladas = [{ score: 0.87 }];
        edadSimulada = 41.6;

        const r = await estimarEdadLocal(lienzoFalso);
        expect(r.estado).toBe('ok');
        if (r.estado !== 'ok') throw new Error('estado inesperado');
        expect(r.estimatedAge).toBe(42);
        expect(r.confidence).toBe(0.87);
    });

    it('>1 rostros → no elige uno por su cuenta, pide una sola persona', async () => {
        deteccionesSimuladas = [{ score: 0.9 }, { score: 0.8 }, { score: 0.7 }];

        const r = await estimarEdadLocal(lienzoFalso);
        expect(r.estado).toBe('varios-rostros');
        if (r.estado !== 'varios-rostros') throw new Error('estado inesperado');
        expect(r.total).toBe(3);
        expect(r).not.toHaveProperty('estimatedAge');
    });

    it('una edad no utilizable se reporta como fallo, no como resultado', async () => {
        deteccionesSimuladas = [{ score: 0.9 }];
        edadSimulada = Number.NaN;

        await expect(estimarEdadLocal(lienzoFalso)).rejects.toThrow(/edad utilizable/i);
    });
});

describe('error de carga de pesos', () => {
    it('se distingue de un fallo de encuadre mediante un tipo propio', async () => {
        fallarCargaPesos = true;

        await expect(cargarAnalizador()).rejects.toBeInstanceOf(ErrorCargaModelo);
    });

    it('un fallo no deja la carga envenenada: el reintento vuelve a probar', async () => {
        fallarCargaPesos = true;
        await expect(cargarAnalizador()).rejects.toBeInstanceOf(ErrorCargaModelo);

        fallarCargaPesos = false;
        deteccionesSimuladas = [{ score: 0.91 }];
        const r = await estimarEdadLocal(lienzoFalso);
        expect(r.estado).toBe('ok');
    });
});

describe('fallback remoto controlado', () => {
    it('está apagado por defecto: la foto no sale del dispositivo sin decisión explícita', () => {
        expect(featureFlags.facialRemoteFallback).toBe(false);
    });

    it('la inferencia local está activa por defecto', () => {
        expect(featureFlags.facialLocalInference).toBe(true);
    });
});

describe('redimensionado previo', () => {
    it('reduce el lado mayor a 640 conservando la proporción', () => {
        // 4032×3024 es una foto típica de 12 MP.
        expect(calcularDimensiones(4032, 3024)).toEqual({ ancho: 640, alto: 480 });
        expect(calcularDimensiones(3024, 4032)).toEqual({ ancho: 480, alto: 640 });
    });

    it('no amplía una imagen que ya es pequeña', () => {
        expect(calcularDimensiones(320, 240)).toEqual({ ancho: 320, alto: 240 });
    });

    it('el límite es exactamente 640', () => {
        expect(MAX_LADO).toBe(640);
        expect(calcularDimensiones(1280, 1280).ancho).toBe(640);
    });
});
