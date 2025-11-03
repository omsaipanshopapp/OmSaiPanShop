import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserRole, Product, Order, OrderStatus, CartItem, ToastMessage, User } from './types';
import { db, auth } from './firebaseConfig';
import { collection, doc, setDoc, deleteDoc, query, orderBy, onSnapshot, getDoc, runTransaction } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';

interface AppState {
  currentUser: User | null;
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  toast: ToastMessage | null;
  isLoading: boolean;
  storeStatus: boolean; // true = open, false = closed
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  handleFirestoreError: (error: any, context: string) => void;
  fetchData: () => () => void;
  handleSignIn: (email: string, password: string) => Promise<boolean>;
  handleSignUp: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  handleSignOut: () => Promise<void>;
  addToCart: (product: Product) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  placeOrder: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  toggleStoreStatus: () => Promise<void>;
  setToast: (toast: ToastMessage | null) => void;
}

const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      products: [],
      orders: [],
      cart: [],
      toast: null,
      isLoading: true,
      storeStatus: true, // Default to open

      showToast: (message: string, type: 'success' | 'error' | 'info') => {
        set({ toast: { id: Date.now(), message, type } });
        setTimeout(() => set({ toast: null }), 3000);
      },

      handleFirestoreError: (error: any, context: string) => {
        console.error(`Error ${context}:`, error);
        let message = `Failed to ${context}.`;
        if (error.code === 'permission-denied') {
          message = "Permission denied. Please check your Firestore security rules.";
        } else if (error.code) {
          message = `Failed to ${context}. Error: ${error.code}`;
        }
        get().showToast(message, "error");
      },

      fetchData: () => {
        try {
          set({ isLoading: true });

          let hasLoadedOnce = false;
          const setLoadingComplete = () => {
            if (!hasLoadedOnce) {
              hasLoadedOnce = true;
              set({ isLoading: false });
            }
          };

          // Timeout fallback to ensure loading completes
          const loadingTimeout = setTimeout(() => {
            if (get().isLoading) {
              console.warn('Loading timeout reached, setting isLoading to false');
              set({ isLoading: false });
            }
          }, 5000); // 5 second timeout (reduced from 10)

          const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
              try {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);
                const profile = userDoc.exists() ? (userDoc.data() as Partial<User>) : {};
                const role = profile.role ?? UserRole.CUSTOMER;
                const name = profile.name ?? firebaseUser.displayName ?? undefined;
                const currentUser: User = { email: firebaseUser.email || '', role, name };
                set({ currentUser });
              } catch (error) {
                get().handleFirestoreError(error, 'load user profile');
              }
            } else {
              set({ currentUser: null });
            }
          });

        const productsUnsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
          const productsList = snapshot.docs.map(doc => doc.data() as Product);
          set({ products: productsList });
          setLoadingComplete();
        }, (error) => {
            get().handleFirestoreError(error, "listen to products collection");
            setLoadingComplete();
        });

        let prevOrdersMap = {};
        const ordersUnsubscribe = onSnapshot(query(collection(db, "orders"), orderBy("date", "desc")), (snapshot) => {
          const ordersList = snapshot.docs.map(doc => doc.data() as Order);
          const { currentUser } = get();
            if (currentUser && prevOrdersMap) {
              // For OWNER: play on received order (new order for anyone)
              if (currentUser.role === UserRole.OWNER) {
                if (Object.keys(prevOrdersMap).length > 0) {
                  // Order IDs newly appearing are newly received orders
                  ordersList.forEach(order => {
                    if (!prevOrdersMap[order.id]) {
                      new Audio('/simple-notification.mp3').play();
                    }
                  });
                }
              }
              // For CUSTOMER: play on status change for their orders
              if (currentUser.role === UserRole.CUSTOMER) {
                ordersList.forEach(order => {
                  if (
                    order.customerEmail === currentUser.email &&
                    prevOrdersMap[order.id] &&
                    prevOrdersMap[order.id] !== order.status
                  ) {
                    new Audio('/simple-notification.mp3').play();
                  }
                });
              }
            }
            // Update previous map for next snapshot
            prevOrdersMap = {};
            ordersList.forEach(order => {
              prevOrdersMap[order.id] = order.status;
            });
          set({ orders: ordersList });
        }, (error) => {
            get().handleFirestoreError(error, "listen to orders collection");
        });

        // Listen to store settings
        const settingsUnsubscribe = onSnapshot(doc(db, "settings", "store"), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            set({ storeStatus: data.isOpen ?? true });
          } else {
            // Initialize settings if they don't exist - but don't wait for it
            setDoc(doc(db, "settings", "store"), { isOpen: true }).catch((err) => {
              console.warn('Failed to initialize store settings:', err);
            });
          }
          setLoadingComplete();
        }, (error) => {
          // Don't show error for permission issues on settings - just use default
          console.warn('Failed to load store settings, using default (open):', error);
          set({ storeStatus: true });
          setLoadingComplete();
        });

          return () => {
            clearTimeout(loadingTimeout);
            if (authUnsubscribe) authUnsubscribe();
            if (productsUnsubscribe) productsUnsubscribe();
            if (ordersUnsubscribe) ordersUnsubscribe();
            if (settingsUnsubscribe) settingsUnsubscribe();
          };
        } catch (error) {
          console.error('Error in fetchData:', error);
          set({ isLoading: false });
          get().handleFirestoreError(error, 'initialize app');
          // Return empty unsubscribe function
          return () => {};
        }
      },

      handleSignIn: async (email, password) => {
        try {
          const credential = await signInWithEmailAndPassword(auth, email, password);
          const { user } = credential;
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const profile = userDoc.exists() ? (userDoc.data() as Partial<User>) : {};
          const role = profile.role ?? UserRole.CUSTOMER;
          const name = profile.name ?? user.displayName ?? undefined;
          set({ currentUser: { email: user.email || '', role, name } });
          get().showToast(`Welcome back, ${name || email}!`, 'success');
          return true;
        } catch (error) {
          get().handleFirestoreError(error, 'sign in');
          return false;
        }
      },

      handleSignUp: async (name, email, password, role) => {
        try {
          const credential = await createUserWithEmailAndPassword(auth, email, password);
          if (name) {
            try { await updateProfile(credential.user, { displayName: name }); } catch {}
          }
          await setDoc(doc(db, 'users', credential.user.uid), { name, email, role });
          set({ currentUser: { email, role, name } });
          get().showToast('Account created successfully!', 'success');
          return true;
        } catch (error) {
          get().handleFirestoreError(error, 'create account');
          return false;
        }
      },

      handleSignOut: async () => {
        try {
          await signOut(auth);
        } finally {
          set({ currentUser: null, cart: [] });
          get().showToast('You have been signed out.', 'success');
        }
      },

      addToCart: (product) => {
        set(state => {
          const existingItem = state.cart.find(item => item.product.id === product.id);
          if (existingItem) {
            return {
              cart: state.cart.map(item =>
                item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              )
            };
          }
          return { cart: [...state.cart, { product, quantity: 1 }] };
        });
      },

      updateCartQuantity: (productId, quantity) => {
        set(state => {
          if (quantity <= 0) {
            return { cart: state.cart.filter(item => item.product.id !== productId) };
          }
          return {
            cart: state.cart.map(item =>
              item.product.id === productId ? { ...item, quantity } : item
            )
          };
        });
      },

      placeOrder: async () => {
        const { cart, currentUser, storeStatus, showToast, handleFirestoreError } = get();
        if (cart.length === 0 || !currentUser) {
          showToast('Your cart is empty or you are not signed in!', 'error');
          return;
        }
        if (!storeStatus) {
          showToast('Store is currently closed. Please try again later.', 'error');
          return;
        }

        try {
          // Generate date-based order ID with daily counter
          const generateOrderId = async (): Promise<string> => {
            // Get current date in IST (Asia/Kolkata) timezone
            const now = new Date();
            const istDateStr = now.toLocaleString('en-GB', { 
              timeZone: 'Asia/Kolkata',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            });
            
            // Parse DD/MM/YYYY format and convert to DDMMYYYY
            const [day, month, year] = istDateStr.split('/');
            const dateStr = `${day}${month}${year}`;
            
            // Use transaction to atomically increment the daily counter
            const counterRef = doc(db, 'settings', 'dailyOrderCounter');
            let orderNumber = 1;
            
            await runTransaction(db, async (transaction) => {
              const counterDoc = await transaction.get(counterRef);
              const today = dateStr;
              
              if (counterDoc.exists()) {
                const data = counterDoc.data();
                // If same day, increment counter; otherwise reset to 1
                if (data.date === today) {
                  orderNumber = (data.counter || 0) + 1;
                } else {
                  orderNumber = 1;
                }
              }
              
              // Update counter for today
              transaction.set(counterRef, {
                date: today,
                counter: orderNumber,
                lastUpdated: new Date().toISOString()
              }, { merge: true });
            });
            
            // Format order number with zero-padding (001, 002, etc.)
            const orderNumStr = String(orderNumber).padStart(3, '0');
            return `ORD-${dateStr}-${orderNumStr}`;
          };

          const orderId = await generateOrderId();
          
          const newOrder: Order = {
            id: orderId,
            customerName: currentUser.name || currentUser.email,
            customerEmail: currentUser.email,
            items: cart,
            total: cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
            status: OrderStatus.PENDING,
            date: new Date().toISOString(),
          };
          
          await setDoc(doc(db, "orders", newOrder.id), newOrder);
          set({ cart: [] });
          showToast('Order placed successfully!', 'success');
        } catch (error) {
          handleFirestoreError(error, "place order");
        }
      },

      updateOrderStatus: async (orderId, status) => {
        const { showToast, handleFirestoreError } = get();
        try {
          const orderRef = doc(db, "orders", orderId);
          await setDoc(orderRef, { status }, { merge: true });
          showToast(`Order #${orderId} updated to ${status}`, 'success');
        } catch (error) {
          handleFirestoreError(error, "update order status");
        }
      },

      addProduct: async (product) => {
        const { showToast, handleFirestoreError } = get();
        const newProduct: Product = { ...product, id: `PROD-${Date.now()}` };
        try {
          await setDoc(doc(db, "products", newProduct.id), newProduct);
          showToast('Product added successfully!', 'success');
        } catch (error) {
          handleFirestoreError(error, "add product");
        }
      },

      updateProduct: async (updatedProduct) => {
        const { showToast, handleFirestoreError } = get();
        try {
          await setDoc(doc(db, "products", updatedProduct.id), updatedProduct, { merge: true });
          showToast('Product updated successfully!', 'success');
        } catch (error) {
          handleFirestoreError(error, "update product");
        } 
      },

      deleteProduct: async (productId: string) => {
        const { showToast, handleFirestoreError } = get();
        try {
          await deleteDoc(doc(db, "products", productId));
          showToast('Product deleted!', 'success');
        } catch (error) {
          handleFirestoreError(error, "delete product");
        }
      },

      toggleStoreStatus: async () => {
        const { storeStatus, showToast, handleFirestoreError } = get();
        const newStatus = !storeStatus;
        try {
          await setDoc(doc(db, "settings", "store"), { isOpen: newStatus }, { merge: true });
          showToast(`Store is now ${newStatus ? 'open' : 'closed'}`, 'success');
        } catch (error) {
          handleFirestoreError(error, "update store status");
        }
      },

      setToast: (toast: ToastMessage | null) => set({ toast }),
    }),
    {
      name: 'om-sai-pan-shop-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ currentUser: state.currentUser, cart: state.cart }),
    }
  )
);

export default useStore;
