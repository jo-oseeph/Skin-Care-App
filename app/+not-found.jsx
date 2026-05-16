import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../src/constants/colors";

export default function NotFound() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={56} color={colors.textMuted} />
      <Text style={styles.title}>Page not found</Text>
      <Text style={styles.sub}>This screen doesn't exist</Text> 
      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.replace("/(tabs)/home")}
      >
        <Text style={styles.btnText}>Go Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  sub: {
    fontSize: 14,
    color: colors.textMuted,
  },
  btn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
});