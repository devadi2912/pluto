
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
  name: string;
  species: Species;
  breed: string;
  dateOfBirth: string;
  gender: Gender;
  avatar?: string;
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
