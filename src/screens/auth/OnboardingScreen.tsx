// src/screens/auth/OnboardingScreen.tsx
import React, { useState, useRef } from 'react';
import { Camera, Plus, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { cn, INTEREST_CATEGORIES } from '../../types';

const uploadImage = async (file: File, token: string): Promise<string> => {
  const sigRes = await fetch('/api/upload-signature', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const { signature, timestamp, folder, cloud_name, api_key } = await sigRes.json();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', signature);
  formData.append('timestamp', timestamp.toString());
  formData.append('api_key', api_key);
  formData.append('folder', folder);
  formData.append('moderation', 'aws_rek');

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
    method: 'POST',
    body: formData
  });
  
  const data = await uploadRes.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
};

export const OnboardingScreen = ({ navigation }: any) => {
  const { user, token, setOnboardingComplete, setUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState(user?.profile_photo_url || '');
  const [uploading, setUploading] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user || !token) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, token);
      setPhoto(url);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else finish();
  };

  const finish = async () => {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: user.name,
        bio,
        interests,
        profile_photo_url: photo,
        location_city: city,
        phone_verified: false,
        onboarding_complete: true
      })
    });
    if (res.ok) {
      const updatedUser = await res.json();
      setUser(updatedUser);
      setOnboardingComplete(true);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col bg-obsidian">
      <div className="flex gap-2 mb-10">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className={cn('h-1.5 flex-1 rounded-full transition-all duration-500', s <= step ? 'bg-sunstone' : 'bg-white/10')} />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {step === 1 && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-bold mb-3 text-alabaster">Add a profile photo</h2>
            <p className="text-grey-mist mb-10">Let potential companions see who you are</p>
            <div className="relative w-48 h-48 mx-auto group">
              <div className="w-full h-full rounded-[2.5rem] bg-lava border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden rotate-3 transition-transform group-hover:rotate-0">
                {uploading ? (
                  <div className="animate-pulse text-sunstone font-bold text-xs uppercase tracking-widest">Uploading...</div>
                ) : photo ? (
                  <img src={photo} className="w-full h-full object-cover -rotate-3 group-hover:rotate-0 transition-transform" referrerPolicy="no-referrer" />
                ) : (
                  <Camera className="text-grey-mist -rotate-3" size={48} />
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-4 bg-sunstone text-white rounded-2xl shadow-xl shadow-sunstone/30 hover:scale-110 transition-transform"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-bold mb-3 text-alabaster">Select your interests</h2>
            <p className="text-grey-mist mb-8">Pick at least 3 categories you enjoy</p>
            <div className="grid grid-cols-2 gap-3">
              {INTEREST_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (interests.includes(cat.id)) setInterests(interests.filter(i => i !== cat.id));
                    else if (interests.length < 10) setInterests([...interests, cat.id]);
                  }}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-2xl border transition-all text-left group',
                    interests.includes(cat.id) 
                      ? 'bg-sunstone/10 border-sunstone text-sunstone' 
                      : 'bg-lava/50 border-white/5 text-grey-mist hover:border-white/20 hover:bg-lava'
                  )}
                >
                  <span className="text-xl group-hover:scale-125 transition-transform">{cat.icon}</span>
                  <span className="text-sm font-bold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-bold mb-3 text-alabaster">Tell us about yourself</h2>
            <p className="text-grey-mist mb-8">Write a short bio (optional)</p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 300))}
              placeholder="Tell potential companions a bit about yourself..."
              className="w-full h-40 p-5 bg-lava/50 border border-white/10 rounded-[2rem] text-alabaster placeholder:text-grey-mist/30 focus:outline-none focus:ring-2 focus:ring-sunstone/20 focus:border-sunstone resize-none transition-all"
            />
            <p className="text-right text-xs font-mono text-grey-mist mt-3">{bio.length}/300</p>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-bold mb-3 text-alabaster">Where are you?</h2>
            <p className="text-grey-mist mb-8">We'll show you events in your city</p>
            <Input label="Home City" value={city} onChange={(e: any) => setCity(e.target.value)} placeholder="e.g. New York, NY" className="py-4" />
          </div>
        )}

        {step === 5 && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-24 h-24 bg-sunstone/10 text-sunstone rounded-[2rem] mx-auto mb-8 flex items-center justify-center rotate-6">
              <Bell size={48} className="-rotate-6" />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-alabaster">Enable notifications</h2>
            <p className="text-grey-mist mb-10 leading-relaxed">Get notified when your requests are approved or when you get a new message.</p>
            <Button className="w-full py-5 text-lg" onClick={handleNext}>Enable & Finish</Button>
            <button onClick={handleNext} className="mt-6 text-grey-mist font-bold text-sm hover:text-alabaster transition-colors">Skip for now</button>
          </div>
        )}
      </div>

      {step < 5 && (
        <div className="mt-10 flex gap-4">
          <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 1}>Back</Button>
          <Button 
            className="flex-1 py-4 text-lg" 
            onClick={handleNext}
            disabled={(step === 1 && !photo) || (step === 2 && interests.length < 3)}
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};
