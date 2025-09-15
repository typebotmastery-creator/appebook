import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Book, Download } from 'lucide-react';
import { Button } from './ui/Button';
import { MonthlyGift } from '../types';

interface GiftDetailModalProps {
  gift: MonthlyGift | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GiftDetailModal: React.FC<GiftDetailModalProps> = ({ gift, isOpen, onClose }) => {
  if (!gift) return null;

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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold text-gray-800">{gift.title}</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                <X />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              <div className="flex flex-col md:flex-row gap-6">
                <img src={gift.cover_image_url} alt={`Capa de ${gift.title}`} className="w-full md:w-1/3 h-auto object-cover rounded-lg shadow-md" />
                <div className="flex-grow">
                  <h3 className="font-semibold text-purple-700 mb-2">Descrição</h3>
                  <p className="text-gray-600 mb-6">{gift.description}</p>
                  
                  <div className="space-y-3">
                    <Button className="w-full" onClick={() => alert('Funcionalidade "Ler no App" em desenvolvimento.')}>
                      <Book className="w-4 h-4 mr-2" />
                      Ler no App
                    </Button>
                    <a href={gift.pdf_url} target="_blank" rel="noopener noreferrer" className="block">
                       <Button variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Baixar PDF
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                 <h3 className="font-semibold text-purple-700 mb-4">Conteúdo do Ebook</h3>
                 {/* O conteúdo é renderizado a partir do banco de dados, que é uma fonte confiável. */}
                 <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: gift.content }} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
