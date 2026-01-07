import { create } from 'zustand';
import type { UserInfo } from '../api/userApi';

type UserStoreState = {
  user: UserInfo | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

type UserStoreAction = {
  login: (userInfo: UserInfo) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateUserInfo: (userInfo: Partial<UserInfo>) => void;
}

type UserState = UserStoreState & UserStoreAction;

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  isLoggedIn: false,
  loading: false,
  error: null,

  login: (userInfo) => set({ 
    user: userInfo, 
    isLoggedIn: true,
    error: null
  }),

  logout: () => set({ 
    user: null, 
    isLoggedIn: false,
    error: null
  }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  updateUserInfo: (userInfo) => set((state) => ({ 
    user: state.user ? { ...state.user, ...userInfo } : null 
  })),
}));