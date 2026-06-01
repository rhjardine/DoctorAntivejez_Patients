import {
  PatientProtocol,
  TimeSlot,
  NutrigenomicPlan,
  NutrigenomicFood,
  DietType,
} from '../types';
import {
  DEFAULTS_A_AB,
  DEFAULTS_COMUNES,
  DEFAULTS_O_B,
} from './nutrigenomicaDefaults';

type RawRecord = Record<string, any>;

const SLOT_ALIASES: Record<string, TimeSlot> = {
  morning: 'MORNING',
  manana: 'MORNING',
  mañana: 'MORNING',
  am: 'MORNING',
  desayuno: 'MORNING',
  afternoon: 'AFTERNOON',
  tarde: 'AFTERNOON',
  pm: 'AFTERNOON',
  almuerzo: 'AFTERNOON',
  comida: 'AFTERNOON',
  evening: 'EVENING',
  noche: 'EVENING',
  cena: 'EVENING',
  nocturno: 'EVENING',
  anytime: 'ANYTIME',
  cualquiera: 'ANYTIME',
  flexible: 'ANYTIME',
  diario: 'ANYTIME',
  todo_el_dia: 'ANYTIME',
};

const MEAL_ALIASES: Record<
  string,
  keyof NormalizedAlimentacion['planAlimentario']
> = {
  BREAKFAST: 'desayuno',
  DESAYUNO: 'desayuno',
  breakfast: 'desayuno',
  desayuno: 'desayuno',
  LUNCH: 'almuerzo',
  ALMUERZO: 'almuerzo',
  lunch: 'almuerzo',
  almuerzo: 'almuerzo',
  comida: 'almuerzo',
  DINNER: 'cenaComunes',
  CENA: 'cenaComunes',
  dinner: 'cenaComunes',
  cena: 'cenaComunes',
  cenaComunes: 'cenaComunes',
  SNACK: 'meriendas',
  MERIENDA: 'meriendas',
  snack: 'meriendas',
  merienda: 'meriendas',
  meriendas: 'meriendas',
};

export interface NormalizedAlimentacion {
  grupoSanguineo: 'O_B' | 'A_AB';
  planAlimentario: {
    desayuno: string[];
    almuerzo: string[];
    cenaComunes: string[];
    meriendas: string[];
  };
  alimentosEvitar?: string;
  sustitutos?: string;
  claves5a: typeof DEFAULTS_COMUNES.claves5a;
  terapias4r: typeof DEFAULTS_COMUNES.terapias4r;
  tipoNino?: boolean;
  tipoMetabolica?: boolean;
  tipoAntidiabetica?: boolean;
  tipoCitostatica?: boolean;
  tipoRenal?: boolean;
  enviadaAt?: string;
  updatedAt?: string;
  source?: string;
}

const asRecord = (value: unknown): RawRecord | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as RawRecord)
    : null;

const asArray = <T = any>(value: unknown): T[] => {
  if (Array.isArray(value)) return value.filter(Boolean) as T[];
  if (typeof value === 'string') {
    return value
      .split(/\r?\n|;/)
      .map((item) => item.trim())
      .filter(Boolean) as T[];
  }
  return [];
};

const pickFirst = (...values: unknown[]): any =>
  values.find((value) => value !== undefined && value !== null && value !== '');

const normalizeSlot = (value: unknown): TimeSlot => {
  if (typeof value !== 'string') return 'ANYTIME';
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s-]+/g, '_');
  return SLOT_ALIASES[normalized] || SLOT_ALIASES[value.trim()] || 'ANYTIME';
};

const stableId = (category: string, index: number, item: RawRecord): string => {
  const explicit = pickFirst(
    item.id,
    item._id,
    item.protocolItemId,
    item.itemId,
    item.treatmentId,
  );
  if (explicit) return String(explicit);
  // SOLO usar hash como último fallback, y marcarlo como inestable
  console.warn('[normalizer] Item sin ID explícito del backend, usando hash inestable:', item);
  const seed = `${category}:${index}:${pickFirst(item.itemName, item.name, item.nombre, item.producto, item.title, '')}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1)
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  return `guide_${Math.abs(hash)}`;
};

const normalizeProtocolItem = (
  item: unknown,
  category: string,
  index: number,
  guideMeta?: RawRecord,
): PatientProtocol | null => {
  const raw = typeof item === 'string' ? { name: item } : asRecord(item);
  if (!raw) return null;

  const itemName = pickFirst(
    raw.itemName,
    raw.name,
    raw.nombre,
    raw.producto,
    raw.title,
    raw.label,
    raw.therapyName,
  );
  if (!itemName) return null;

  const normalizedCategory = String(
    pickFirst(
      raw.category,
      raw.categoria,
      raw.phase,
      raw.fase,
      raw.type,
      category,
      'PRIMARY_NUTRACEUTICALS',
    ),
  );
  const updatedAt = String(
    pickFirst(
      raw.updatedAt,
      raw.updated_at,
      guideMeta?.updatedAt,
      guideMeta?.sentAt,
      guideMeta?.createdAt,
      new Date().toISOString(),
    ),
  );

  return {
    id: stableId(normalizedCategory, index, raw),
    category: normalizedCategory,
    itemName: String(itemName),
    dose: String(
      pickFirst(
        raw.dose,
        raw.dosis,
        raw.amount,
        raw.cantidad,
        raw.presentation,
        '',
      ),
    ),
    schedule: String(
      pickFirst(
        raw.schedule,
        raw.frecuencia,
        raw.horario,
        raw.indication,
        raw.indicacion,
        raw.instructions,
        raw.instrucciones,
        '',
      ),
    ),
    observations: String(
      pickFirst(
        raw.observations,
        raw.observaciones,
        raw.notes,
        raw.notas,
        raw.comentarios,
        raw.warning,
        '',
      ),
    ),
    status:
      raw.status === 'completed' || raw.completed === true || raw.done === true
        ? 'completed'
        : 'pending',
    timeSlot: normalizeSlot(
      pickFirst(
        raw.timeSlot,
        raw.slot,
        raw.momento,
        raw.bloque,
        raw.mealType,
        raw.horarioDia,
        raw.horario,
        raw.schedule,
        raw.frecuencia,
      ),
    ),
    prescribedAt: String(
      pickFirst(
        raw.prescribedAt,
        raw.createdAt,
        raw.created_at,
        guideMeta?.createdAt,
        guideMeta?.sentAt,
        updatedAt,
      ),
    ),
    updatedAt,
  };
};

const collectProtocolItems = (
  source: unknown,
  guideMeta?: RawRecord,
): PatientProtocol[] => {
  const sourceRecord = asRecord(source);
  if (!sourceRecord) return [];

  const directArray = pickFirst(
    sourceRecord.protocol,
    sourceRecord.items,
    sourceRecord.treatmentItems,
    sourceRecord.treatments,
    sourceRecord.indicaciones,
    sourceRecord.protocolItems,
  );

  if (Array.isArray(directArray)) {
    return directArray
      .map((item, index) =>
        normalizeProtocolItem(
          item,
          (asRecord(item)?.category ?? 'GENERAL') as string,
          index,
          guideMeta ?? sourceRecord,
        ),
      )
      .filter(Boolean) as PatientProtocol[];
  }

  const selections = pickFirst(
    sourceRecord.selections,
    sourceRecord.categories,
    sourceRecord.categorias,
    sourceRecord.protocolByCategory,
    sourceRecord.byCategory,
  );
  const selectionRecord = asRecord(selections);
  if (!selectionRecord) return [];

  return Object.entries(selectionRecord).flatMap(
    ([category, categoryItems]) =>
      asArray(categoryItems)
        .map((item, index) =>
          normalizeProtocolItem(
            item,
            category,
            index,
            guideMeta ?? sourceRecord,
          ),
        )
        .filter(Boolean) as PatientProtocol[],
  );
};

const sortByRecency = (items: RawRecord[]): RawRecord[] =>
  [...items].sort((a, b) => {
    const aDate = Date.parse(
      pickFirst(a.updatedAt, a.sentAt, a.createdAt, a.enviadaAt, 0),
    );
    const bDate = Date.parse(
      pickFirst(b.updatedAt, b.sentAt, b.createdAt, b.enviadaAt, 0),
    );
    return (
      (Number.isNaN(bDate) ? 0 : bDate) - (Number.isNaN(aDate) ? 0 : aDate)
    );
  });

export const normalizePatientProtocol = (
  profile: unknown,
): PatientProtocol[] => {
  const profileRecord = asRecord(profile);
  if (!profileRecord) return [];

  // Check if it has direct protocol fields
  const hasDirectFields = Boolean(
    profileRecord.protocol ||
    profileRecord.items ||
    profileRecord.treatmentItems ||
    profileRecord.treatments ||
    profileRecord.indicaciones ||
    profileRecord.protocolItems ||
    profileRecord.selections ||
    profileRecord.categories ||
    profileRecord.categorias ||
    profileRecord.protocolByCategory ||
    profileRecord.byCategory
  );

  const direct = collectProtocolItems(profileRecord, profileRecord);
  if (direct.length > 0) return direct;
  
  if (hasDirectFields && direct.length === 0) {
    throw new Error("CLINICAL_PARSE_FAILED");
  }

  const guides = asArray<RawRecord>(
    profileRecord.guides ??
      profileRecord.patientGuides ??
      profileRecord.medicalGuides,
  );
  
  if (guides.length > 0) {
    for (const guide of sortByRecency(guides.filter(Boolean))) {
      const items = collectProtocolItems(guide, guide);
      if (items.length > 0) return items;
    }
    throw new Error("CLINICAL_PARSE_FAILED");
  }

  return [];
};

const normalizeBloodGroup = (value: unknown): 'O_B' | 'A_AB' => {
  const normalized = String(value ?? '')
    .toUpperCase()
    .replace(/\s+/g, '');
  return normalized.includes('A') ? 'A_AB' : 'O_B';
};

const normalizeMealList = (...values: unknown[]): string[] => {
  for (const value of values) {
    const list = asArray<string>(value)
      .map((item) => String(item).trim())
      .filter(Boolean);
    if (list.length > 0) return list;
  }
  return [];
};

export const normalizeAlimentacion = (
  profile: unknown,
): NormalizedAlimentacion | null => {
  const profileRecord = asRecord(profile);
  if (!profileRecord) return null;

  const foodPlans = asArray<RawRecord>(
    profileRecord.foodPlans ??
      profileRecord.nutritionPlans ??
      profileRecord.alimentaciones,
  );
  const latestFoodPlan = sortByRecency(foodPlans.filter(Boolean))[0];
  const source =
    asRecord(profileRecord.alimentacion) ??
    asRecord(latestFoodPlan?.alimentacion) ??
    latestFoodPlan;
  if (!source) return null;

  const plan =
    asRecord(source.planAlimentario) ??
    asRecord(source.plan) ??
    asRecord(source.meals) ??
    {};
  const defaults =
    normalizeBloodGroup(
      pickFirst(
        source.grupoSanguineo,
        source.bloodGroup,
        source.bloodType,
        profileRecord.bloodType,
      ),
    ) === 'A_AB'
      ? DEFAULTS_A_AB
      : DEFAULTS_O_B;

  const planAlimentario: NormalizedAlimentacion['planAlimentario'] = {
    desayuno: normalizeMealList(
      plan.desayuno,
      plan.breakfast,
      source.desayuno,
      source.breakfast,
      defaults.desayuno,
    ),
    almuerzo: normalizeMealList(
      plan.almuerzo,
      plan.lunch,
      source.almuerzo,
      source.lunch,
      defaults.almuerzo,
    ),
    cenaComunes: normalizeMealList(
      plan.cenaComunes,
      plan.cena,
      plan.dinner,
      source.cenaComunes,
      source.cena,
      source.dinner,
      defaults.cena.comunes,
    ),
    meriendas: normalizeMealList(
      plan.meriendas,
      plan.snacks,
      source.meriendas,
      source.snacks,
      DEFAULTS_COMUNES.meriendas,
    ),
  };

  asArray<RawRecord>(
    source.items ?? source.foods ?? latestFoodPlan?.items,
  ).forEach((item) => {
    const meal =
      MEAL_ALIASES[
        String(
          pickFirst(
            item.mealType,
            item.meal,
            item.tipoComida,
            item.category,
            '',
          ),
        ).trim()
      ];
    const name = pickFirst(
      item.name,
      item.nombre,
      item.itemName,
      item.food,
      item.alimento,
    );
    if (meal && name) planAlimentario[meal].push(String(name));
  });

  const selectedDiets = asArray<string>(
    pickFirst(
      source.selectedDiets,
      profileRecord.selectedDiets,
      latestFoodPlan?.selectedDiets,
    ),
  ).map((d) => d.toUpperCase());

  return {
    ...source,
    grupoSanguineo: normalizeBloodGroup(
      pickFirst(
        source.grupoSanguineo,
        source.bloodGroup,
        source.bloodType,
        profileRecord.bloodType,
      ),
    ),
    planAlimentario,
    alimentosEvitar:
      normalizeMealList(
        source.alimentosEvitar,
        source.forbidden,
        source.avoidFoods,
        latestFoodPlan?.forbidden,
      ).join('\n') || DEFAULTS_COMUNES.alimentosEvitar.join('\n'),
    sustitutos:
      normalizeMealList(
        source.sustitutos,
        source.substitutes,
        source.replacements,
      ).join('\n') || DEFAULTS_COMUNES.sustitutos.join('\n'),
    claves5a: Array.isArray(source.claves5a)
      ? source.claves5a
      : DEFAULTS_COMUNES.claves5a,
    terapias4r: Array.isArray(source.terapias4r)
      ? source.terapias4r
      : DEFAULTS_COMUNES.terapias4r,
    tipoMetabolica: Boolean(
      source.tipoMetabolica || selectedDiets.includes('METABOLIC'),
    ),
    tipoRenal: Boolean(source.tipoRenal || selectedDiets.includes('RENAL')),
    tipoNino: Boolean(source.tipoNino || selectedDiets.includes('STANDARD')),
    tipoAntidiabetica: Boolean(
      source.tipoAntidiabetica ||
      selectedDiets.includes('ANTI_DIABETIC') ||
      selectedDiets.includes('ANTIDIABETICA'),
    ),
    tipoCitostatica: Boolean(
      source.tipoCitostatica ||
      selectedDiets.includes('CYTOSTATIC') ||
      selectedDiets.includes('CITOSTATICA'),
    ),
    enviadaAt: pickFirst(
      source.enviadaAt,
      source.sentAt,
      latestFoodPlan?.sentAt,
      latestFoodPlan?.createdAt,
    ),
    updatedAt: pickFirst(
      source.updatedAt,
      source.updated_at,
      latestFoodPlan?.updatedAt,
      latestFoodPlan?.createdAt,
    ),
    source:
      source === profileRecord.alimentacion
        ? 'profile.alimentacion'
        : 'profile.foodPlans',
  };
};

export const buildNutrigenomicPlan = (
  profile: unknown,
): NutrigenomicPlan | null => {
  const alimentacion = normalizeAlimentacion(profile);
  if (!alimentacion) return null;

  const foods: NutrigenomicFood[] = [];
  const pushFoods = (
    items: string[],
    mealTypes: NutrigenomicFood['mealTypes'],
  ) => {
    items.forEach((item) =>
      foods.push({
        id: `${mealTypes.join('_').toLowerCase()}_${foods.length + 1}`,
        name: item,
        category: 'Indicado por médico',
        mealTypes,
        isClinicalPriority: true,
      }),
    );
  };

  pushFoods(alimentacion.planAlimentario.desayuno, ['BREAKFAST']);
  pushFoods(alimentacion.planAlimentario.almuerzo, ['LUNCH']);
  pushFoods(alimentacion.planAlimentario.cenaComunes, ['DINNER']);
  pushFoods(alimentacion.planAlimentario.meriendas, ['SNACK']);

  const dietTypes: DietType[] = [];
  if (alimentacion.tipoMetabolica) dietTypes.push('METABOLIC');
  if (alimentacion.tipoRenal) dietTypes.push('RENAL');
  if (dietTypes.length === 0) dietTypes.push('STANDARD');

  return {
    bloodType: alimentacion.grupoSanguineo === 'A_AB' ? 'A' : 'O',
    dietTypes,
    forbidden: asArray<string>(alimentacion.alimentosEvitar),
    foods,
    updatedAt:
      alimentacion.enviadaAt ||
      alimentacion.updatedAt ||
      new Date().toISOString(),
    isDemoTemplate: false,
  };
};
