import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,

      login: async (credentials) => {
        set({ error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
          }

          const data = await response.json();

          // Immediately fetch user profile after login
          console.log('Fetching user profile after login...');
          const profileResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${data.access_token}`,
            },
          });

          console.log('Profile response status:', profileResponse.status);
          let userProfile = { username: credentials.username };
          if (profileResponse.ok) {
            userProfile = await profileResponse.json();
            console.log('User profile loaded:', userProfile);
          } else {
            console.error('Failed to fetch profile:', await profileResponse.text());
          }

          set({
            user: userProfile,
            token: data.access_token,
            isAuthenticated: true,
            error: null,
          });
          return data;
        } catch (error) {
          set({ error: error.message });
          toast.error(error.message || 'Login failed');
          throw error;
        }
      },

      signup: async (userData) => {
        set({ error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Signup failed');
          }

          const data = await response.json();

          // Immediately fetch user profile after signup
          const profileResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${data.access_token}`,
            },
          });

          let userProfile = { username: userData.username, email: userData.email };
          if (profileResponse.ok) {
            userProfile = await profileResponse.json();
          }

          set({
            user: userProfile,
            token: data.access_token,
            isAuthenticated: true,
            error: null,
          });
          toast.success('Account created successfully!');
          return data;
        } catch (error) {
          set({ error: error.message });
          toast.error(error.message || 'Signup failed');
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      getProfile: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to get profile');
          }

          const profile = await response.json();
          set({ user: profile });
          return profile;
        } catch (error) {
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;