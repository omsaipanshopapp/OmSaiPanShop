import React, { useState, useMemo, useEffect } from 'react';
import { Order, OrderStatus, Product, User } from '../types';
import OrderCard from '../components/OrderCard';
import ProductForm from '../components/ProductForm';
import Modal from '../components/Modal';
import { ClipboardListIcon, TagIcon, PlusIcon, PencilIcon, TrashIcon, LogoutIcon, UserCircleIcon, CheckCircleIcon, XCircleIcon, StoreIcon, CalendarIcon } from '../components/icons/Icons';

interface OwnerViewProps {
  user: User;
  onSignOut: () => void;
  orders: Order[];
  products: Product[];
  storeStatus: boolean;
  onToggleStoreStatus: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
}

type ActiveView = 'orders' | 'products';

const OrderDashboard = ({ orders, updateOrderStatus }: Pick<OwnerViewProps, 'orders' | 'updateOrderStatus'>) => {
  const [activeTab, setActiveTab] = useState<OrderStatus>(OrderStatus.PENDING);
  
  // Get today's date in IST timezone as YYYY-MM-DD format (for date input)
  const getTodayIST = (): string => {
    const now = new Date();
    const istDateStr = now.toLocaleString('en-CA', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return istDateStr; // Returns YYYY-MM-DD format
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayIST());

  // Reset date to today when component mounts or when switching to orders view
  React.useEffect(() => {
    setSelectedDate(getTodayIST());
  }, []); // Only on mount - date persists when switching tabs

  // Helper function to get date string in IST from order date
  const getOrderDateIST = (orderDateISO: string): string => {
    const orderDate = new Date(orderDateISO);
    return orderDate.toLocaleString('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDateIST = getOrderDateIST(order.date);
      return order.status === activeTab && orderDateIST === selectedDate;
    });
  }, [orders, activeTab, selectedDate]);

  const tabs = [OrderStatus.PENDING, OrderStatus.READY, OrderStatus.COMPLETED];

  // Format date for display (DD-MM-YYYY)
  const formatDateForDisplay = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  return (
    <div>
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        {/* Date Picker */}
        <div className="py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-3">
            <CalendarIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <label htmlFor="order-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Date:
            </label>
            <input
              type="date"
              id="order-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        {/* Status Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex" aria-label="Tabs">
            {tabs.map(tab => {
              // Count orders for this tab and selected date
              const tabCount = orders.filter(o => {
                const orderDateIST = getOrderDateIST(o.date);
                return o.status === tab && orderDateIST === selectedDate;
              }).length;
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                  } flex-1 text-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors`}
                >
                  {tab} ({tabCount})
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="pt-6">
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} onStatusChange={updateOrderStatus} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p>No {activeTab.toLowerCase()} orders.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductManagement = ({ products, addProduct, updateProduct, deleteProduct }: Pick<OwnerViewProps, 'products' | 'addProduct' | 'updateProduct' | 'deleteProduct'>) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = (productData: Omit<Product, 'id'> | Product) => {
    if ('id' in productData) {
      updateProduct(productData);
    } else {
      addProduct(productData);
    }
    handleCloseModal();
  };
  
  return (
    <div>
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Products</h2>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search for product"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={() => handleOpenModal()}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <PlusIcon className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mt-6">
        <div className="overflow-x-auto">
          {filteredProducts.length > 0 ? (
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-3 py-3">Product Name</th>
                  <th scope="col" className="px-3 py-3">Price</th>
                  <th scope="col" className="px-3 py-3 text-center">Status</th>
                  <th scope="col" className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <th scope="row" className="px-3 py-4 font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </th>
                    <td className="px-3 py-4">₹{product.price.toFixed(2)}</td>
                    <td className="px-3 py-4 text-center">
                      {/* FIX: The `title` prop is not valid for SVG elements in React's types. Moved it to a wrapping `span` to provide a tooltip. */}
                      {product.isAvailable ? (
                        <span title="Available">
                          <CheckCircleIcon className="w-6 h-6 text-green-500 inline-block" />
                        </span>
                      ) : (
                        <span title="Unavailable">
                          <XCircleIcon className="w-6 h-6 text-red-500 inline-block" />
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-right flex justify-end gap-1">
                      <button onClick={() => handleOpenModal(product)} className="text-blue-600 hover:text-blue-800 p-1"><PencilIcon className="w-5 h-5"/></button>
                      <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:text-red-800 p-1"><TrashIcon className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <p>No product found.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <Modal title={editingProduct ? 'Edit Product' : 'Add New Product'} onClose={handleCloseModal}>
          <ProductForm
            product={editingProduct}
            onSave={handleSaveProduct}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
};

export default function OwnerView(props: OwnerViewProps) {
  const [activeView, setActiveView] = useState<ActiveView>('orders');

  // Get today's date in IST timezone as YYYY-MM-DD format
  const getTodayIST = (): string => {
    const now = new Date();
    return now.toLocaleString('en-CA', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Reset to orders view and reset date when switching tabs
  const handleViewChange = (view: ActiveView) => {
    setActiveView(view);
    // When switching to orders view, date will be reset via OrderDashboard component's effect
  };
  
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
        <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Owner Dashboard</h1>
            <div className="flex items-center gap-4">
              {/* Store Status Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                <StoreIcon className={`w-5 h-5 ${props.storeStatus ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium hidden sm:inline ${props.storeStatus ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {props.storeStatus ? 'Open' : 'Closed'}
                </span>
                <button
                  onClick={props.onToggleStoreStatus}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                    props.storeStatus ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  title={`Store is ${props.storeStatus ? 'open' : 'closed'}. Click to ${props.storeStatus ? 'close' : 'open'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      props.storeStatus ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{props.user.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Owner</p>
              </div>
              <button
                onClick={props.onSignOut}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex-shrink-0"
                title="Sign Out"
              >
                <LogoutIcon className="w-6 h-6"/>
              </button>
            </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col overflow-y-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <nav className="flex" aria-label="Tabs">
            <button
              onClick={() => handleViewChange('orders')}
              className={`flex items-center justify-center gap-2 flex-1 py-4 px-1 border-b-2 font-medium text-base transition-colors ${
                activeView === 'orders'
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <ClipboardListIcon className="w-5 h-5"/>
              <span>Orders</span>
            </button>
            <button
              onClick={() => handleViewChange('products')}
              className={`flex items-center justify-center gap-2 flex-1 py-4 px-1 border-b-2 font-medium text-base transition-colors ${
                activeView === 'products'
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <TagIcon className="w-5 h-5"/>
              <span>Products</span>
            </button>
          </nav>
        </div>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
          {activeView === 'orders' ? (
            <OrderDashboard 
              key="orders-dashboard" 
              orders={props.orders} 
              updateOrderStatus={props.updateOrderStatus} 
            />
          ) : (
            <ProductManagement {...props} />
          )}
        </main>
      </div>
    </div>
  );
}