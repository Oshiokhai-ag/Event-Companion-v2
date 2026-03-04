// src/screens/shared/ReportUserModal.tsx
import React, { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { cn } from '../../types';

export const ReportUserModal = ({ route, navigation }: any) => {
  const { userId, userName } = route.params;
  const { token } = useAuthStore();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reasons = [
    'Inappropriate behavior',
    'Harassment',
    'Spam or fake account',
    'Safety concern',
    'Other'
  ];

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      await fetch(`/api/users/${userId}/report`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason, details })
      });
      alert('Report submitted. We will investigate this user.');
      navigation.goBack();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-obsidian p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-alabaster tracking-tight">Report User</h1>
        <button onClick={() => navigation.goBack()} className="p-2 bg-lava/40 rounded-xl border border-white/5 outline-none hover:bg-lava/60 transition-colors">
          <X size={24} className="text-grey-mist" />
        </button>
      </div>

      <div className="flex flex-row items-center gap-4 p-6 bg-ember/10 rounded-[2rem] border border-ember/20 mb-10">
        <ShieldAlert size={32} className="text-ember" />
        <div className="flex-1">
          <p className="font-bold text-alabaster">Report {userName}</p>
          <p className="text-xs text-grey-mist mt-1">Your report is anonymous and helps keep the community safe.</p>
        </div>
      </div>

      <div className="space-y-8 pb-20">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-sunstone mb-4">Reason for reporting</h3>
          <div className="space-y-3">
            {reasons.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={cn(
                  'w-full text-left p-5 rounded-[1.5rem] border transition-all outline-none',
                  reason === r ? 'bg-sunstone/10 border-sunstone text-sunstone' : 'bg-lava/30 border-white/5 text-grey-mist'
                )}
              >
                <span className={cn('font-bold', reason === r ? 'text-sunstone' : 'text-grey-mist')}>{r}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-sunstone mb-4">Additional Details</h3>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value.slice(0, 500))}
            placeholder="Please provide more information..."
            className="w-full h-40 p-6 bg-lava/50 border border-white/10 rounded-[2rem] text-alabaster placeholder:text-grey-mist/30 focus:outline-none focus:ring-2 focus:ring-sunstone/20 focus:border-sunstone resize-none transition-all"
          />
        </div>

        <Button className="w-full py-5 text-xl bg-ember hover:bg-ember/80" onClick={handleSubmit} disabled={!reason || submitting}>
          {submitting ? 'Submitting...' : 'Submit Report'}
        </Button>
      </div>
    </div>
  );
};
