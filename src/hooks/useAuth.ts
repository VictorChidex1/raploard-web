import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
}

/**
 * useAuth — Subscribes to Firebase Authentication state changes.
 *
 * Returns `loading: true` while the auth SDK is resolving the initial
 * session (prevents a flash of the login gate on refresh).
 * Returns `user: null` when no session exists.
 */
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function — clean up on unmount
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}
