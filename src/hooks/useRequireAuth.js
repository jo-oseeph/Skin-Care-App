import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const requireAuth = (onAuthenticated) => {
    if (!isAuthenticated) {
      // Send them to login 
      router.push("/(auth)/login");
      return false;
    }
    if (onAuthenticated) onAuthenticated();
    return true;
  };

  return { requireAuth, isAuthenticated };
};