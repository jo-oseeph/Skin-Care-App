import { Redirect } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { colors } from "../src/constants/colors";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show spinner while checking stored token on boot
  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect based on auth state
  return <Redirect href={isAuthenticated ? "/(tabs)/home" : "/(auth)/login"} />;
}