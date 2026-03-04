// src/screens/shared/ReviewSubmittedScreen.tsx
import React from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { Button } from '../../components/Button';

export const ReviewSubmittedScreen = ({ navigation }: any) => {
  return (
    <div className="flex-1 bg-obsidian flex flex-col items-center justify-center p-10 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="w-24 h-24 bg-sunstone/10 text-sunstone rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-sunstone/20"
      >
        <Star size={48} className="fill-sunstone" />
      </motion.div>

      <h2 className="text-3xl font-bold text-alabaster tracking-tight mb-3">Review Submitted!</h2>
      <p className="text-grey-mist mb-12 leading-relaxed">
        Thank you for sharing your experience. Reviews help keep the Companion community safe and reliable.
      </p>

      <div className="w-full">
        <Button className="w-full py-5 text-lg" onClick={() => navigation.navigate('MAIN_TABS', { screen: 'FEED_STACK' })}>
          Back to Feed
        </Button>
      </div>
    </div>
  );
};
