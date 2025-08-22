// client/src/store/authStore.ts
import { create } from 'zustand';
import { api } from "../services/api";


type User = { id: string; email: string; name: string } | null;

interface State {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  me: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<State>()((set, get) => ({
  user: null,
  loading: false,

  async login(email, password) {
    set({ loading: true });
    try {
      // 1) login (sets httpOnly cookie on success)
      const { data } = await api.post('/auth/login', { email, password });
      // if server also returns a bearer token in body (optional)
      if (data?.token) localStorage.setItem('token', data.token);

      // 2) immediately hydrate from /auth/me so guards don’t bounce you
      const meResp = await api.get('/auth/me', { params: { t: Date.now() } });
      set({ user: meResp.data?.user ?? null, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;  // let UI show toast
    }
  },

  async me() {
    set({ loading: true });
    try {
      const { data } = await api.get('/auth/me', { params: { t: Date.now() } });
      set({ user: data?.user ?? null, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      set({ user: null });
    }
  },
}));
