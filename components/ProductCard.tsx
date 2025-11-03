import React from 'react';
import { Product } from '../types';
import { PlusIcon } from './icons/Icons';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

// FIX: Explicitly type component with React.FC to allow for React-specific props like `key`.
const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl flex flex-col ${!product.isAvailable ? 'opacity-50' : ''}`}>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-grow">{product.name}</h3>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">₹{product.price.toFixed(2)}</span>
          <button
            onClick={() => onAddToCart(product)}
            disabled={!product.isAvailable}
            className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;