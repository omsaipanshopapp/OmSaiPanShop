import React from 'react';
import { Order, OrderStatus } from '../types';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

// FIX: Explicitly type component with React.FC to allow for React-specific props like `key`.
const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusChange }) => {
  const nextStatus = {
    [OrderStatus.PENDING]: OrderStatus.READY,
    [OrderStatus.READY]: OrderStatus.COMPLETED,
  };

  const nextActionText = {
    [OrderStatus.PENDING]: 'Mark as Ready',
    [OrderStatus.READY]: 'Mark as Completed',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
      <div>
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">#{order.id}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(order.date).toLocaleString('en-IN', { 
              timeZone: 'Asia/Kolkata',
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </p>
        </div>

        <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{order.customerName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{order.customerEmail}</p>
        </div>


        <ul className="my-3 space-y-2">
          {order.items.map(item => (
            <li key={item.product.id} className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">{item.product.name} <span className="text-gray-500">x {item.quantity}</span></span>
              <span className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-3 pt-3 flex justify-between items-center font-bold">
          <span>Total</span>
          <span>₹{order.total.toFixed(2)}</span>
        </div>
      </div>

      {order.status !== OrderStatus.COMPLETED && (
        <button
          onClick={() => onStatusChange(order.id, nextStatus[order.status as keyof typeof nextStatus])}
          className="w-full mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
        >
          {nextActionText[order.status as keyof typeof nextActionText]}
        </button>
      )}
    </div>
  );
}

export default OrderCard;