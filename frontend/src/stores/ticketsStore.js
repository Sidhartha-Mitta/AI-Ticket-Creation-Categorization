import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useAuthStore from './authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const useTicketsStore = create(
  persist(
    (set, get) => ({
      tickets: [],
      loading: false,
      error: null,

      fetchTickets: async () => {
        const { token } = useAuthStore.getState();
        if (!token) return;

        set({ loading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/tickets/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch tickets');
          }

          const tickets = await response.json();
          set({ tickets, loading: false });
          return tickets;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      fetchAllTickets: async () => {
        const { token } = useAuthStore.getState();
        if (!token) throw new Error('No token found');

        set({ loading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/admin/tickets`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch all tickets');
          }

          const data = await response.json();
          set({ loading: false });
          return data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      fetchAssignedTickets: async () => {
        const { token } = useAuthStore.getState();
        if (!token) throw new Error('No token found');

        set({ loading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/support/tickets`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch assigned tickets');
          }

          const data = await response.json();
          set({ loading: false });
          return data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      createTicket: async (ticketData) => {
        const { token } = useAuthStore.getState();
        if (!token) return;

        set({ loading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/tickets/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(ticketData),
          });

          if (!response.ok) {
            throw new Error('Failed to create ticket');
          }

          const newTicket = await response.json();
          set((state) => ({
            tickets: [...state.tickets, newTicket],
            loading: false,
          }));
          return newTicket;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      cancelTicket: async (ticketId) => {
        const { token } = useAuthStore.getState();
        if (!token) return;

        set({ loading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/cancel`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to cancel ticket');
          }

          const result = await response.json();
          set((state) => ({
            tickets: state.tickets.map((ticket) =>
              ticket.ticket_id === ticketId ? { ...ticket, status: 'Dropped' } : ticket
            ),
            loading: false,
          }));
          return result;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'tickets-storage',
    }
  )
);

export default useTicketsStore;