import React, { useEffect } from 'react';
import useStore from './store';
import CustomerView from './views/CustomerView';
import OwnerView from './views/OwnerView';
import AuthView from './views/AuthView';
import Toast from './components/Toast';
import { UserRole } from './types';

export default function App() {
  const {
    currentUser,
    toast,
    isLoading,
    fetchData,
    handleSignIn,
    handleSignUp,
    handleSignOut,
    products,
    cart,
    orders,
    storeStatus,
    addToCart,
    updateCartQuantity,
    placeOrder,
    updateOrderStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleStoreStatus,
    setToast
  } = useStore();

  useEffect(() => {
    const unsubscribe = fetchData();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []); // Empty dependency array - fetchData should only run once on mount

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <AuthView onSignIn={handleSignIn} onSignUp={handleSignUp} />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200">
      {currentUser.role === UserRole.CUSTOMER ? (
        <CustomerView
          user={currentUser}
          onSignOut={handleSignOut}
          products={products}
          cart={cart}
          orders={orders.filter(o => o.customerEmail === currentUser.email)}
          storeStatus={storeStatus}
          addToCart={addToCart}
          updateCartQuantity={updateCartQuantity}
          placeOrder={placeOrder}
        />
      ) : (
        <OwnerView
          user={currentUser}
          onSignOut={handleSignOut}
          orders={orders}
          products={products}
          storeStatus={storeStatus}
          onToggleStoreStatus={toggleStoreStatus}
          updateOrderStatus={updateOrderStatus}
          addProduct={addProduct}
          updateProduct={updateProduct}
          deleteProduct={deleteProduct}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
