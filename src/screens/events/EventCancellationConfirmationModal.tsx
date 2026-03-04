// src/screens/events/EventCancellationConfirmationModal.tsx
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';

export const EventCancellationConfirmationModal = ({ route, navigation }: any) => {
  const { eventId, eventTitle } = route.params;
  const { token } = useAuthStore();
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await fetch(`/api/events/${eventId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      navigation.navigate('MAIN_TABS', { screen: 'ORGANIZER_STACK', params: { screen: 'MY_EVENTS' } });
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="flex-1 bg-obsidian flex flex-col items-center justify-center p-10 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-ember/10 text-ember rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-ember/20"
      >
        <ShieldAlert size={48} />
      </motion.div>

      <h2 className="text-3xl font-bold text-alabaster tracking-tight mb-3">Cancel Event?</h2>
      <p className="text-grey-mist mb-12 leading-relaxed">
        Are you sure you want to cancel <span className="text-alabaster font-bold">"{eventTitle}"</span>? 
        All approved companions and pending applicants will be notified. This action cannot be undone.
      </p>

      <div className="w-full space-y-4">
        <Button className="w-full py-5 text-lg bg-ember hover:bg-ember/80" onClick={handleCancel} disabled={cancelling}>
          {cancelling ? 'Cancelling...' : 'Yes, Cancel Event'}
        </Button>
        <button 
          onClick={() => navigation.goBack()}
          className="w-full py-2 text-grey-mist text-xs font-bold uppercase tracking-widest hover:text-alabaster transition-colors"
        >
          No, Keep Event
        </button>
      </div>
    </div>
  );
};
