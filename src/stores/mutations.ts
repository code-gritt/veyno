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
}

export const useMutationStore = create<MutationState>((set) => ({
  loading: false,
  error: null,

  register: async (email: string, username: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const mutation = `
        mutation {
          register(email: "${email}", username: "${username}", password: "${password}") {
            token
            user {
              id
              email
              username
              credits
              role
              createdAt
            }
          }
        }
      `;
      const response = await request<{ register: AuthPayload }>(
        API_URL,
        mutation
      );

      // Save token
      localStorage.setItem("authToken", response.register.token);

      // ✅ Use setState instead of mutating directly
      useQueryStore.setState({ user: response.register.user });

      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const mutation = `
        mutation {
          login(email: "${email}", password: "${password}") {
            token
            user {
              id
              email
              username
              credits
              role
              createdAt
            }
          }
        }
      `;
      const response = await request<{ login: AuthPayload }>(API_URL, mutation);

      // Save token
      localStorage.setItem("authToken", response.login.token);

      // ✅ Use setState instead of mutating directly
      useQueryStore.setState({ user: response.login.user });

      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("authToken");

    // ✅ Reset user properly
    useQueryStore.setState({ user: null });

    set({ error: null });
  },
}));
