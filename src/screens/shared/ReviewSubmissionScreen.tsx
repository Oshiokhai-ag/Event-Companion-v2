// src/screens/shared/ReviewSubmissionScreen.tsx
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { cn } from '../../types';

export const ReviewSubmissionScreen = ({ route, navigation }: any) => {
  const { eventId, revieweeId, revieweeName, revieweePhoto, eventTitle } = route.params;
  const { token } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) return;
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        reviewee_id: revieweeId,
        event_id: eventId,
        rating,
        review_text: text
      })
    });
    if (res.ok) {
      navigation.replace('REVIEW_SUBMITTED');
    }
  };

  return (
    <div className="flex-1 bg-obsidian p-10 overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-sunstone blur-2xl opacity-20 rounded-full" />
          <img 
            src={revieweePhoto} 
            className="w-32 h-32 rounded-[2.5rem] object-cover relative z-10 border-4 border-lava shadow-2xl rotate-3" 
            referrerPolicy="no-referrer" 
          />
        </div>
        
        <h2 className="text-3xl font-bold text-alabaster tracking-tight mb-3">How was your experience?</h2>
        <p className="text-grey-mist mb-10 leading-relaxed">Tell us about your time with <span className="text-sunstone font-bold">{revieweeName}</span> at <span className="text-alabaster font-bold">{eventTitle}</span></p>
        
        <div className="flex flex-row gap-3 mb-12">
          {[1, 2, 3, 4, 5].map(s => (
            <button key={s} onClick={() => setRating(s)} className="p-1 active:scale-90 transition-transform outline-none">
              <Star size={48} className={cn('transition-colors', s <= rating ? 'fill-solar text-solar' : 'text-white/10')} />
            </button>
          ))}
        </div>

        <div className="w-full relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 300))}
            placeholder="Write a short review (optional)..."
            className="w-full h-40 p-6 bg-lava/50 border border-white/10 rounded-[2rem] text-alabaster placeholder:text-grey-mist/30 focus:outline-none focus:ring-2 focus:ring-sunstone/20 focus:border-sunstone resize-none transition-all"
          />
          <p className="absolute bottom-4 right-6 text-[10px] font-bold text-grey-mist uppercase tracking-widest">{text.length}/300</p>
        </div>
      </div>

      <div className="mt-10 space-y-4 pb-20">
        <Button className="w-full py-5 text-xl shimmer" onClick={handleSubmit} disabled={rating === 0}>Submit Review</Button>
        <button onClick={() => navigation.goBack()} className="w-full py-2 text-grey-mist text-xs font-bold uppercase tracking-widest hover:text-alabaster transition-colors outline-none">Skip for now</button>
      </div>
    </div>
  );
};
