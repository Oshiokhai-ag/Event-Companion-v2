// src/screens/events/EventCreatedConfirmationScreen.tsx
import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Share2, Calendar } from 'lucide-react';
import { Button } from '../../components/Button';

export const EventCreatedConfirmationScreen = ({ route, navigation }: any) => {
  const { eventId, eventTitle } = route.params;

  return (
    <div className="flex-1 bg-obsidian flex flex-col items-center justify-center p-10 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="w-24 h-24 bg-verdant/10 text-verdant rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-verdant/20"
      >
        <CheckCircle2 size={48} />
      </motion.div>

      <h2 className="text-3xl font-bold text-alabaster tracking-tight mb-3">Event Published!</h2>
      <p className="text-grey-mist mb-12 leading-relaxed">
        Your event <span className="text-sunstone font-bold">"{eventTitle}"</span> is now live. 
        We'll notify you when someone requests to join.
      </p>

      <div className="w-full space-y-4">
        <Button className="w-full py-5 text-lg" onClick={() => navigation.navigate('MAIN_TABS', { screen: 'ORGANIZER_STACK', params: { screen: 'EVENT_MANAGEMENT', params: { eventId } } })}>
          <Calendar size={20} />
          Manage Event
        </Button>
        <Button variant="outline" className="w-full py-5 text-lg" onClick={() => {}}>
          <Share2 size={20} />
          Share Event
        </Button>
        <button 
          onClick={() => navigation.navigate('MAIN_TABS', { screen: 'FEED_STACK' })}
          className="w-full py-2 text-grey-mist text-xs font-bold uppercase tracking-widest hover:text-alabaster transition-colors"
        >
          Back to Feed
        </button>
      </div>
    </div>
  );
};
