// src/screens/events/EditEventModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Camera } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { cn, INTEREST_CATEGORIES, type Event } from '../../types';

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

export const EditEventModal = ({ route, navigation }: any) => {
  const { eventId } = route.params;
  const { token } = useAuthStore();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [maxCompanions, setMaxCompanions] = useState(1);
  const [photo, setPhoto] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    const res = await fetch(`/api/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setTitle(data.title);
    setType(data.event_type);
    setDateTime(data.date_time.slice(0, 16)); // Format for datetime-local
    setArea(data.general_area);
    setDescription(data.description);
    setMaxCompanions(data.max_companions);
    setPhoto(data.cover_photos[0]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, token!);
      setPhoto(url);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          event_type: type,
          cover_photos: [photo],
          date_time: dateTime,
          general_area: area,
          description,
          max_companions: maxCompanions
        })
      });
      if (res.ok) {
        navigation.goBack();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-obsidian flex flex-col h-full">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-obsidian/50 backdrop-blur-xl">
        <button onClick={() => navigation.goBack()} className="p-2 text-grey-mist hover:text-alabaster transition-colors"><X size={24} /></button>
        <h2 className="text-xl font-bold text-alabaster tracking-tight">Edit Event</h2>
        <div className="w-10" />
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="relative h-56 rounded-[2.5rem] overflow-hidden bg-lava border border-white/5 shadow-2xl rotate-1">
          {uploading ? (
             <div className="w-full h-full flex items-center justify-center animate-pulse text-sunstone font-bold uppercase tracking-widest">Uploading...</div>
          ) : photo ? (
            <img src={photo} className="w-full h-full object-cover -rotate-1" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-grey-mist"><Camera size={48} /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-6 right-6 p-4 bg-sunstone text-white rounded-2xl shadow-xl shadow-sunstone/30 hover:scale-110 transition-transform"
          >
            <Camera size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <Input label="Event Title" value={title} onChange={(e: any) => setTitle(e.target.value)} required placeholder="e.g. Hiking at Bear Mountain" />
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-grey-mist">Event Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3.5 bg-lava/50 border border-white/10 rounded-2xl text-alabaster focus:outline-none focus:ring-2 focus:ring-sunstone/20 focus:border-sunstone appearance-none"
              required
            >
              <option value="" className="bg-lava">Select a type</option>
              {INTEREST_CATEGORIES.map(c => <option key={c.id} value={c.id} className="bg-lava">{c.icon} {c.label}</option>)}
            </select>
          </div>

          <Input label="Date & Time" type="datetime-local" value={dateTime} onChange={(e: any) => setDateTime(e.target.value)} required />
          
          <Input label="General Area" value={area} onChange={(e: any) => setArea(e.target.value)} required placeholder="e.g. Brooklyn, NY" />

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-grey-mist">Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-40 px-4 py-3.5 bg-lava/50 border border-white/10 rounded-[2rem] text-alabaster placeholder:text-grey-mist/30 focus:outline-none focus:ring-2 focus:ring-sunstone/20 focus:border-sunstone resize-none transition-all"
              placeholder="What should companions know?"
            />
          </div>

          <div className="flex items-center justify-between p-6 bg-lava/50 rounded-[2rem] border border-white/5">
            <div>
              <p className="font-bold text-alabaster">Max Companions</p>
              <p className="text-xs text-grey-mist">How many people can join?</p>
            </div>
            <div className="flex-row items-center gap-6">
              <button type="button" onClick={() => setMaxCompanions(Math.max(1, maxCompanions - 1))} className="w-10 h-10 rounded-2xl bg-lava border border-white/10 flex items-center justify-center text-alabaster hover:bg-lava-light transition-colors">-</button>
              <span className="font-bold text-xl text-sunstone w-6 text-center">{maxCompanions}</span>
              <button type="button" onClick={() => setMaxCompanions(Math.min(20, maxCompanions + 1))} className="w-10 h-10 rounded-2xl bg-lava border border-white/10 flex items-center justify-center text-alabaster hover:bg-lava-light transition-colors">+</button>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full py-5 text-xl shimmer mt-10" disabled={saving || uploading}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
};
