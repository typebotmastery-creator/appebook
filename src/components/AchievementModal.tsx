import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award } from 'lucide-react';
import { Button } from './ui/Button';

interface AchievementModalProps {
  chapterTitle: string;
  medalIcon: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({ chapterTitle, medalIcon, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative bg-gradient-to-br from-purple-800 to-pink-700 rounded-2xl shadow-xl w-full max-w-md text-white p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
              <X />
            </button>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
              className="text-7xl mx-auto mb-4"
            >
              {medalIcon}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-2">Conquista Desbloqueada!</h2>
              <p className="text-purple-200 mb-4">Você concluiu o capítulo:</p>
              <p className="text-xl font-semibold bg-white/10 rounded-lg py-2 px-4 inline-block mb-6">{chapterTitle}</p>
              
              <Button onClick={onClose} className="w-full">
                Continuar Jornada
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
