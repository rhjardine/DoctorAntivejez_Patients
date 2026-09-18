/**
 * Estimación de edad aparente ejecutada EN EL DISPOSITIVO.
 *
 * La foto no sale del teléfono: entra como canvas y sale como número. No hay
 * petición de red con la imagen, no se persiste en ningún almacén y no se
 * envía a ningún proveedor. Lo único que viaja por red son los pesos del
 * modelo, servidos desde el propio origen (`/models`), lo que además respeta
 * el `connect-src 'self'` de la CSP sin tener que tocarla.
 *
 * La librería (`@vladmandic/face-api`, MIT) se carga con `import()` dinámico
 * para que ni ella ni los pesos entren en el arranque de la app del paciente:
 * solo se descargan cuando alguien abre /agebot.
 *
 * Importante sobre lo que esto NO es: `TinyFaceDetector` + `AgeGenderNet`
 * estiman la edad *aparente* de un rostro en una foto. No es un biomarcador
 * ni una medida de edad biológica, y aquí no se afirma precisión clínica
 * alguna: no se ha evaluado contra un conjunto de referencia.
 */

import type * as FaceApi from '@vladmandic/face-api';

/** Lado mayor al que se reduce cualquier imagen antes de analizarla. */
export const MAX_LADO = 640;

/** Ruta de los pesos, servidos desde el mismo origen que la app. */
const RUTA_MODELOS = '/models';

export interface EdadAparenteLocal {
    estado: 'ok';
    estimatedAge: number;
    confidence: number;
}

export type ResultadoLocal =
    | EdadAparenteLocal
    | { estado: 'sin-rostro' }
    | { estado: 'varios-rostros'; total: number };

/**
 * Los pesos no se pudieron descargar o inicializar. Se distingue de un fallo
 * de inferencia porque la acción que le toca al paciente es distinta: aquí no
 * sirve de nada repetir la foto.
 */
export class ErrorCargaModelo extends Error {
    constructor(causa?: unknown) {
        super('No se pudo cargar el analizador en este dispositivo.');
        this.name = 'ErrorCargaModelo';
        this.cause = causa;
    }
}

/**
 * Carga memoizada. Varias llamadas concurrentes comparten la misma promesa;
 * si falla, se limpia para que un reintento posterior pueda volver a probar.
 */
let cargaEnCurso: Promise<typeof FaceApi> | null = null;

export const cargarAnalizador = (): Promise<typeof FaceApi> => {
    if (cargaEnCurso) return cargaEnCurso;

    cargaEnCurso = (async () => {
        try {
            const fa = await import('@vladmandic/face-api');
            await Promise.all([
                fa.nets.tinyFaceDetector.loadFromUri(RUTA_MODELOS),
                fa.nets.ageGenderNet.loadFromUri(RUTA_MODELOS),
            ]);
            return fa;
        } catch (err) {
            cargaEnCurso = null;
            throw new ErrorCargaModelo(err);
        }
    })();

    return cargaEnCurso;
};

/** Solo para pruebas: olvida la carga memoizada. */
export const _resetAnalizador = (): void => {
    cargaEnCurso = null;
};

/**
 * Dimensiones de destino conservando la proporción, sin ampliar nunca una
 * imagen que ya es pequeña.
 */
export const calcularDimensiones = (
    ancho: number,
    alto: number,
    maxLado: number = MAX_LADO,
): { ancho: number; alto: number } => {
    const mayor = Math.max(ancho, alto);
    if (mayor <= maxLado || mayor === 0) return { ancho, alto };
    const factor = maxLado / mayor;
    return {
        ancho: Math.max(1, Math.round(ancho * factor)),
        alto: Math.max(1, Math.round(alto * factor)),
    };
};

/**
 * Decodifica la foto y la reduce a `MAX_LADO` en su lado mayor.
 *
 * Una foto de 12 MP de un teléfono actual son varios megabytes; analizarla a
 * tamaño completo no mejora la estimación y sí puede agotar la memoria de un
 * gama media. El resultado es un canvas en memoria, nunca un fichero.
 */
export const prepararImagen = (
    dataUrl: string,
    maxLado: number = MAX_LADO,
): Promise<HTMLCanvasElement> =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const { ancho, alto } = calcularDimensiones(img.naturalWidth, img.naturalHeight, maxLado);
            const canvas = document.createElement('canvas');
            canvas.width = ancho;
            canvas.height = alto;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Este navegador no permite procesar la imagen.'));
                return;
            }
            ctx.drawImage(img, 0, 0, ancho, alto);
            resolve(canvas);
        };
        img.onerror = () => reject(new Error('No se pudo leer la imagen.'));
        img.src = dataUrl;
    });

/**
 * Detecta y, si hay exactamente un rostro, estima su edad aparente.
 *
 * Los tres desenlaces son deliberadamente distintos porque piden acciones
 * distintas al paciente: reencuadrar, salir una sola persona, o continuar.
 */
export const estimarEdadLocal = async (
    fuente: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement,
): Promise<ResultadoLocal> => {
    const fa = await cargarAnalizador();

    const detecciones = await fa.detectAllFaces(
        fuente,
        new fa.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }),
    );

    if (detecciones.length === 0) return { estado: 'sin-rostro' };
    if (detecciones.length > 1) return { estado: 'varios-rostros', total: detecciones.length };

    // El estimador de edad espera un recorte del rostro, no la escena entera.
    const [recorte] = await fa.extractFaces(fuente, detecciones);
    try {
        const prediccion = await fa.nets.ageGenderNet.predictAgeAndGender(recorte);
        const edad = Array.isArray(prediccion) ? prediccion[0]?.age : prediccion?.age;

        if (typeof edad !== 'number' || !Number.isFinite(edad)) {
            throw new Error('El analizador no devolvió una edad utilizable.');
        }

        return {
            estado: 'ok',
            estimatedAge: Math.round(edad),
            confidence: detecciones[0].score,
        };
    } finally {
        // El recorte es un canvas fuera del árbol: se suelta explícitamente
        // para no dejar el bitmap vivo en dispositivos con poca memoria.
        recorte.width = 0;
        recorte.height = 0;
    }
};
