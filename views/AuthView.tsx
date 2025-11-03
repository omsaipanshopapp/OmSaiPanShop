import React, { useState } from 'react';
import { UserRole } from '../types';
import { LoginIcon, ShoppingBagIcon } from '../components/icons/Icons';

interface AuthViewProps {
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onSignUp: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
}

export default function AuthView({ onSignIn, onSignUp }: AuthViewProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [ownerKey, setOwnerKey] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const OWNER_SECRET = (import.meta as any).env?.VITE_OWNER_SECRET as string | undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if ((!isLoginView && !name) || !email || !password) {
        setError('Please fill in all fields.');
        return;
    }
    if (!isLoginView && role === UserRole.OWNER) {
      if (!OWNER_SECRET) {
        setError('Owner sign-up is not available. Missing VITE_OWNER_SECRET.');
        return;
      }
      if (ownerKey !== OWNER_SECRET) {
        setError('Invalid owner secret.');
        return;
      }
    }

    setIsSubmitting(true);
    let success = false;
    if (isLoginView) {
      success = await onSignIn(email, password);
    } else {
      success = await onSignUp(name, email, password, role);
    }
    setIsSubmitting(false);
    
    if (!success) {
      // Error via Toast; optional immediate message could be set here.
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <ShoppingBagIcon className="h-12 w-12 text-indigo-600 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Om Sai Pan Shop</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLoginView ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLoginView && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLoginView ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              </div>
            </div>
            
            {!isLoginView && (
              <div className="flex gap-4">
                 <label className="flex items-center">
                  <input type="radio" name="role" value={UserRole.CUSTOMER} checked={role === UserRole.CUSTOMER} onChange={() => setRole(UserRole.CUSTOMER)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"/>
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-200">Customer</span>
                </label>
                 <label className="flex items-center">
                  <input type="radio" name="role" value={UserRole.OWNER} checked={role === UserRole.OWNER} onChange={() => setRole(UserRole.OWNER)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"/>
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-200">Owner</span>
                </label>
              </div>
            )}

            {!isLoginView && role === UserRole.OWNER && (
              <div>
                <label htmlFor="ownerKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Owner Secret
                </label>
                <div className="mt-1">
                  <input
                    id="ownerKey"
                    name="ownerKey"
                    type="password"
                    placeholder="Enter owner secret"
                    required
                    value={ownerKey}
                    onChange={(e) => setOwnerKey(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : (
                    <>
                        <LoginIcon className="w-5 h-5 mr-2 -ml-1" />
                        {isLoginView ? 'Sign In' : 'Sign Up'}
                    </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              {isLoginView ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}