
import React, { useState, useMemo } from 'react';
import { Product, CartItem, Order, OrderStatus, User } from '../types';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import { HomeIcon, ShoppingBagIcon, ClipboardListIcon, ShoppingCartIcon, LogoutIcon, StoreIcon } from '../components/icons/Icons';

interface CustomerViewProps {
  user: User;
  onSignOut: () => void;
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  storeStatus: boolean;
  addToCart: (product: Product) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  placeOrder: () => void;
}

type ActiveTab = 'home' | 'orders';

const getStatusPillClass = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case OrderStatus.READY:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case OrderStatus.COMPLETED:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const OrderHistory = ({ orders }: { orders: Order[] }) => (
  <div className="space-y-4 pt-4">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Orders</h2>
    {orders.length > 0 ? (
      orders.map(order => (
        <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">#{order.id}</h3>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusPillClass(order.status)}`}>
              {order.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {new Date(order.date).toLocaleString('en-IN', { 
              timeZone: 'Asia/Kolkata',
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </p>
          <ul className="space-y-1 text-sm">
            {order.items.map(item => (
              <li key={item.product.id} className="flex justify-between">
                <span>{item.product.name} x {item.quantity}</span>
                <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-3 pt-2 text-right font-bold">
            Total: ₹{order.total.toFixed(2)}
          </div>
        </div>
      ))
    ) : (
      <p className="text-center py-8 text-gray-500 dark:text-gray-400">You have no past orders.</p>
    )}
  </div>
);

const ProductCatalog = ({ products, addToCart }: { products: Product[], addToCart: (product: Product) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  return (
    <div>
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 py-4">
         <input
            type="text"
            placeholder="Search for product"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
        ))}
      </div>
    </div>
  );
};

export default function CustomerView({ user, onSignOut, products, cart, orders, storeStatus, addToCart, updateCartQuantity, placeOrder }: CustomerViewProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartTotalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const handlePlaceOrder = () => {
    if (cart.length > 0) {
      placeOrder();
      setIsCartOpen(false);
      setActiveTab('orders');
    } else {
      placeOrder(); // This will trigger the empty cart toast
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Om Sai Pan Shop</h1>
              <div className="flex items-center gap-1.5 text-xs">
                <StoreIcon className={`w-4 h-4 ${storeStatus ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                <span className={`font-medium ${storeStatus ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {storeStatus ? 'Open' : 'Closed'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">{user.email}</span>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              aria-label={`Open cart with ${cartTotalItems} items`}
              title="Open Cart"
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {cartTotalItems > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-[1rem] flex items-center justify-center px-1 text-[10px] font-bold text-red-100 bg-red-600 rounded-full">
                  {cartTotalItems}
                </span>
              )}
            </button>
             <button
              onClick={onSignOut}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              title="Sign Out"
            >
              <LogoutIcon className="w-6 h-6"/>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 pb-4 lg:px-6 lg:pb-6 overflow-y-auto">
        {activeTab === 'home' && <ProductCatalog products={products} addToCart={addToCart} />}
        {activeTab === 'orders' && <OrderHistory orders={orders} />}
      </main>

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cart} 
        storeStatus={storeStatus}
        onUpdateQuantity={updateCartQuantity}
        onPlaceOrder={handlePlaceOrder}
      />

      <footer className="sticky bottom-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
        <nav className="container mx-auto flex justify-around p-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors w-24 ${activeTab === 'home' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors w-24 ${activeTab === 'orders' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
          >
            <ClipboardListIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Orders</span>
          </button>
        </nav>
      </footer>
    </div>
  );
}
