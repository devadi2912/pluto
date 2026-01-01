
import { AuthUser, PetProfile, TimelineEntry, PetDocument, Reminder, DoctorNote, DailyLog, DailyChecklist, RoutineItem, Doctor, Species, Gender } from '../types';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';

/**
 * Sanitizes objects for Firestore by removing undefined fields recursively.
 */
const sanitize = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(sanitize);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const val = sanitize(obj[key]);
      if (val !== undefined) acc[key] = val;
      return acc;
    }, {} as any);
  }
  return obj;
};

class ApiClient {
  // --- Private Helpers ---
  private userDoc(uid: string) { return doc(db, 'users', uid); }
  private journalDoc(uid: string) { return doc(db, 'users', uid, 'journals', 'records'); }

  // --- Auth & Root Profile ---

  async register(data: any): Promise<AuthUser> {
    const { username, password, role, petDetails, doctorDetails } = data;
    const creds = await createUserWithEmailAndPassword(auth, username, password);
    const uid = creds.user.uid;

    await sendEmailVerification(creds.user);

    const newUser: Partial<AuthUser> = {
      id: uid,
      username: creds.user.email || username,
      role: role
    };

    if (role === 'PET_OWNER' && petDetails) {
      newUser.petDetails = { ...petDetails, id: `PET-${uid}` };
      newUser.petId = newUser.petDetails.id;
    } else if (role === 'DOCTOR' && doctorDetails) {
      newUser.doctorDetails = { ...doctorDetails, id: `DOC-${uid}` };
    }

    // Initialize both root and sub-collection docs
    await setDoc(this.userDoc(uid), sanitize(newUser));
    await setDoc(this.journalDoc(uid), { careJournal: [], plannedCare: [], doctorNotes: [] });

    return newUser as AuthUser;
  }

  async login(credentials: any): Promise<AuthUser> {
    const { username, password } = credentials;
    const creds = await signInWithEmailAndPassword(auth, username, password);
    const uid = creds.user.uid;

    if (!creds.user.emailVerified) {
      const error: any = new Error('Email not verified');
      error.code = 'auth/email-not-verified';
      throw error;
    }

    const snap = await getDoc(this.userDoc(uid));
    if (snap.exists()) return snap.data() as AuthUser;

    // Auto-repair if root doc is missing
    const fallback: AuthUser = { id: uid, username: creds.user.email || username, role: 'PET_OWNER' };
    await setDoc(this.userDoc(uid), sanitize(fallback));
    await setDoc(this.journalDoc(uid), { careJournal: [], plannedCare: [], doctorNotes: [] }, { merge: true });
    return fallback;
  }

  async logout() { await signOut(auth); }
  async resendVerificationEmail() { if (auth.currentUser) await sendEmailVerification(auth.currentUser); }
  async sendPasswordReset(email: string) { await sendPasswordResetEmail(auth, email); }
  async getUserProfile(uid: string) {
    const snap = await getDoc(this.userDoc(uid));
    return snap.exists() ? snap.data() as AuthUser : null;
  }

  async deleteAccount() {
    const user = auth.currentUser;
    if (!user) return;
    const uid = user.uid;
    await deleteDoc(this.journalDoc(uid));
    await deleteDoc(this.userDoc(uid));
    await deleteUser(user);
  }

  // --- Array Node Logic ---

  private async deleteNestedArrayNode(uid: string, arrayName: 'plannedCare' | 'careJournal' | 'doctorNotes', targetId: string) {
    const ref = this.journalDoc(uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;

    const currentArray = snap.data()[arrayName] || [];
    const filtered = currentArray.filter((item: any) => String(item.id).trim() !== String(targetId).trim());
    
    if (filtered.length === currentArray.length) return false;

    await updateDoc(ref, { [arrayName]: filtered });
    return true;
  }

  private async updateNestedArrayNode(uid: string, arrayName: 'plannedCare' | 'careJournal' | 'doctorNotes', targetId: string, updates: any) {
    const ref = this.journalDoc(uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;

    const currentArray = snap.data()[arrayName] || [];
    const updated = currentArray.map((item: any) => 
      String(item.id).trim() === String(targetId).trim() ? { ...item, ...updates } : item
    );

    await updateDoc(ref, { [arrayName]: sanitize(updated) });
    return true;
  }

  // --- Data Hydration ---

  async getPetRecords(uid: string) {
    try {
      const [userSnap, journalSnap] = await Promise.all([
        getDoc(this.userDoc(uid)),
        getDoc(this.journalDoc(uid))
      ]);

      if (!userSnap.exists()) return null;

      const root = userSnap.data();
      const journal = journalSnap.exists() ? journalSnap.data() : { careJournal: [], plannedCare: [], doctorNotes: [] };

      return {
        timeline: (journal.careJournal || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        reminders: (journal.plannedCare || []).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        doctorNotes: (journal.doctorNotes || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        documents: root.documents || [],
        checklist: root.checklist || { food: false, water: false, walk: false, medication: false, lastReset: new Date().toISOString() },
        dailyLogs: root.dailyLogs || {},
        routines: root.routines || []
      };
    } catch (e) {
      console.error("Hydration Error:", e);
      return null;
    }
  }

  // --- Specialized Updates ---

  async updatePetProfile(uid: string, updates: Partial<PetProfile>): Promise<PetProfile> {
    const snap = await getDoc(this.userDoc(uid));
    if (!snap.exists()) throw new Error("Profile not found");
    const updated = { ...(snap.data() as AuthUser).petDetails, ...updates };
    await updateDoc(this.userDoc(uid), { petDetails: sanitize(updated) });
    return updated as PetProfile;
  }

  async addTimelineEntry(uid: string, entry: Partial<TimelineEntry>) {
    const newItem = { ...entry, id: `ENTRY-${Date.now()}` };
    await setDoc(this.journalDoc(uid), { careJournal: arrayUnion(sanitize(newItem)) }, { merge: true });
    return newItem as TimelineEntry;
  }

  async updateTimelineEntry(uid: string, id: string, updates: Partial<TimelineEntry>) {
    return this.updateNestedArrayNode(uid, 'careJournal', id, updates);
  }

  async deleteTimelineEntry(uid: string, id: string) { return this.deleteNestedArrayNode(uid, 'careJournal', id); }

  async addReminder(uid: string, reminder: Partial<Reminder>) {
    const newItem = { ...reminder, id: `REM-${Date.now()}`, completed: false };
    await setDoc(this.journalDoc(uid), { plannedCare: arrayUnion(sanitize(newItem)) }, { merge: true });
    return newItem as Reminder;
  }

  async updateReminder(uid: string, id: string, updates: Partial<Reminder>) {
    return this.updateNestedArrayNode(uid, 'plannedCare', id, updates);
  }

  async deleteReminder(uid: string, id: string) { return this.deleteNestedArrayNode(uid, 'plannedCare', id); }

  async addDoctorNote(uid: string, note: Partial<DoctorNote>) {
    const newItem = { ...note, id: `NOTE-${Date.now()}` };
    await setDoc(this.journalDoc(uid), { doctorNotes: arrayUnion(sanitize(newItem)) }, { merge: true });
    return newItem as DoctorNote;
  }

  async updateChecklist(uid: string, checklist: DailyChecklist) {
    await updateDoc(this.userDoc(uid), { checklist: sanitize(checklist) });
  }

  async addDocument(uid: string, docData: Partial<PetDocument>) {
    const newItem = { ...docData, id: `DOC-${Date.now()}` };
    await updateDoc(this.userDoc(uid), { documents: arrayUnion(sanitize(newItem)) });
    return newItem as PetDocument;
  }

  async renameDocument(uid: string, docId: string, newName: string) {
    const snap = await getDoc(this.userDoc(uid));
    if (!snap.exists()) return;
    const updated = (snap.data().documents || []).map((d: any) => d.id === docId ? { ...d, name: newName } : d);
    await updateDoc(this.userDoc(uid), { documents: sanitize(updated) });
  }

  async deleteDocument(uid: string, docId: string) {
    const snap = await getDoc(this.userDoc(uid));
    if (!snap.exists()) return;
    const filtered = (snap.data().documents || []).filter((d: any) => d.id !== docId);
    await updateDoc(this.userDoc(uid), { documents: sanitize(filtered) });
  }

  async logDoctorVisit(petId: string, doctorId: string) {
    const uid = petId.replace('PET-', '');
    await updateDoc(this.userDoc(uid), { lastDoctorVisit: new Date().toISOString(), lastDoctorId: doctorId });
  }

  async updateDoctorProfile(uid: string, updates: Partial<Doctor>): Promise<Doctor> {
    const snap = await getDoc(this.userDoc(uid));
    if (!snap.exists()) throw new Error("Doctor not found");
    const updated = { ...(snap.data() as AuthUser).doctorDetails, ...updates };
    await updateDoc(this.userDoc(uid), { doctorDetails: sanitize(updated) });
    return updated as Doctor;
  }
}

export const api = new ApiClient();
