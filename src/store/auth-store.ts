// src/store/auth-store.ts
import { create } from "zustand";
import { User } from "firebase/auth";
import { subscribeToAuth } from "@/lib/firebase-auth";

interface AuthState {
  user: User | null;
  loading: boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
}));

// Initialize listener once
subscribeToAuth((user) => {
  useAuthStore.setState({
    user: user ?? null,
    loading: false,
  });
});
