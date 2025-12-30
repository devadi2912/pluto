import React, { useState } from 'react';
import { UserRole, AuthUser, Species, Gender } from '../types';
import { api } from '../lib/api';

interface RegisterScreenProps {
  onNavigate: (view: 'START' | 'LOGIN' | 'REGISTER') => void;
  onRegister: (user: AuthUser) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigate, onRegister }) => {
  const [role, setRole] = useState<UserRole>('PET_OWNER');
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Auth Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Pet Fields
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState<Species>(Species.Dog);
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.Unknown);
  const [dob, setDob] = useState('');
  const [weight, setWeight] = useState('');
  const [color, setColor] = useState('');
  const [microchip, setMicrochip] = useState('');

  // Doctor Fields
  const [docName, setDocName] = useState('');
  const [docSpec, setDocSpec] = useState('');
  const [docClinic, setDocClinic] = useState('');
  const [docExp, setDocExp] = useState('');
  const [docQual, setDocQual] = useState('');
  const [docRegId, setDocRegId] = useState('');
  const [docFocus, setDocFocus] = useState('');
  const [docContact, setDocContact] = useState('');
  const [docEmerg, setDocEmerg] = useState('');
  const [docAddress, setDocAddress] = useState('');
  const [docHours, setDocHours] = useState('');

  const theme = role === 'PET_OWNER' ? 'indigo' : 'emerald';

  const handleRegister = async () => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      alert("Please enter both a username and password.");
      return;
    }

    setIsLoading(true);
    console.log(`[Registration] Connecting to Node.js Backend for: ${cleanUsername}`);

    try {
      // Prepare payload for the backend
      const payload: any = {
        username: cleanUsername,
        password: cleanPassword,
        role: role
      };

      if (role === 'PET_OWNER') {
        if (!petName.trim()) throw new Error("A pet name is required.");
        payload.petDetails = {
          name: petName,
          species,
          breed: breed || 'Mixed/Unknown',
          dob: dob || null,
          gender: gender || Gender.Unknown,
          weight: weight || '0',
          color: color || '',
          microchip: microchip || '',
          avatar_url: species === Species.Cat 
            ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400&h=400' 
            : 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400&h=400'
        };
      } else {
        if (!docName.trim()) throw new Error("A professional name is required.");
        payload.doctorDetails = {
          full_name: docName,
          specialization: docSpec || 'General Veterinary',
          clinic_name: docClinic || 'Private Practice',
          experience: docExp || '1 Year',
          qualifications: docQual || 'DVM',
          registration_id: docRegId || 'VET-PENDING',
          address: docAddress || 'Pending',
          contact: docContact || 'Pending',
          emergency_contact: docEmerg || 'Pending',
          consultation_hours: docHours || 'Mon-Fri 09:00-17:00',
          medical_focus: docFocus || 'General Medicine'
        };
      }

      // Single API call to our new Node.js server
      const newUser = await api.register(payload);
      
      console.log(`[Registration] SUCCESS. Data logged to MongoDB via Node.js`);
      onRegister(newUser);
      alert(`Account for '${cleanUsername}' created successfully! Please log in.`);
      onNavigate('LOGIN');
    } catch (err: any) {
      console.error("[Registration] Backend Error:", err.message);
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 w-full h-full bg-${theme}-50 dark:bg-zinc-950 overflow-y-auto overflow-x-hidden no-scrollbar animate-in fade-in slide-in-from-right-10 duration-500`}>
       
       <style>{`
        @keyframes happy-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.1); }
        }
        @keyframes runAround {
          0% { transform: translate(0, 0) scaleX(1); }
          10% { transform: translate(35vw, -10vh) scaleX(1) rotate(10deg); }
          25% { transform: translate(40vw, 20vh) scaleX(1) rotate(90deg); }
          40% { transform: translate(0, 35vh) scaleX(-1) rotate(10deg); }
          60% { transform: translate(-40vw, 20vh) scaleX(-1) rotate(-10deg); }
          80% { transform: translate(-35vw, -20vh) scaleX(-1) rotate(-45deg); }
          100% { transform: translate(0, 0) scaleX(1) rotate(0deg); }
        }
        .animate-puppy-idle { animation: happy-bounce 2s ease-in-out infinite; }
        .animate-puppy-run { animation: runAround 3s ease-in-out forwards; z-index: 100; }
      `}</style>

       <button 
        onClick={() => onNavigate('START')}
        className="fixed top-6 left-6 w-12 h-12 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white shadow-md transition-all z-[100] border border-zinc-100 dark:border-zinc-800"
      >
        <i className="fa-solid fa-arrow-left"></i>
      </button>

      <div className="w-full min-h-full flex flex-col items-center py-10 px-6 md:px-12 pb-40">
         <div className="text-center mb-10 space-y-2 mt-12 md:mt-0 flex flex-col items-center">
           <div className="flex items-center justify-center gap-4 mb-2">
             <button 
               key={role}
               onClick={() => setIsRunning(true)}
               onAnimationEnd={() => setIsRunning(false)}
               className={`text-3xl text-${theme}-500 drop-shadow-xl filter cursor-pointer transition-all duration-300 hover:text-${theme}-600 hover:scale-110 ${isRunning ? 'animate-puppy-run pointer-events-none' : 'animate-puppy-idle'}`}
             >
                <i className="fa-solid fa-dog"></i>
             </button>
             <h2 className={`text-4xl md:text-5xl font-lobster text-${theme}-600 dark:text-${theme}-400`}>New {role === 'PET_OWNER' ? 'Family' : 'Professional'}</h2>
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Create your Pluto identity</p>
         </div>

         <div className="flex p-1.5 bg-white dark:bg-zinc-900 rounded-full shadow-lg border-2 border-zinc-100 dark:border-zinc-800 mb-10 relative z-10">
            <button 
              onClick={() => setRole('PET_OWNER')}
              disabled={isLoading}
              className={`px-8 py-3 rounded-full font-black text-[9px] uppercase tracking-widest transition-all ${
                role === 'PET_OWNER' ? 'bg-indigo-500 text-white shadow-md scale-105' : 'text-zinc-400 hover:text-indigo-500'
              } ${isLoading ? 'opacity-50' : ''}`}
            >
              Pet Owner
            </button>
            <button 
              onClick={() => setRole('DOCTOR')}
              disabled={isLoading}
              className={`px-8 py-3 rounded-full font-black text-[9px] uppercase tracking-widest transition-all ${
                role === 'DOCTOR' ? 'bg-emerald-500 text-white shadow-md scale-105' : 'text-zinc-400 hover:text-emerald-500'
              } ${isLoading ? 'opacity-50' : ''}`}
            >
              Doctor
            </button>
         </div>

         <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-2xl border-4 border-white dark:border-zinc-800 w-full max-w-4xl space-y-8">
            <div className="space-y-6">
               <h3 className="text-xl font-lobster text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-100 dark:border-zinc-800 pb-2">Login Credentials</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Username</label>
                     <input disabled={isLoading} value={username} onChange={e => setUsername(e.target.value)} className="w-full p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="Unique Handle" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Password</label>
                     <input disabled={isLoading} type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="Secret Key" />
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <h3 className={`text-xl font-lobster text-${theme}-600 dark:text-${theme}-400 border-b-2 border-zinc-100 dark:border-zinc-800 pb-2`}>
                 {role === 'PET_OWNER' ? 'Pet Profile' : 'Professional Profile'}
               </h3>
               
               {role === 'PET_OWNER' ? (
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Pet Name</label>
                          <input disabled={isLoading} value={petName} onChange={e => setPetName(e.target.value)} className="w-full p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border-2 border-transparent focus:border-indigo-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="e.g. Luna" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Species</label>
                          <div className="relative">
                            <select disabled={isLoading} value={species} onChange={e => setSpecies(e.target.value as Species)} className="w-full p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border-2 border-transparent focus:border-indigo-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm appearance-none cursor-pointer">
                               {Object.values(Species).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none"></i>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Breed</label>
                          <input disabled={isLoading} value={breed} onChange={e => setBreed(e.target.value)} className="w-full p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border-2 border-transparent focus:border-indigo-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="e.g. Retriever" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Gender</label>
                          <div className="relative">
                            <select disabled={isLoading} value={gender} onChange={e => setGender(e.target.value as Gender)} className="w-full p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border-2 border-transparent focus:border-indigo-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm appearance-none cursor-pointer">
                               {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none"></i>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Date of Birth</label>
                          <input disabled={isLoading} type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border-2 border-transparent focus:border-indigo-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Weight (kg)</label>
                          <input disabled={isLoading} value={weight} onChange={e => setWeight(e.target.value)} className="w-full p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border-2 border-transparent focus:border-indigo-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="e.g. 25" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Color</label>
                          <input disabled={isLoading} value={color} onChange={e => setColor(e.target.value)} className="w-full p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border-2 border-transparent focus:border-indigo-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="e.g. Golden" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Microchip ID</label>
                          <input disabled={isLoading} value={microchip} onChange={e => setMicrochip(e.target.value)} className="w-full p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border-2 border-transparent focus:border-indigo-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="Optional" />
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Full Name</label>
                          <input disabled={isLoading} value={docName} onChange={e => setDocName(e.target.value)} className="w-full p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-transparent focus:border-emerald-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="Dr. Jane Doe" />
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Specialization</label>
                          <input disabled={isLoading} value={docSpec} onChange={e => setDocSpec(e.target.value)} className="w-full p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-transparent focus:border-emerald-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="e.g. Surgery" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Qualifications</label>
                          <input disabled={isLoading} value={docQual} onChange={e => setDocQual(e.target.value)} className="w-full p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-transparent focus:border-emerald-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="e.g. DVM, PhD" />
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">License / Reg ID</label>
                          <input disabled={isLoading} value={docRegId} onChange={e => setDocRegId(e.target.value)} className="w-full p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-transparent focus:border-emerald-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="License #" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Years of Experience</label>
                          <input disabled={isLoading} value={docExp} onChange={e => setDocExp(e.target.value)} className="w-full p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-transparent focus:border-emerald-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="e.g. 8 Years" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Medical Focus</label>
                       <input disabled={isLoading} value={docFocus} onChange={e => setDocFocus(e.target.value)} className="w-full p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-transparent focus:border-emerald-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="e.g. Small animal orthopedics" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Primary Clinic</label>
                       <input disabled={isLoading} value={docClinic} onChange={e => setDocClinic(e.target.value)} className="w-full p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-transparent focus:border-emerald-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="e.g. City Vet" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Clinic Address</label>
                       <input disabled={isLoading} value={docAddress} onChange={e => setDocAddress(e.target.value)} className="w-full p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-transparent focus:border-emerald-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="123 Vet Lane" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Contact Number</label>
                          <input disabled={isLoading} value={docContact} onChange={e => setDocContact(e.target.value)} className="w-full p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-transparent focus:border-emerald-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="Phone" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Emergency Line</label>
                          <input disabled={isLoading} value={docEmerg} onChange={e => setDocEmerg(e.target.value)} className="w-full p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-transparent focus:border-emerald-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="Emergency Phone" />
                       </div>
                    </div>
                     <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2">Consultation Hours</label>
                          <input disabled={isLoading} value={docHours} onChange={e => setDocHours(e.target.value)} className="w-full p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-transparent focus:border-emerald-300 outline-none font-bold text-zinc-900 dark:text-zinc-100 text-sm" placeholder="e.g. Mon-Fri 09:00 - 17:00" />
                       </div>
                 </div>
               )}
            </div>

            <div className="pt-4">
              <button 
                onClick={handleRegister}
                disabled={isLoading}
                className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.25em] text-white transition-all bg-${theme}-500 border-4 border-white dark:border-zinc-950 hover:scale-[1.02] active:scale-[0.98] shadow-lg ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isLoading ? 'Processing...' : 'Register Account'}
              </button>
            </div>
         </div>
      </div>
    </div>
  );
};