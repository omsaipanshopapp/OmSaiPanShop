
import React from 'react';
import { CartItem } from '../types';
import { MinusIcon, PlusIcon, TrashIcon, XIcon } from './icons/Icons';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  storeStatus: boolean;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onPlaceOrder: () => void;
}

export default function Cart({ isOpen, onClose, cartItems, storeStatus, onUpdateQuantity, onPlaceOrder }: CartProps) {
  const totalCost = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Your Cart</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {cartItems.length > 0 ? (
            <div className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-4">
                {cartItems.map(item => (
                  <li key={item.product.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">₹{item.product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)} className="p-1 rounded-full border border-gray-300 dark:border-gray-600"><MinusIcon className="w-4 h-4" /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)} className="p-1 rounded-full border border-gray-300 dark:border-gray-600"><PlusIcon className="w-4 h-4" /></button>
                    </div>
                     <button onClick={() => onUpdateQuantity(item.product.id, 0)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="w-5 h-5" /></button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <p>Your cart is empty.</p>
              <p className="text-sm">Add product to get started!</p>
            </div>
          )}

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {!storeStatus && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                  Store is currently closed. Orders cannot be placed.
                </p>
              </div>
            )}
            <div className="flex justify-between items-center font-bold text-lg mb-4">
              <span>Total:</span>
              <span>₹{totalCost.toFixed(2)}</span>
            </div>
            <button
              onClick={onPlaceOrder}
              disabled={cartItems.length === 0 || !storeStatus}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {!storeStatus ? 'Store Closed' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}