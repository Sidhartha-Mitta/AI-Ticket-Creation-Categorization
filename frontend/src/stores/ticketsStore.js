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
          const response = await fetch(`${API_BASE_URL}/api/tickets/`, {
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
          const response = await fetch(`${API_BASE_URL}/api/admin/tickets`, {
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
          const response = await fetch(`${API_BASE_URL}/api/support/tickets`, {
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
          // First, call ML API for categorization
          const mlResponse = await fetch('https://ai-ticket-creation-ml-model.onrender.com/generate-ticket', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: ticketData.title,
              description: ticketData.description
            }),
          });

          if (!mlResponse.ok) {
            const errorData = await mlResponse.json();
            const error = new Error(errorData.detail || 'Failed to process ticket');
            error.detail = errorData.detail;
            throw error;
          }

          const mlData = await mlResponse.json();

          // Now create ticket with ML data
          const response = await fetch(`${API_BASE_URL}/api/tickets/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...ticketData,
              category: mlData.category,
              priority: mlData.priority
            }),
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
          const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/cancel`, {
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