
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
  weight?: string; 
  color?: string;
  microchip?: string;
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
  type: 'Prescription' | 'Bill' | 'Report' | 'Note';
  date: string;
  fileUrl: string;
  fileId?: string;
  fileSize: string;
  data?: string; 
  mimeType?: string;
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  type: 'Vaccination' | 'Medication' | 'Vet follow-up';
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
  moodRating: number; 
  feedingCount: number;
}

export type UserRole = 'PET_OWNER' | 'DOCTOR';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  clinic: string;
  registrationId: string;
  experience: string;
  address: string;
  contact: string;
  emergencyContact: string;
  consultationHours: string;
  medicalFocus: string;
  bio?: string;
  languages?: string;
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
  doctorDetails?: Doctor;
  petId?: string; 
  petDetails?: PetProfile;
  careJournal?: TimelineEntry[];
  plannedCare?: Reminder[];
  lastDoctorVisit?: string;
  lastDoctorId?: string;
}
