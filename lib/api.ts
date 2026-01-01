
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

interface StoredTrendEntry extends DailyLog {
  date: string;
}

/**
 * Generates 7 days of demo data ending today.
 */
const generateDemoTrends = (): StoredTrendEntry[] => {
  const trends: StoredTrendEntry[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    trends.push({
      date: d.toISOString().split('T')[0],
      activityMinutes: Math.floor(Math.random() * 45) + 30, // 30-75 mins
      moodRating: Math.floor(Math.random() * 2) + 3,       // 3-4 rating
      feedingCount: Math.floor(Math.random() * 2) + 2      // 2-3 meals
    });
  }
  return trends;
};

class ApiClient {
  // --- Private Helpers ---
  private userDoc(uid: string) { return doc(db, 'users', uid); }
  private journalDoc(uid: string) { return doc(db, 'users', uid, 'journals', 'records'); }
  private homeDoc(uid: string) { return doc(db, 'users', uid, 'home', 'dashboard'); }

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

    // Initialize all sub-collection docs
    await setDoc(this.userDoc(uid), sanitize(newUser));
    // Added clinicalNotes and medicalNetworks to journal doc
    await setDoc(this.journalDoc(uid), { 
      careJournal: [], 
      plannedCare: [], 
      doctorNotes: [], 
      clinicalNotes: [], 
      medicalNetworks: [] 
    });
    
    await setDoc(this.homeDoc(uid), { 
      checklist: { food: false, water: false, walk: false, medication: false, lastReset: new Date().toISOString() },
      routines: [
        { id: 'R1', title: 'Morning Walk', time: '08:00', category: 'Walk', completed: false },
        { id: 'R2', title: 'Breakfast', time: '09:00', category: 'Food', completed: false },
        { id: 'R3', title: 'Evening Play', time: '18:00', category: 'Play', completed: false }
      ],
      recordedTrends: role === 'PET_OWNER' ? generateDemoTrends() : []
    });

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

    const fallback: AuthUser = { id: uid, username: creds.user.email || username, role: 'PET_OWNER' };
    await setDoc(this.userDoc(uid), sanitize(fallback));
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
    await deleteDoc(this.homeDoc(uid));
    await deleteDoc(this.journalDoc(uid));
    await deleteDoc(this.userDoc(uid));
    await deleteUser(user);
  }

  // --- Array Node Logic ---

  private async deleteNestedArrayNode(ref: any, arrayName: string, targetId: string) {
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;

    const currentArray = snap.data()[arrayName] || [];
    const filtered = currentArray.filter((item: any) => String(item.id).trim() !== String(targetId).trim());
    
    if (filtered.length === currentArray.length) return false;

    await updateDoc(ref, { [arrayName]: filtered });
    return true;
  }

  private async updateNestedArrayNode(ref: any, arrayName: string, targetId: string, updates: any) {
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
      const [userSnap, journalSnap, homeSnap] = await Promise.all([
        getDoc(this.userDoc(uid)),
        getDoc(this.journalDoc(uid)),
        getDoc(this.homeDoc(uid))
      ]);

      if (!userSnap.exists()) return null;

      const root = userSnap.data();
      const journal = journalSnap.exists() ? journalSnap.data() : { careJournal: [], plannedCare: [], doctorNotes: [], clinicalNotes: [], medicalNetworks: [] };
      const home = homeSnap.exists() ? homeSnap.data() : { 
        checklist: { food: false, water: false, walk: false, medication: false, lastReset: new Date().toISOString() },
        routines: [],
        recordedTrends: []
      };

      const dailyLogs: Record<string, DailyLog> = {};
      const trends = home.recordedTrends || [];
      
      trends.forEach((entry: StoredTrendEntry) => {
        dailyLogs[entry.date] = {
          activityMinutes: entry.activityMinutes,
          moodRating: entry.moodRating,
          feedingCount: entry.feedingCount
        };
      });

      return {
        timeline: (journal.careJournal || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        reminders: (journal.plannedCare || []).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        doctorNotes: (journal.doctorNotes || journal.clinicalNotes || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        clinicalNotes: (journal.clinicalNotes || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        medicalNetworks: journal.medicalNetworks || [],
        documents: root.documents || [],
        checklist: home.checklist || { food: false, water: false, walk: false, medication: false, lastReset: new Date().toISOString() },
        dailyLogs,
        routines: (home.routines || []).sort((a: any, b: any) => a.time.localeCompare(b.time)),
        recordedTrends: trends
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
    return this.updateNestedArrayNode(this.journalDoc(uid), 'careJournal', id, updates);
  }

  async deleteTimelineEntry(uid: string, id: string) { return this.deleteNestedArrayNode(this.journalDoc(uid), 'careJournal', id); }

  async addReminder(uid: string, reminder: Partial<Reminder>) {
    const newItem = { ...reminder, id: `REM-${Date.now()}`, completed: false };
    await setDoc(this.journalDoc(uid), { plannedCare: arrayUnion(sanitize(newItem)) }, { merge: true });
    return newItem as Reminder;
  }

  async updateReminder(uid: string, id: string, updates: Partial<Reminder>) {
    return this.updateNestedArrayNode(this.journalDoc(uid), 'plannedCare', id, updates);
  }

  async deleteReminder(uid: string, id: string) { return this.deleteNestedArrayNode(this.journalDoc(uid), 'plannedCare', id); }

  async addDoctorNote(uid: string, note: Partial<DoctorNote>) {
    const newItem = { ...note, id: `NOTE-${Date.now()}` };
    // Maintain backward compatibility by adding to both slots if necessary
    await setDoc(this.journalDoc(uid), { 
      doctorNotes: arrayUnion(sanitize(newItem)),
      clinicalNotes: arrayUnion(sanitize(newItem))
    }, { merge: true });
    return newItem as DoctorNote;
  }

  async deleteDoctorNote(uid: string, id: string) {
    await this.deleteNestedArrayNode(this.journalDoc(uid), 'doctorNotes', id);
    return this.deleteNestedArrayNode(this.journalDoc(uid), 'clinicalNotes', id);
  }

  async updateChecklist(uid: string, checklist: DailyChecklist) {
    await updateDoc(this.homeDoc(uid), { checklist: sanitize(checklist) });
  }

  // --- Recorded Trends ---

  async updateDailyLog(uid: string, todayDate: string, data: Partial<DailyLog>) {
    const ref = this.homeDoc(uid);
    const snap = await getDoc(ref);
    let currentTrends: StoredTrendEntry[] = snap.exists() ? (snap.data().recordedTrends || []) : [];
    
    if (currentTrends.length === 0) {
      currentTrends = generateDemoTrends();
    }

    const lastEntry = currentTrends[currentTrends.length - 1];

    if (lastEntry.date === todayDate) {
      currentTrends[currentTrends.length - 1] = { ...lastEntry, ...data };
    } else if (todayDate > lastEntry.date) {
      const lastDate = new Date(lastEntry.date);
      const today = new Date(todayDate);
      const diffMs = today.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      for (let i = 1; i < diffDays; i++) {
        const gapDate = new Date(lastDate);
        gapDate.setDate(gapDate.getDate() + i);
        currentTrends.push({
          date: gapDate.toISOString().split('T')[0],
          activityMinutes: 0,
          moodRating: 1, 
          feedingCount: 0
        });
      }

      currentTrends.push({ 
        date: todayDate, 
        activityMinutes: 0, 
        moodRating: 3, 
        feedingCount: 0, 
        ...data 
      });
    }

    const finalTrends = currentTrends.slice(-7);
    await updateDoc(ref, { recordedTrends: sanitize(finalTrends) });
  }

  // --- Routine Methods ---

  async addRoutine(uid: string, routine: Partial<RoutineItem>) {
    const newItem = { ...routine, id: `ROUTINE-${Date.now()}`, completed: false };
    await setDoc(this.homeDoc(uid), { routines: arrayUnion(sanitize(newItem)) }, { merge: true });
    return newItem as RoutineItem;
  }

  async updateRoutine(uid: string, id: string, updates: Partial<RoutineItem>) {
    return this.updateNestedArrayNode(this.homeDoc(uid), 'routines', id, updates);
  }

  async deleteRoutine(uid: string, id: string) {
    return this.deleteNestedArrayNode(this.homeDoc(uid), 'routines', id);
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
    // Fetch doctor details to add to pet's medical network
    const docSnap = await getDoc(this.userDoc(doctorId));
    if (docSnap.exists()) {
      const docData = docSnap.data().doctorDetails;
      if (docData) {
        // Add doctor to medicalNetworks array in pet's journal
        const journalRef = this.journalDoc(uid);
        const journalSnap = await getDoc(journalRef);
        const currentNetwork = journalSnap.exists() ? (journalSnap.data().medicalNetworks || []) : [];
        
        // Prevent duplicates
        if (!currentNetwork.find((d: any) => d.id === docData.id)) {
           await setDoc(journalRef, { medicalNetworks: arrayUnion(sanitize(docData)) }, { merge: true });
        }
      }
    }
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
