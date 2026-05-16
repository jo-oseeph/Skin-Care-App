import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

// Call this whenever an action requires the user to be logged in.
// If not logged in, redirects to login and returns false.
// If logged in, returns true and does nothing.

export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const requireAuth = (onAuthenticated) => {
    if (!isAuthenticated) {
      // Send them to login — they'll come back after
      router.push("/(auth)/login");
      return false;
    }
    // Already logged in — run the action
    if (onAuthenticated) onAuthenticated();
    return true;
  };

  return { requireAuth, isAuthenticated };
};