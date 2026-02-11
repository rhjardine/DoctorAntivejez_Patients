
import React from 'react';

/**
 * Aesthetic Constants
 */
export const COLORS = {
  PrimaryBlue: '#23BCEF',
  DarkBlue: '#293B64',
  BrightWhite: '#FFFFFF',
  LightPearlyGray: '#F0F4F8',
  SlightlyDarkerGray: '#E8EDF2',
  AccentGreen: '#4CAF50',
  AccentRed: '#F44336',
  AccentOrange: '#FFA726',
  AccentYellow: '#FFEB3B',
  TextDark: '#1A253C',
  TextMedium: '#5A6A8A',
  TextLight: '#8A9BB3',
};

/**
 * Navigation Enums
 */
export enum MainTab {
  KEYS_5A = 'Claves 5A',
  THERAPIES_4R = 'Terapias 4R',
  CHALLENGE = 'Reto Antivejez'
}

export type DetailView =
  | 'NUTRITION'
  | 'ATTITUDE'
  | 'ACTIVITY'
  | 'ENVIRONMENT'
  | 'REST'
  | 'ABOUT'
  | 'TEAM'
  | 'USAGE_GUIDE'
  | 'PATIENT_GUIDE'
  | 'BIOMETRICS'
  | 'CONSULTATION_HISTORY'
  | 'BIO_PASE'
  | 'SETTINGS'
  | null;

export type ProtocolCategory =
  | 'REMOVAL_PHASE'
  | 'REVITALIZATION_PHASE'
  | 'PRIMARY_NUTRACEUTICALS'
  | 'SECONDARY_NUTRACEUTICALS'
  | 'COMPLEMENTARY_NUTRACEUTICALS'
  | 'METABOLIC_ACTIVATOR'
  | 'COSMECEUTICALS'
  | 'NATURAL_FORMULAS'
  | 'ANTI_AGING_SERUMS'
  | 'ANTI_AGING_THERAPIES'
  | 'THERAPY_CONTROL'
  | string;

export type TimeSlot = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANYTIME';

export interface PatientProtocol {
  id: string;
  category: ProtocolCategory;
  itemName: string;
  dose: string;
  schedule: string;
  observations?: string;
  status: 'pending' | 'completed';
  timeSlot: TimeSlot;
  prescribedAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  token: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  lastLoginAt: string;
}

export type DietType = 'METABOLIC' | 'RENAL' | 'ANTI_INFLAMMATORY' | 'STANDARD';
export type BloodType = 'A' | 'B' | 'AB' | 'O';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface NutrigenomicFood {
  id: string;
  name: string;
  category: string;
  mealTypes: MealType[];
  isClinicalPriority?: boolean;
  notes?: string;
}

export interface NutrigenomicPlan {
  bloodType: BloodType;
  dietTypes: DietType[];
  forbidden: string[];
  foods: NutrigenomicFood[];
  updatedAt: string;
}

export interface UserPreferences {
  icons: {
    NUTRITION: string;
    ACTIVITY: string;
    ATTITUDE: string;
    ENVIRONMENT: string;
    REST: string;
  }
}

export interface PatientGuideResponse {
  patientId: string;
  date: string;
  items: PatientProtocol[];
}

export type BiometricType = 'BLOOD_PRESSURE' | 'HEART_RATE' | 'GLUCOSE' | 'WEIGHT' | 'BIO_AGE' | 'NLR';

export interface BiometricData {
  id: string;
  userId: string;
  type: BiometricType;
  value: string;
  numericValue: number;
  unit: string;
  recordedAt: string;
  timestamp: Date;
  source: 'MANUAL' | 'WEARABLE' | 'CLINICAL';
  note?: string;
}

export interface ProgressMetric {
  date: string;
  value: number;
  label?: string;
  target?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface ConsultationRecord {
  consultationId: string;
  patientId: string;
  date: string;
  doctorName: string;
  doctorNotes: string;
  adherenceRate: number;
  biologicalAgeAtTime: number;
  chronologicalAgeAtTime: number;
  treatmentSnapshot: PatientProtocol[];
}

export interface GeneticResult {
  telomereLength: string;
  biologicalAge: number;
  chronologicalAge: number;
  agingDelta: number;
  rejuvenationScore: number;  // 0-100, derived from agingDelta
  lastTestDate: string;
}
