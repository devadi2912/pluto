
import { AuthUser, PetProfile, TimelineEntry, PetDocument, Reminder, DoctorNote, DailyLog, DailyChecklist, RoutineItem, Doctor } from '../types';

// STORAGE KEYS
const KEYS = {
  USERS: 'pluto_users',
  PETS: 'pluto_pets',
  DOCTORS: 'pluto_doctors',
  RECORDS: 'pluto_records_prefix_' // petId suffix
};

// HELPER: Get from local storage
const get = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};
const set = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

// SEED DEFAULT DATA FOR DEMO
const seed = () => {
  const users = get(KEYS.USERS);
  if (users.length === 0) {
    const demoUserId = 'demo-user-123';
    const demoUser = {
      id: demoUserId,
      username: 'admin',
      password: 'password',
      role: 'PET_OWNER'
    };
    
    const demoPet = {
      id: 'PET-LUNA-123',
      userId: demoUserId,
      name: 'Luna',
      species: 'Dog',
      breed: 'Golden Retriever',
      dateOfBirth: '2022-01-01',
      gender: 'Female',
      avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400&h=400'
    };

    set(KEYS.USERS, [demoUser]);
    set(KEYS.PETS, [demoPet]);
    set(KEYS.RECORDS + demoPet.id, {
      timeline: [],
      reminders: [],
      documents: [],
      doctorNotes: [],
      checklist: { food: false, water: false, walk: false, medication: false, lastReset: new Date().toISOString() },
      dailyLogs: {},
      routines: []
    });
  }
};

seed();

export const api = {
  async register(data: any): Promise<AuthUser> {
    const users = get(KEYS.USERS);
    const username = data.username.toLowerCase();
    
    if (users.find((u: any) => u.username === username)) {
      throw new Error("Username already taken!");
    }

    const newUser: AuthUser = {
      id: Math.random().toString(36).substr(2, 9),
      username: username,
      role: data.role
    };

    users.push({ ...newUser, password: data.password });
    set(KEYS.USERS, users);

    if (data.role === 'PET_OWNER') {
      const pets = get(KEYS.PETS);
      const pet = { ...data.petDetails, id: 'PET-' + Math.random().toString(36).substr(2, 9).toUpperCase(), userId: newUser.id };
      pets.push(pet);
      set(KEYS.PETS, pets);
      newUser.petDetails = pet;
      
      // Initialize records
      const recordKey = KEYS.RECORDS + pet.id;
      set(recordKey, {
        timeline: [],
        reminders: [],
        documents: [],
        doctorNotes: [],
        checklist: { food: false, water: false, walk: false, medication: false, lastReset: new Date().toISOString() },
        dailyLogs: {},
        routines: []
      });
    } else {
      const doctors = get(KEYS.DOCTORS);
      const doctor = { ...data.doctorDetails, id: 'DOC-' + Math.random().toString(36).substr(2, 9).toUpperCase(), userId: newUser.id };
      doctors.push(doctor);
      set(KEYS.DOCTORS, doctors);
      newUser.doctorDetails = doctor;
    }

    return newUser;
  },

  async login(credentials: any): Promise<AuthUser> {
    const users = get(KEYS.USERS);
    const username = credentials.username.toLowerCase();
    
    const userMatch = users.find((u: any) => 
      u.username === username && 
      u.password === credentials.password && 
      u.role === credentials.role
    );
    
    if (!userMatch) {
      const exists = users.find((u: any) => u.username === username);
      if (!exists) throw new Error("Username not found. Please register first!");
      throw new Error("Incorrect password or role selection.");
    }

    const authUser: AuthUser = { id: userMatch.id, username: userMatch.username, role: userMatch.role };
    
    if (authUser.role === 'PET_OWNER') {
      authUser.petDetails = get(KEYS.PETS).find((p: any) => p.userId === authUser.id);
    } else {
      authUser.doctorDetails = get(KEYS.DOCTORS).find((d: any) => d.userId === authUser.id);
    }

    return authUser;
  },

  async getPetRecords(petId: string) {
    const key = KEYS.RECORDS + petId;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {
      timeline: [],
      reminders: [],
      documents: [],
      doctorNotes: [],
      checklist: { food: false, water: false, walk: false, medication: false, lastReset: new Date().toISOString() },
      dailyLogs: {},
      routines: []
    };
  },

  async searchPatient(petId: string): Promise<PetProfile> {
    const pet = get(KEYS.PETS).find((p: any) => p.id === petId);
    if (!pet) throw new Error("Patient not found");
    return pet;
  },

  async updateChecklist(petId: string, checklist: DailyChecklist) {
    const key = KEYS.RECORDS + petId;
    const records = await this.getPetRecords(petId);
    records.checklist = checklist;
    set(key, records);
    return checklist;
  },

  async updateDailyLog(petId: string, date: string, log: Partial<DailyLog>) {
    const key = KEYS.RECORDS + petId;
    const records = await this.getPetRecords(petId);
    records.dailyLogs = records.dailyLogs || {};
    records.dailyLogs[date] = { ...(records.dailyLogs[date] || { activityMinutes: 0, moodRating: 3, feedingCount: 0 }), ...log };
    set(key, records);
    return records.dailyLogs[date];
  },

  async deleteReminder(id: string) {
    const pets = get(KEYS.PETS);
    for (const pet of pets) {
      const key = KEYS.RECORDS + pet.id;
      const records = await this.getPetRecords(pet.id);
      if (records.reminders && records.reminders.some((r: any) => r.id === id)) {
        records.reminders = records.reminders.filter((r: any) => r.id !== id);
        set(key, records);
        break;
      }
    }
  },

  async addTimelineEntry(petId: string, entry: Partial<TimelineEntry>): Promise<TimelineEntry> {
    const key = KEYS.RECORDS + petId;
    const records = await this.getPetRecords(petId);
    const newEntry = { ...entry, id: Date.now().toString() } as TimelineEntry;
    records.timeline = [newEntry, ...(records.timeline || [])];
    set(key, records);
    return newEntry;
  },

  async addDocument(petId: string, doc: Partial<PetDocument>): Promise<PetDocument> {
    const key = KEYS.RECORDS + petId;
    const records = await this.getPetRecords(petId);
    const newDoc = { ...doc, id: Date.now().toString() } as PetDocument;
    records.documents = [newDoc, ...(records.documents || [])];
    set(key, records);
    return newDoc;
  },

  async deleteDocument(id: string) {
    const pets = get(KEYS.PETS);
    for (const pet of pets) {
      const key = KEYS.RECORDS + pet.id;
      const records = await this.getPetRecords(pet.id);
      if (records.documents && records.documents.some((d: any) => d.id === id)) {
        records.documents = records.documents.filter((d: any) => d.id !== id);
        set(key, records);
        break;
      }
    }
  },

  async addRoutine(petId: string, routine: Partial<RoutineItem>): Promise<RoutineItem> {
    const key = KEYS.RECORDS + petId;
    const records = await this.getPetRecords(petId);
    const newRoutine = { ...routine, id: Date.now().toString() } as RoutineItem;
    records.routines = [newRoutine, ...(records.routines || [])];
    set(key, records);
    return newRoutine;
  },

  async updateRoutine(id: string, routine: Partial<RoutineItem>) {
    const pets = get(KEYS.PETS);
    for (const pet of pets) {
      const key = KEYS.RECORDS + pet.id;
      const records = await this.getPetRecords(pet.id);
      if (records.routines) {
        const idx = records.routines.findIndex((r: any) => r.id === id);
        if (idx !== -1) {
          records.routines[idx] = { ...records.routines[idx], ...routine };
          set(key, records);
          break;
        }
      }
    }
  },

  async addDoctorNote(note: Partial<DoctorNote>): Promise<DoctorNote | undefined> {
    const petId = note.petId;
    if (!petId) return;
    const key = KEYS.RECORDS + petId;
    const records = await this.getPetRecords(petId);
    const newNote = { ...note, id: Date.now().toString() } as DoctorNote;
    records.doctorNotes = [newNote, ...(records.doctorNotes || [])];
    set(key, records);
    return newNote;
  },

  async deleteDoctorNote(id: string) {
    const pets = get(KEYS.PETS);
    for (const pet of pets) {
      const key = KEYS.RECORDS + pet.id;
      const records = await this.getPetRecords(pet.id);
      if (records.doctorNotes && records.doctorNotes.some((n: any) => n.id === id)) {
        records.doctorNotes = records.doctorNotes.filter((n: any) => n.id !== id);
        set(key, records);
        break;
      }
    }
  }
};
