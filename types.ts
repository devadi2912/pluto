
export enum Species {
  Dog = 'Dog',
  Cat = 'Cat',
  Other = 'Other'
}

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Unknown = 'Unknown'
}

export interface PetProfile {
  id: string;
  name: string;
  species: Species;
  breed: string;
  dateOfBirth: string;
  gender: Gender;
  avatar?: string;
  weight?: string; // e.g., "25kg"
}

export enum EntryType {
  VetVisit = 'Vet Visit',
  Vaccination = 'Vaccination',
  Medication = 'Medication',
  Note = 'Note'
}

export interface TimelineEntry {
  id: string;
  date: string;
  type: EntryType;
  title: string;
  notes?: string;
  documentId?: string;
}

export interface PetDocument {
  id: string;
  name: string;
  type: 'Prescription' | 'Bill' | 'Report';
  date: string;
  fileUrl: string;
  fileSize: string;
  data?: string; // base64 encoded data
  mimeType?: string;
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  type: 'Vaccination' | 'Medication' | 'Vet follow-up';
  repeat?: 'Daily' | 'Weekly' | 'Monthly' | 'Never';
  completed: boolean;
}

export interface DailyChecklist {
  food: boolean;
  water: boolean;
  walk: boolean;
  medication: boolean;
  lastReset: string;
}

export interface RoutineItem {
  id: string;
  title: string;
  time: string;
  completed: boolean;
  category: 'Food' | 'Walk' | 'Medication' | 'Play' | 'Sleep' | 'Other';
}

export interface DailyLog {
  activityMinutes: number;
  moodRating: number; // 1-5
  feedingCount: number;
}

export type UserRole = 'PET_OWNER' | 'DOCTOR';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  registrationId: string;
  experience: string;
  clinic: string;
  address: string;
  contact: string;
  emergencyContact: string;
  consultationHours: string;
  medicalFocus: string;
}

export interface DoctorNote {
  id: string;
  doctorId: string;
  doctorName: string;
  petId: string;
  date: string;
  content: string;
}

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  petId?: string;
  doctorDetails?: Doctor;
}
