import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { Button } from './ui/Button';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden group flex flex-col h-full"
    >
      <div className="relative overflow-hidden">
        <img
          src={product.image_url}
          alt={`Imagem de ${product.name}`}
          className="w-full h-56 object-cover transform transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-purple-800 font-semibold text-xs px-2 py-1 rounded-full capitalize">
          {product.category}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-gray-800 mb-1 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-4 flex-grow">{product.description.substring(0, 60)}...</p>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold text-purple-600">{formatPrice(product.price)}</span>
          </div>
          <Button onClick={onClick} variant="outline" className="w-full">
            Ver Detalhes
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
