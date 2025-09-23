import { create } from "zustand";
import { persist } from "zustand/middleware";
import { request } from "graphql-request";

const API_URL = "https://veyno-api.onrender.com/graphql";

interface User {
  id: string;
  email: string;
  username: string;
  credits: number;
  role: "USER" | "ADMIN";
  createdAt: string;
}

interface Webhook {
  id: string;
  url: string;
  actions: string; // JSON string
  costPerEvent: number;
  status: string;
  createdAt: string;
}

interface QueryState {
  user: User | null;
  webhooks: Webhook[];
  loading: boolean;
  error: string | null;
  fetchMe: () => Promise<void>;
  fetchWebhooks: () => Promise<void>;
}

export const useQueryStore = create<QueryState>()(
  persist(
    (set) => ({
      user: null,
      webhooks: [],
      loading: false,
      error: null,

      fetchMe: async () => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("authToken");
          if (!token) throw new Error("No token found");

          const query = `
            query {
              me {
                id
                email
                username
                credits
                role
                createdAt
              }
            }
          `;

          const response = await request<{ me: User }>(
            API_URL,
            query,
            undefined,
            { Authorization: `Bearer ${token}` }
          );

          set({ user: response.me, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false, user: null });
        }
      },

      fetchWebhooks: async () => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("authToken");
          if (!token) throw new Error("No token found");

          const query = `
            query {
              getWebhooks {
                id
                url
                actions
                costPerEvent
                status
                createdAt
              }
            }
          `;

          const response = await request<{ getWebhooks: Webhook[] }>(
            API_URL,
            query,
            undefined,
            { Authorization: `Bearer ${token}` }
          );

          set({ webhooks: response.getWebhooks, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false, webhooks: [] });
        }
      },
    }),
    {
      name: "query-storage",
      partialize: (state) => ({
        user: state.user,
        webhooks: state.webhooks, // ✅ Persist webhooks as well
      }),
    }
  )
);
