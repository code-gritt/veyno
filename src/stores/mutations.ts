import { create } from "zustand";
import { request } from "graphql-request";
import { useQueryStore } from "./queries";

const API_URL = "https://veyno-api.onrender.com/graphql";

interface AuthPayload {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    credits: number;
    role: "USER" | "ADMIN";
    createdAt: string;
  };
}

interface Webhook {
  id: string;
  url: string;
  actions: string;
  costPerEvent: number;
  status: string;
  createdAt: string;
}

interface WebhookInput {
  actions: {
    type: string;
    rules?: string;
    condition?: string;
    url?: string;
    apiUrl?: string;
  }[];
  costPerEvent: number;
}

interface MutationState {
  loading: boolean;
  error: string | null;
  register: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  createWebhook: (input: WebhookInput) => Promise<void>;
  updateWebhook: (
    id: string,
    input: Partial<WebhookInput> & { status?: string }
  ) => Promise<void>;
  deleteWebhook: (id: string) => Promise<void>;
}

export const useMutationStore = create<MutationState>((set) => ({
  loading: false,
  error: null,

  // ---------- Auth ----------
  register: async (email, username, password) => {
    set({ loading: true, error: null });
    try {
      const mutation = `
        mutation {
          register(email: "${email}", username: "${username}", password: "${password}") {
            token
            user { id email username credits role createdAt }
          }
        }
      `;
      const response = await request<{ register: AuthPayload }>(
        API_URL,
        mutation
      );
      localStorage.setItem("authToken", response.register.token);
      useQueryStore.setState({ user: response.register.user });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const mutation = `
        mutation {
          login(email: "${email}", password: "${password}") {
            token
            user { id email username credits role createdAt }
          }
        }
      `;
      const response = await request<{ login: AuthPayload }>(API_URL, mutation);
      localStorage.setItem("authToken", response.login.token);
      useQueryStore.setState({ user: response.login.user });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("authToken");
    useQueryStore.setState({ user: null });
    set({ error: null });
  },

  // ---------- Webhooks ----------
  createWebhook: async (input) => {
    set({ loading: true, error: null });
    try {
      const mutation = `
        mutation {
          createWebhook(actions: ${JSON.stringify(
            input.actions
          )}, costPerEvent: ${input.costPerEvent}) {
            id url actions costPerEvent status createdAt
          }
        }
      `;
      const response = await request<{ createWebhook: Webhook }>(
        API_URL,
        mutation
      );
      useQueryStore.setState((state) => ({
        webhooks: [response.createWebhook, ...state.webhooks],
      }));
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateWebhook: async (id, input) => {
    set({ loading: true, error: null });
    try {
      const mutation = `
        mutation {
          updateWebhook(
            id: "${id}", 
            actions: ${input.actions ? JSON.stringify(input.actions) : null}, 
            costPerEvent: ${input.costPerEvent ?? null}, 
            status: ${input.status ? `"${input.status}"` : null}
          ) {
            id url actions costPerEvent status createdAt
          }
        }
      `;
      await request(API_URL, mutation);
      await useQueryStore.getState().fetchWebhooks(); // Refresh list
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteWebhook: async (id) => {
    set({ loading: true, error: null });
    try {
      const mutation = `
        mutation {
          deleteWebhook(id: "${id}")
        }
      `;
      await request(API_URL, mutation);
      await useQueryStore.getState().fetchWebhooks(); // Refresh list
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
