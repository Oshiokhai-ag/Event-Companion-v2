// src/screens/profile/EditProfileScreen.tsx
import React, { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
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

export const EditProfileScreen = ({ navigation }: any) => {
  const { user, token, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [city, setCity] = useState(user?.location_city || '');
  const [interests, setInterests] = useState<string[]>(typeof user?.interests === 'string' ? JSON.parse(user?.interests || '[]') : (user?.interests || []));
  const [photo, setPhoto] = useState(user?.profile_photo_url || '');
  const [radius, setRadius] = useState(user?.discovery_radius || 50);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          bio,
          interests,
          profile_photo_url: photo,
          location_city: city,
          discovery_radius: radius,
          phone_verified: user.phone_verified
        })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        navigation.goBack();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-obsidian p-6 overflow-y-auto">
      <div className="flex flex-col items-center mb-10">
        <div className="relative w-32 h-32 group">
          <div className="w-full h-full rounded-[2rem] overflow-hidden border-4 border-lava shadow-2xl">
            {uploading ? (
              <div className="w-full h-full flex items-center justify-center animate-pulse text-sunstone font-bold text-[10px] uppercase tracking-widest">Uploading...</div>
            ) : (
              <img src={photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 p-3 bg-sunstone text-white rounded-2xl shadow-xl shadow-sunstone/30 outline-none"
          >
            <Camera size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-6 pb-20">
        <Input label="Full Name" value={name} onChange={(e: any) => setName(e.target.value)} />
        <Input label="Home City" value={city} onChange={(e: any) => setCity(e.target.value)} />
        
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-grey-mist">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 300))}
            className="w-full h-32 p-4 bg-lava/50 border border-white/10 rounded-2xl text-alabaster focus:outline-none focus:ring-2 focus:ring-sunstone/20 focus:border-sunstone resize-none transition-all"
          />
          <p className="text-right text-[10px] font-mono text-grey-mist">{bio.length}/300</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-xs font-bold uppercase tracking-wider text-grey-mist">Discovery Radius</label>
            <span className="text-sunstone font-bold">{radius} km</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="200" 
            value={radius} 
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full h-1.5 bg-lava rounded-lg appearance-none cursor-pointer accent-sunstone"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-grey-mist">Interests</label>
          <div className="grid grid-cols-2 gap-2">
            {INTEREST_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  if (interests.includes(cat.id)) setInterests(interests.filter(i => i !== cat.id));
                  else if (interests.length < 10) setInterests([...interests, cat.id]);
                }}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-xl border transition-all text-left outline-none',
                  interests.includes(cat.id) 
                    ? 'bg-sunstone/10 border-sunstone text-sunstone' 
                    : 'bg-lava/30 border-white/5 text-grey-mist'
                )}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="text-xs font-bold">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full py-5 text-xl shimmer mt-10" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
