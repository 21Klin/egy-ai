import { create } from "zustand";
import { subscribeToAuth } from "./firebase-auth";
import type { User } from "firebase/auth";
import { getAuth, signOut } from "firebase/auth";
import { db } from "./firestore";
import { doc, getDoc } from "firebase/firestore";

interface Profile {
  uid: string;
  email: string;
  username: string;
  createdAt: number;

  showBotTrades: boolean;
  showManualTrades: boolean;
  showBotStats: boolean;
  showManualStats: boolean;
}

interface UserState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;

  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  profile: null,
  loading: true,

  // FIXED LOGOUT FUNCTION
  logout: async () => {
    const auth = getAuth();        // correct way to get auth instance
    await signOut(auth);

    set({
      user: null,
      profile: null,
      loading: false,
    });
  },
}));

// Auth listener
subscribeToAuth(async (authUser) => {
  if (!authUser) {
    useUserStore.setState({
      user: null,
      profile: null,
      loading: false,
    });
    return;
  }

  // Load Firestore profile
  const ref = doc(db, "users", authUser.uid);
  const snap = await getDoc(ref);
  const profile = snap.exists() ? (snap.data() as Profile) : null;

  // Update store
  useUserStore.setState({
    user: authUser,
    profile,
    loading: false,
  });
});
