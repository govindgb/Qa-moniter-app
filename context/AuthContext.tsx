'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'tester' | 'manager';
  isActive: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };


const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
};



function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
      case 'UPDATE_USER':
        return {
          ...state,
          user: state.user ? { ...state.user, ...action.payload } : null,
        };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
      

    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { data: session, status } = useSession();

  const updateUser = (newUserData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: newUserData });
  };
  

  // Set up axios interceptor for auth token
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Add response interceptor to handle 401 errors
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Check authentication on mount
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (session?.user) {
      // User is authenticated via NextAuth
      const user: User = {
        _id: session.user.id || '',
        name: session.user.name || '',
        email: session.user.email || '',
        role: (session.user as any).role || 'tester',
        isActive: (session.user as any).isActive !== false,
      };
      dispatch({ type: 'SET_USER', payload: user });
    } else {
      // Check for JWT token authentication
      checkAuth();
    }
  }, [session, status]);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await axios.post('/api/auth/login', { email, password });

      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('auth-token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: string = 'tester') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await axios.post('/api/auth/register', { name, email, password, role });

      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('auth-token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await nextAuthSignIn('google', { callbackUrl: '/dashboard' });
    } catch (error: any) {
      const errorMessage = error.message || 'Google login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = () => {
    // Sign out from NextAuth if session exists
    if (session) {
      nextAuthSignOut({ callbackUrl: '/login' });
    }
    
    // Clear JWT token
    localStorage.removeItem('auth-token');
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get('/api/auth/me');

      if (response.data.success) {
        dispatch({ type: 'SET_USER', payload: response.data.data });
      } else {
        logout();
      }
    } catch (error) {
      logout();
    }
  };
    const clearError = () => {
      dispatch({ type: 'SET_ERROR', payload: null });
    };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    loginWithGoogle,
    logout,
    checkAuth,
    clearError,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


