
import { AuthUser, PetProfile, TimelineEntry, PetDocument, Reminder, DoctorNote, DailyLog, DailyChecklist, RoutineItem, Doctor, Species, Gender, EntryType } from '../types';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, addDoc, getDocs, query, where, arrayUnion } from 'firebase/firestore';

// Helper to simulate network delay for realism
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Local Storage Database Helpers (Maintained for Sub-Collections like Notes) ---
const DB_KEYS = {
  PET_DATA: 'pluto_mock_pet_data',
  NOTES: 'pluto_mock_notes'
};

// Firestore throws errors if we try to save 'undefined' fields.
const sanitize = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => sanitize(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const value = sanitize(obj[key]);
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
  }
  return obj;
};

// Keeping local storage ONLY for the sub-data (Documents, etc) for this MVP phase
// User profiles are now fully moved to Firestore
const getLocalDB = () => {
  try {
    const petData = JSON.parse(localStorage.getItem(DB_KEYS.PET_DATA) || '{}');
    const doctorNotes = JSON.parse(localStorage.getItem(DB_KEYS.NOTES) || '[]');
    return { petData, doctorNotes };
  } catch (e) {
    return { petData: {}, doctorNotes: [] };
  }
};

const saveLocalDB = (dbData: any) => {
  localStorage.setItem(DB_KEYS.PET_DATA, JSON.stringify(dbData.petData));
  localStorage.setItem(DB_KEYS.NOTES, JSON.stringify(dbData.doctorNotes));
};

class ApiClient {
  // --- AUTHENTICATION & FIRESTORE USERS ---

  /**
   * Registers a user in Firebase Auth AND creates a document in Firestore 'users' collection.
   */
  async register(data: any): Promise<AuthUser> {
    const { username, password, role, petDetails, doctorDetails } = data;
    
    // 1. Authenticate with Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, username, password);
    const firebaseUser = userCredential.user;

    // 2. Send Email Verification
    await sendEmailVerification(firebaseUser);

    // 3. Construct the User Object
    const newUser: any = {
      id: firebaseUser.uid,
      username: firebaseUser.email || username,
      role: role,
    };

    if (role === 'PET_OWNER' && petDetails) {
      newUser.petDetails = { 
        ...petDetails, 
        id: `PET-${firebaseUser.uid}` 
      };
      newUser.petId = newUser.petDetails.id;
    } else if (role === 'DOCTOR' && doctorDetails) {
      newUser.doctorDetails = { 
        ...doctorDetails, 
        id: `DOC-${firebaseUser.uid}` 
      };
    }

    // 4. Save to Firestore
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), sanitize(newUser));
      
      // Initialize subcollection for pet owners
      if (role === 'PET_OWNER') {
         await setDoc(doc(db, 'users', firebaseUser.uid, 'journals', 'records'), {
            careJournal: [],
            plannedCare: []
         });
      }
    } catch (error) {
      console.error("Error creating Firestore user document:", error);
      throw new Error("Account created but failed to save profile data.");
    }

    return newUser as AuthUser;
  }

  /**
   * Logs in via Firebase Auth and retrieves the profile data from Firestore.
   * Auto-creates Firestore doc if missing.
   */
  async login(credentials: any): Promise<AuthUser> {
    const { username, password } = credentials;

    // 1. Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, username, password);
    const firebaseUser = userCredential.user;

    // 2. Check Email Verification
    if (!firebaseUser.emailVerified) {
       const error: any = new Error('Email not verified');
       error.code = 'auth/email-not-verified';
       throw error;
    }

    // 3. Fetch Profile Data from Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data() as AuthUser;
    } else {
      // 4. Fallback: User exists in Auth but not Firestore (Legacy or Error) -> Create it
      console.warn("User missing in Firestore. Creating default profile...");
      
      const fallbackUser: AuthUser = {
          id: firebaseUser.uid,
          username: firebaseUser.email || username,
          role: 'PET_OWNER', // Default to Pet Owner if unknown
          petDetails: {
              id: `PET-${firebaseUser.uid}`,
              name: 'New Pet',
              species: Species.Dog,
              breed: 'Unknown',
              dateOfBirth: new Date().toISOString(),
              gender: Gender.Unknown,
              avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400&h=400'
          }
      };
      // Fallback init
      await setDoc(userDocRef, sanitize(fallbackUser));
      await setDoc(doc(db, 'users', firebaseUser.uid, 'journals', 'records'), { careJournal: [], plannedCare: [] });
      return fallbackUser;
    }
  }

  async logout() {
    await signOut(auth);
  }

  async resendVerificationEmail() {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    } else {
      throw new Error("No user is currently signed in to resend verification.");
    }
  }

  async sendPasswordReset(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  /**
   * Retrieves profile from Firestore using Firebase UID. 
   */
  async getUserProfile(uid: string): Promise<AuthUser | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as AuthUser;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  async deleteAccount() {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");
    const uid = user.uid;

    // 1. Delete Firestore Document
    await deleteDoc(doc(db, 'users', uid));

    // 2. Delete Auth Account
    await deleteUser(user);
  }

  // --- HELPER: GET OWNER ID BY PET ID ---
  private async getOwnerId(petId: string): Promise<string> {
    const currentUser = auth.currentUser;
    
    // 1. Direct parsing from ID convention
    if (petId && petId.startsWith('PET-')) {
       return petId.replace('PET-', '');
    }

    // 2. Optimization for current user
    if (currentUser) {
       // If searching for pending or unspecified, assume own data
       if (!petId || petId === 'PENDING') return currentUser.uid;
    }
    
    throw new Error("Could not determine owner ID from Pet ID.");
  }

  // --- PET PROFILES (Updating Firestore) ---

  async getPetRecords(petId: string) {
    // 1. Fetch Local Data (Legacy/Other fields)
    const localDb = getLocalDB();
    const records = localDb.petData[petId] || {};
    
    // 2. Fetch Journals from Firestore Subcollection
    let firestoreTimeline: TimelineEntry[] = [];
    let firestoreReminders: Reminder[] = [];

    try {
      const ownerId = await this.getOwnerId(petId);
      // TARGET: users/{uid}/journals/records
      const journalRef = doc(db, 'users', ownerId, 'journals', 'records');
      const journalSnap = await getDoc(journalRef);

      if (journalSnap.exists()) {
        const data = journalSnap.data();
        firestoreTimeline = data.careJournal || [];
        firestoreReminders = data.plannedCare || [];
      } else {
        // Init if missing
        await setDoc(journalRef, { careJournal: [], plannedCare: [] }, { merge: true });
      }

      // Sort in memory
      firestoreTimeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      firestoreReminders.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
    } catch (e) {
      console.warn("Could not fetch Firestore journals, falling back", e);
    }
    
    return {
      timeline: firestoreTimeline, 
      reminders: firestoreReminders, 
      documents: records.documents || [],
      doctorNotes: localDb.doctorNotes.filter((n: any) => n.petId === petId) || [],
      checklist: records.checklist || { food: false, water: false, walk: false, medication: false, lastReset: new Date().toISOString() },
      dailyLogs: records.dailyLogs || {},
      routines: records.routines || [],
      consultedDoctors: [] 
    };
  }

  /**
   * Updates the Pet Details inside the User Document in Firestore
   */
  async updatePetProfile(petId: string, updates: Partial<PetProfile>): Promise<PetProfile> {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    // Retrieve current user doc to get existing details
    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);
    
    if (!snapshot.exists()) throw new Error("User profile not found");
    
    const userData = snapshot.data() as AuthUser;
    
    // Merge updates
    const updatedPetDetails = { ...userData.petDetails, ...updates };
    
    // Update Firestore
    await updateDoc(userRef, {
      petDetails: sanitize(updatedPetDetails)
    });

    return updatedPetDetails as PetProfile;
  }

  // --- DOCTOR ACTIONS (Updating Firestore) ---

  async logDoctorVisit(petId: string, doctorId: string) {
    const localDb = getLocalDB();
    if (!localDb.petData[petId]) localDb.petData[petId] = {};
    if (!localDb.petData[petId].visitedBy) localDb.petData[petId].visitedBy = [];

    if (!localDb.petData[petId].visitedBy.includes(doctorId)) {
      localDb.petData[petId].visitedBy.push(doctorId);
      saveLocalDB(localDb);
    }
  }

  /**
   * Updates the Doctor Details inside the User Document in Firestore
   */
  async updateDoctorProfile(doctorId: string, updates: Partial<Doctor>): Promise<Doctor> {
     const user = auth.currentUser;
     if (!user) throw new Error("Not authenticated");

     const userRef = doc(db, 'users', user.uid);
     const snapshot = await getDoc(userRef);

     if (!snapshot.exists()) throw new Error("User profile not found");
     
     const userData = snapshot.data() as AuthUser;
     const updatedDoctorDetails = { ...userData.doctorDetails, ...updates };

     await updateDoc(userRef, {
       doctorDetails: sanitize(updatedDoctorDetails)
     });

     return updatedDoctorDetails as Doctor;
  }

  // --- GENERIC COLLECTION HELPERS (Keeping Local Storage for non-User data for MVP) ---

  private async updatePetCollection(petId: string, collection: string, item: any, action: 'add' | 'update' | 'delete', itemId?: string) {
    const localDb = getLocalDB();
    if (!localDb.petData[petId]) localDb.petData[petId] = {};
    if (!localDb.petData[petId][collection]) localDb.petData[petId][collection] = [];

    let list = localDb.petData[petId][collection];
    let result = item;

    if (action === 'add') {
       item.id = `${collection}-${Date.now()}`;
       list.push(item);
       result = item;
    } else if (action === 'update') {
       const idx = list.findIndex((i: any) => i.id === itemId || i._id === itemId);
       if (idx !== -1) {
         list[idx] = { ...list[idx], ...item };
         result = list[idx];
       }
    } else if (action === 'delete') {
       localDb.petData[petId][collection] = list.filter((i: any) => i.id !== itemId && i._id !== itemId);
    }
    
    saveLocalDB(localDb);
    return result;
  }

  // --- TIMELINE (CARE JOURNAL) - FIRESTORE (Stored in Subcollection) ---
  
  async addTimelineEntry(petId: string, entry: Partial<TimelineEntry>) { 
    const ownerId = await this.getOwnerId(petId);
    const newItem = { ...entry, id: `ENTRY-${Date.now()}` };
    
    // Add to 'careJournal' array in the subcollection
    const journalRef = doc(db, 'users', ownerId, 'journals', 'records');
    await setDoc(journalRef, {
      careJournal: arrayUnion(sanitize(newItem))
    }, { merge: true });

    return newItem as TimelineEntry;
  }

  async updateTimelineEntry(petId: string, entryId: string, updates: Partial<TimelineEntry>) { 
    const ownerId = await this.getOwnerId(petId);
    const journalRef = doc(db, 'users', ownerId, 'journals', 'records');
    const snap = await getDoc(journalRef);
    
    if (!snap.exists()) throw new Error("Journal not found");

    const data = snap.data();
    const list = data.careJournal as TimelineEntry[];
    const idx = list.findIndex(e => e.id === entryId || e._id === entryId);

    if (idx > -1) {
       list[idx] = { ...list[idx], ...updates };
       await updateDoc(journalRef, { careJournal: sanitize(list) });
       return list[idx];
    }
    
    throw new Error("Entry not found to update");
  }

  async deleteTimelineEntry(petId: string, entryId: string) { 
    const ownerId = await this.getOwnerId(petId);
    const journalRef = doc(db, 'users', ownerId, 'journals', 'records');
    const snap = await getDoc(journalRef);
    
    if (!snap.exists()) return;

    const data = snap.data();
    // SAFEGUARD: Default to [] if careJournal is undefined
    const list = (data.careJournal || []) as TimelineEntry[];
    const newList = list.filter(e => e.id !== entryId && e._id !== entryId);
    
    await updateDoc(journalRef, { careJournal: newList });
  }

  // --- REMINDERS (PLANNED CARE) - FIRESTORE (Stored in Subcollection) ---
  
  async addReminder(petId: string, reminder: Partial<Reminder>) { 
    const ownerId = await this.getOwnerId(petId);
    const newItem = { ...reminder, id: `REM-${Date.now()}`, completed: false };
    
    const journalRef = doc(db, 'users', ownerId, 'journals', 'records');
    await setDoc(journalRef, {
      plannedCare: arrayUnion(sanitize(newItem))
    }, { merge: true });
    
    return newItem as Reminder;
  }

  async updateReminder(petId: string, reminderId: string, updates: Partial<Reminder>) {
    const ownerId = await this.getOwnerId(petId);
    const journalRef = doc(db, 'users', ownerId, 'journals', 'records');
    const snap = await getDoc(journalRef);
    
    if (!snap.exists()) throw new Error("Journal record not found");

    const data = snap.data();
    const list = data.plannedCare as Reminder[];
    const idx = list.findIndex(r => r.id === reminderId || r._id === reminderId);

    if (idx > -1) {
       list[idx] = { ...list[idx], ...updates };
       await updateDoc(journalRef, { plannedCare: sanitize(list) });
       return list[idx];
    }
    throw new Error("Reminder not found");
  }

  async deleteReminder(petId: string, id: string) { 
    const ownerId = await this.getOwnerId(petId);
    const journalRef = doc(db, 'users', ownerId, 'journals', 'records');
    const snap = await getDoc(journalRef);

    if (snap.exists()) {
       const data = snap.data();
       // SAFEGUARD: Default to [] if plannedCare is undefined
       const list = (data.plannedCare || []) as Reminder[];
       const newList = list.filter(r => r.id !== id && r._id !== id);
       
       if (list.length !== newList.length) {
          await updateDoc(journalRef, { plannedCare: newList });
       }
    }
  }

  // --- DOCUMENTS (Local Storage for now) ---
  async addDocument(petId: string, doc: Partial<PetDocument>) { return this.updatePetCollection(petId, 'documents', doc, 'add'); }
  async renameDocument(petId: string, docId: string, newName: string) { return this.updatePetCollection(petId, 'documents', { name: newName }, 'update', docId); }
  async deleteDocument(docId: string) {
    const localDb = getLocalDB();
    for (const pid in localDb.petData) {
        if (localDb.petData[pid].documents) {
            localDb.petData[pid].documents = localDb.petData[pid].documents.filter((d: any) => d.id !== docId && d._id !== docId);
        }
    }
    saveLocalDB(localDb);
  }

  // --- CHECKLIST & LOGS (Local Storage for now) ---
  async updateChecklist(petId: string, checklist: DailyChecklist) {
      const localDb = getLocalDB();
      if (!localDb.petData[petId]) localDb.petData[petId] = {};
      localDb.petData[petId].checklist = checklist;
      saveLocalDB(localDb);
      return checklist;
  }

  async updateDailyLog(petId: string, date: string, log: Partial<DailyLog>) {
      const localDb = getLocalDB();
      if (!localDb.petData[petId]) localDb.petData[petId] = {};
      if (!localDb.petData[petId].dailyLogs) localDb.petData[petId].dailyLogs = {};
      
      const current = localDb.petData[petId].dailyLogs[date] || {};
      const updated = { ...current, ...log };
      localDb.petData[petId].dailyLogs[date] = updated;
      
      saveLocalDB(localDb);
      return updated;
  }

  // --- DOCTOR NOTES (Local Storage for now) ---
  async addDoctorNote(note: Partial<DoctorNote>) {
      const localDb = getLocalDB();
      const newNote = { ...note, id: `NOTE-${Date.now()}` };
      localDb.doctorNotes.unshift(newNote); // Add to top
      saveLocalDB(localDb);
      return newNote;
  }

  async deleteDoctorNote(id: string) {
      const localDb = getLocalDB();
      localDb.doctorNotes = localDb.doctorNotes.filter((n: any) => n.id !== id && n._id !== id);
      saveLocalDB(localDb);
  }
}

export const api = new ApiClient();
