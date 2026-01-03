
import { AuthUser, PetProfile, TimelineEntry, PetDocument, Reminder, DoctorNote, DailyLog, DailyChecklist, RoutineItem, Doctor, Species, Gender } from '../types';
import firebase from 'firebase/compat/app';
import { auth, db } from './firebase';
import 'firebase/compat/firestore';
import { uploadToImageKit } from './imagekit-service';

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
      activityMinutes: Math.floor(Math.random() * 45) + 30,
      moodRating: Math.floor(Math.random() * 2) + 3,
      feedingCount: Math.floor(Math.random() * 2) + 2
    });
  }
  return trends;
};

class ApiClient {
  // --- Private Helpers ---
  private userDoc(uid: string) { return db.collection('users').doc(uid); }
  private journalDoc(uid: string) { return db.collection('users').doc(uid).collection('journals').doc('records'); }
  private homeDoc(uid: string) { return db.collection('users').doc(uid).collection('home').doc('dashboard'); }
  private filesDoc(uid: string) { return db.collection('users').doc(uid).collection('files').doc('uploads'); }
  private doctorVisitsColl(doctorId: string) { return this.userDoc(doctorId).collection('pet_visits'); }

  // --- Auth & Root Profile ---

  async register(data: any): Promise<AuthUser> {
    const { username, password, role, petDetails, doctorDetails } = data;
    const creds = await auth.createUserWithEmailAndPassword(username, password);
    const uid = creds.user!.uid;

    await creds.user!.sendEmailVerification();

    const newUser: Partial<AuthUser> = {
      id: uid,
      username: creds.user!.email || username,
      role: role
    };

    if (role === 'PET_OWNER' && petDetails) {
      newUser.petDetails = { ...petDetails, id: `PET-${uid}` };
      newUser.petId = newUser.petDetails.id;
    } else if (role === 'DOCTOR' && doctorDetails) {
      newUser.doctorDetails = { ...doctorDetails, id: `DOC-${uid}` };
    }

    await this.userDoc(uid).set(sanitize(newUser));
    
    await this.journalDoc(uid).set({ 
      careJournal: [], 
      plannedCare: [], 
      doctorNotes: [], 
      clinicalNotes: [], 
      medicalNetworks: [] 
    });
    
    await this.filesDoc(uid).set({
      documents: []
    });
    
    await this.homeDoc(uid).set({ 
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
    const creds = await auth.signInWithEmailAndPassword(username, password);
    const uid = creds.user!.uid;

    if (!creds.user!.emailVerified) {
      const error: any = new Error('Email not verified');
      error.code = 'auth/email-not-verified';
      throw error;
    }

    const snap = await this.userDoc(uid).get();
    if (snap.exists) return snap.data() as AuthUser;

    const fallback: AuthUser = { id: uid, username: creds.user!.email || username, role: 'PET_OWNER' };
    await this.userDoc(uid).set(sanitize(fallback));
    return fallback;
  }

  async logout() { await auth.signOut(); }
  async resendVerificationEmail() { if (auth.currentUser) await auth.currentUser.sendEmailVerification(); }
  async sendPasswordReset(email: string) { await auth.sendPasswordResetEmail(email); }
  async getUserProfile(uid: string) {
    const snap = await this.userDoc(uid).get();
    return snap.exists ? snap.data() as AuthUser : null;
  }

  async deleteAccount() {
    const user = auth.currentUser;
    if (!user) return;
    const uid = user.uid;
    await this.homeDoc(uid).delete();
    await this.journalDoc(uid).delete();
    await this.filesDoc(uid).delete(); 
    await this.userDoc(uid).delete();
    await user.delete();
  }

  async uploadFile(file: File): Promise<{ url: string, fileId: string }> {
    const result = await uploadToImageKit(file);
    return { url: result.url, fileId: result.fileId };
  }

  /**
   * Helper to delete an item from an array in a document.
   */
  private async deleteNestedArrayNode(ref: firebase.firestore.DocumentReference, arrayName: string, targetId: string) {
    const snap = await ref.get();
    if (!snap.exists) return false;

    const data = snap.data();
    const currentArray = data ? (data[arrayName] || []) : [];
    
    const normalizedTarget = String(targetId).trim().toLowerCase();
    const filtered = currentArray.filter((item: any) => {
        const itemId = String(item.id || '').trim().toLowerCase();
        return itemId !== normalizedTarget;
    });
    
    if (filtered.length === currentArray.length) return false;

    try {
        await ref.update({ [arrayName]: filtered });
        return true;
    } catch (err) {
        console.error(`[API] deleteNestedArrayNode Error:`, err);
        return false;
    }
  }

  /**
   * Helper to update an item in an array in a document.
   */
  private async updateNestedArrayNode(ref: firebase.firestore.DocumentReference, arrayName: string, targetId: string, updates: any) {
    const snap = await ref.get();
    if (!snap.exists) return false;

    const currentArray = snap.data()![arrayName] || [];
    const updated = currentArray.map((item: any) => 
      String(item.id).trim() === String(targetId).trim() ? { ...item, ...updates } : item
    );

    await ref.update({ [arrayName]: sanitize(updated) });
    return true;
  }

  /**
   * Aggregates data from multiple Firestore collections for a pet owner.
   */
  async getPetRecords(uid: string) {
    try {
      const [userSnap, journalSnap, homeSnap, filesSnap] = await Promise.all([
        this.userDoc(uid).get(),
        this.journalDoc(uid).get(),
        this.homeDoc(uid).get(),
        this.filesDoc(uid).get()
      ]);

      if (!userSnap.exists) return null;

      const root = userSnap.data()!;
      const journal = journalSnap.exists ? journalSnap.data()! : { careJournal: [], plannedCare: [], doctorNotes: [], clinicalNotes: [], medicalNetworks: [] };
      const home = homeSnap.exists ? homeSnap.data()! : { 
        checklist: { food: false, water: false, walk: false, medication: false, lastReset: new Date().toISOString() },
        routines: [],
        recordedTrends: []
      };

      let documents = [];
      const filesData = filesSnap.exists ? filesSnap.data() : null;
      let existingFiles = filesData?.documents || [];
      
      // Migration logic: move legacy documents from root profile to dedicated collection
      if (root.documents && Array.isArray(root.documents) && root.documents.length > 0) {
        const combined = [...existingFiles];
        const existingIds = new Set(combined.map((d:any) => d.id));
        
        root.documents.forEach((d: any) => {
          if (!existingIds.has(d.id)) combined.push(d);
        });

        await this.filesDoc(uid).set({ documents: sanitize(combined) }, { merge: true });
        await this.userDoc(uid).update({ documents: firebase.firestore.FieldValue.delete() });
        documents = combined;
      } else {
        documents = existingFiles;
      }

      const logs: Record<string, DailyLog> = {};
      (home.recordedTrends || []).forEach((entry: any) => {
        logs[entry.date] = {
          activityMinutes: entry.activityMinutes,
          moodRating: entry.moodRating,
          feedingCount: entry.feedingCount
        };
      });

      return {
        timeline: journal.careJournal || [],
        reminders: journal.plannedCare || [],
        documents: documents,
        checklist: home.checklist,
        routines: home.routines || [],
        dailyLogs: logs,
        doctorNotes: journal.doctorNotes || [],
        clinicalNotes: journal.clinicalNotes || [],
        medicalNetworks: journal.medicalNetworks || [],
        lastDoctorVisit: root.lastDoctorVisit,
        lastDoctorId: root.lastDoctorId
      };
    } catch (e) {
      console.error("Failed to get pet records:", e);
      return null;
    }
  }

  async updatePetProfile(uid: string, updated: PetProfile) {
    await this.userDoc(uid).update({ petDetails: sanitize(updated) });
  }

  async updateChecklist(uid: string, checklist: DailyChecklist) {
    await this.homeDoc(uid).update({ checklist: sanitize(checklist) });
  }

  async resetDailyTasks(uid: string, resetRoutines: RoutineItem[]) {
    await this.homeDoc(uid).update({
      checklist: { food: false, water: false, walk: false, medication: false, lastReset: new Date().toISOString() },
      routines: sanitize(resetRoutines)
    });
  }

  async updateDailyLog(uid: string, date: string, data: Partial<DailyLog>) {
    const snap = await this.homeDoc(uid).get();
    if (!snap.exists) return;
    const trends: StoredTrendEntry[] = snap.data()!.recordedTrends || [];
    const idx = trends.findIndex(t => t.date === date);
    if (idx >= 0) {
      trends[idx] = { ...trends[idx], ...data };
    } else {
      trends.push({ date, activityMinutes: 0, moodRating: 3, feedingCount: 0, ...data });
    }
    await this.homeDoc(uid).update({ recordedTrends: sanitize(trends) });
  }

  async addRoutine(uid: string, item: Partial<RoutineItem>) {
    const newItem = { id: Math.random().toString(36).substr(2, 9), completed: false, ...item };
    await this.homeDoc(uid).update({
      routines: firebase.firestore.FieldValue.arrayUnion(sanitize(newItem))
    });
    return newItem as RoutineItem;
  }

  async updateRoutine(uid: string, id: string, updates: Partial<RoutineItem>) {
    return this.updateNestedArrayNode(this.homeDoc(uid), 'routines', id, updates);
  }

  async deleteRoutine(uid: string, id: string) {
    return this.deleteNestedArrayNode(this.homeDoc(uid), 'routines', id);
  }

  async addTimelineEntry(uid: string, entry: Partial<TimelineEntry>) {
    const newEntry = { id: Math.random().toString(36).substr(2, 9), ...entry };
    await this.journalDoc(uid).update({
      careJournal: firebase.firestore.FieldValue.arrayUnion(sanitize(newEntry))
    });
    return newEntry as TimelineEntry;
  }

  async updateTimelineEntry(uid: string, id: string, updates: Partial<TimelineEntry>) {
    return this.updateNestedArrayNode(this.journalDoc(uid), 'careJournal', id, updates);
  }

  async deleteTimelineEntry(uid: string, id: string) {
    return this.deleteNestedArrayNode(this.journalDoc(uid), 'careJournal', id);
  }

  async addReminder(uid: string, reminder: Partial<Reminder>) {
    const newReminder = { id: Math.random().toString(36).substr(2, 9), completed: false, ...reminder };
    await this.journalDoc(uid).update({
      plannedCare: firebase.firestore.FieldValue.arrayUnion(sanitize(newReminder))
    });
    return newReminder as Reminder;
  }

  async updateReminder(uid: string, id: string, updates: Partial<Reminder>) {
    return this.updateNestedArrayNode(this.journalDoc(uid), 'plannedCare', id, updates);
  }

  async deleteReminder(uid: string, id: string) {
    return this.deleteNestedArrayNode(this.journalDoc(uid), 'plannedCare', id);
  }

  async addDocument(uid: string, doc: Partial<PetDocument>) {
    const newDoc = { id: Math.random().toString(36).substr(2, 9), ...doc };
    await this.filesDoc(uid).update({
      documents: firebase.firestore.FieldValue.arrayUnion(sanitize(newDoc))
    });
    return newDoc as PetDocument;
  }

  async renameDocument(uid: string, id: string, name: string) {
    return this.updateNestedArrayNode(this.filesDoc(uid), 'documents', id, { name });
  }

  async deleteDocument(uid: string, id: string) {
    return this.deleteNestedArrayNode(this.filesDoc(uid), 'documents', id);
  }

  async addDoctorNote(uid: string, note: DoctorNote) {
    await this.journalDoc(uid).update({
      doctorNotes: firebase.firestore.FieldValue.arrayUnion(sanitize(note))
    });
    return note;
  }

  async deleteDoctorNote(uid: string, id: string) {
    return this.deleteNestedArrayNode(this.journalDoc(uid), 'doctorNotes', id);
  }

  async removeDoctorFromNetwork(uid: string, doctorId: string) {
    return this.deleteNestedArrayNode(this.journalDoc(uid), 'medicalNetworks', doctorId);
  }

  async logDoctorVisit(petId: string, doctorId: string) {
    const uid = petId.replace('PET-', '');
    const date = new Date().toISOString();
    
    // 1. Snapshot patient reminders for the doctor's alert logs
    const records = await this.getPetRecords(uid);
    const urgentAlerts = (records?.reminders || [])
      .filter(r => !r.completed)
      .map(r => ({
        id: r.id,
        title: r.title,
        date: r.date,
        type: r.type,
        loggedAt: date
      }));

    // 2. Update Patient's root for Last Visit badges
    await this.userDoc(uid).update({
      lastDoctorVisit: date,
      lastDoctorId: doctorId
    });
    
    // 3. Add doctor to patient's Medical Network list
    const docProfile = await this.getUserProfile(doctorId);
    if (docProfile?.doctorDetails) {
      const journalSnap = await this.journalDoc(uid).get();
      const networks = journalSnap.exists ? (journalSnap.data()!.medicalNetworks || []) : [];
      if (!networks.some((n: any) => n.id === doctorId)) {
        await this.journalDoc(uid).update({
          medicalNetworks: firebase.firestore.FieldValue.arrayUnion(sanitize(docProfile.doctorDetails))
        });
      }
    }
    
    // 4. Log to DOCTOR'S private sub-collection with the snapshot of alerts
    await this.doctorVisitsColl(doctorId).doc(uid).set({
      id: petId,
      lastVisit: date,
      alerts: sanitize(urgentAlerts) // The Array requested to store the logs
    });
  }

  async getDoctorVisitedPatients(doctorId: string) {
    const snap = await this.doctorVisitsColl(doctorId).get();
    
    const patients = await Promise.all(snap.docs.map(async (doc) => {
      const uid = doc.id;
      const profile = await this.getUserProfile(uid);
      
      if (profile?.petDetails) {
        return {
          id: `PET-${uid}`,
          petName: profile.petDetails.name,
          breed: profile.petDetails.breed,
          petAvatar: profile.petDetails.avatar,
          species: profile.petDetails.species,
          lastVisit: doc.data().lastVisit,
          alerts: doc.data().alerts || [] // Retrieve the stored array of logs/alerts
        };
      }
      return null;
    }));

    return patients.filter(p => p !== null);
  }

  async deleteDoctorAlert(doctorId: string, petId: string, alertId: string) {
    const uid = petId.replace('PET-', '');
    const docRef = this.doctorVisitsColl(doctorId).doc(uid);
    const snap = await docRef.get();
    
    if (snap.exists) {
      const currentAlerts = snap.data()?.alerts || [];
      const updated = currentAlerts.filter((a: any) => a.id !== alertId);
      await docRef.update({ alerts: sanitize(updated) });
      return true;
    }
    return false;
  }

  async updateDoctorProfile(doctorId: string, data: Partial<Doctor>) {
    await this.userDoc(doctorId).update({ doctorDetails: sanitize(data) });
    return data;
  }
}

export const api = new ApiClient();
