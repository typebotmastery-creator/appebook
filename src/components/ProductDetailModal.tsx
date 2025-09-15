import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart } from 'lucide-react';
import { Button } from './ui/Button';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose }) => {
  if (!product) return null;

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

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
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex justify-between items-start border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
                <p className="text-sm text-purple-600 font-medium capitalize">{product.category}</p>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                <X />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full h-80 overflow-hidden rounded-lg">
                    <img src={product.image_url} alt={`Imagem de ${product.name}`} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
                  <p className="text-gray-600 mb-6 flex-grow">{product.description}</p>
                  
                  <div className="mt-auto space-y-4">
                    <div className="text-3xl font-bold text-purple-700">
                      {formatPrice(product.price)}
                    </div>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => alert('Integração com gateway de pagamento em desenvolvimento.')}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Comprar Agora
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
