import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { MonthlyGift } from '../types';
import { GiftDetailModal } from './GiftDetailModal';
import { Lock, Gift, ArrowLeft } from 'lucide-react';

interface MonthlyGiftsProps {
  onBack: () => void;
}

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const MonthlyGifts: React.FC<MonthlyGiftsProps> = ({ onBack }) => {
  const [gifts, setGifts] = useState<MonthlyGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGift, setSelectedGift] = useState<MonthlyGift | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentMonth = new Date().getMonth() + 1; // 1-12

  useEffect(() => {
    const fetchGifts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('monthly_gifts')
        .select('*')
        .order('month', { ascending: true });

      if (error) {
        console.error("Erro ao buscar presentes mensais:", error);
      } else {
        setGifts(data);
      }
      setLoading(false);
    };

    fetchGifts();
  }, []);

  const handleGiftClick = (gift: MonthlyGift) => {
    if (gift.month <= currentMonth) {
      setSelectedGift(gift);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGift(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-600 text-lg">Carregando seus presentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button onClick={onBack} className="flex items-center text-purple-600 hover:text-purple-800 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </button>
          </div>
          <h1 className="text-xl font-bold text-gray-800">12 Presentes Mensais</h1>
          <div className="w-24"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Gift className="w-16 h-16 mx-auto text-pink-500 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">Uma Surpresa a Cada Mês</h2>
          <p className="text-lg text-gray-600 mt-2">
            A cada mês do ano, um novo ebook é desbloqueado para aprofundar sua jornada.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {gifts.map((gift, index) => {
            const isUnlocked = gift.month <= currentMonth;
            return (
              <motion.div
                key={gift.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleGiftClick(gift)}
                className={`group rounded-2xl overflow-hidden shadow-lg transition-all duration-300 bg-white ${
                  isUnlocked ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-1' : 'cursor-not-allowed'
                }`}
              >
                <div className="relative">
                  <img
                    src={gift.cover_image_url}
                    alt={`Capa de ${gift.title}`}
                    className={`w-full h-56 object-cover transition-transform duration-300 ${isUnlocked ? 'group-hover:scale-105' : 'filter grayscale'}`}
                  />
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-4 text-center">
                      <Lock className="w-8 h-8 mb-2" />
                      <span className="font-semibold">Bloqueado</span>
                      <span className="text-sm">Disponível em {meses[gift.month - 1]}</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-purple-800 font-bold text-sm px-3 py-1 rounded-full">
                    {meses[gift.month - 1]}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className={`font-bold text-gray-800 ${!isUnlocked && 'opacity-50'}`}>{gift.title}</h3>
                  <p className={`text-sm text-gray-600 mt-1 h-10 overflow-hidden ${!isUnlocked && 'opacity-50'}`}>{gift.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <GiftDetailModal gift={selectedGift} isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};
