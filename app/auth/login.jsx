import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { colors } from "../../src/constants/colors";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Client-side validation ─────────────────────────────────
  const validate = () => {
    const errors = {};
    if (!email.trim())            errors.email    = "Email is required";
    else if (!email.includes("@")) errors.email   = "Enter a valid email";
    if (!password)                errors.password = "Password is required";
    else if (password.length < 6) errors.password = "Minimum 6 characters";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    if (!validate()) return;

    const result = await login(email.trim().toLowerCase(), password);
    if (result.success) {
      // Navigate to home — cart sync happens automatically in CartContext
      router.replace("/(tabs)/home");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* ── Top curved section ── */}
      <View style={[styles.topSection, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>

        <Text style={styles.hello}>Hello,</Text>
        <Text style={styles.welcomeTitle}>Sign in!</Text>
        <Text style={styles.welcomeSub}>
          Welcome back — we missed you
        </Text>
      </View>

      {/* ── Form card ── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.formCard,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Server error */}
          {error ? (
            <View style={styles.serverError}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
              <Text style={styles.serverErrorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={[
            styles.inputRow,
            fieldErrors.email && styles.inputRowError,
          ]}>
            <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setFieldErrors((e) => ({ ...e, email: null }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {email.length > 0 && !fieldErrors.email && (
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            )}
          </View>
          {fieldErrors.email ? (
            <Text style={styles.fieldError}>{fieldErrors.email}</Text>
          ) : null}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={[
            styles.inputRow,
            fieldErrors.password && styles.inputRowError,
          ]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Min. 6 characters"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setFieldErrors((e) => ({ ...e, password: null }));
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((p) => !p)}
              hitSlop={8}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
          {fieldErrors.password ? (
            <Text style={styles.fieldError}>{fieldErrors.password}</Text>
          ) : null}

          {/* Forgot password */}
          <TouchableOpacity
            style={styles.forgotRow}
            onPress={() => router.push("/(auth)/forgot-password")}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign in button */}
          <TouchableOpacity
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.88}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.submitBtnText}>SIGN IN</Text>
            )}
          </TouchableOpacity>

          {/* Register link */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.switchLink}>Sign up</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },

  // Top green section
  topSection: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingBottom: 40,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 60,  // single rounded corner — matches inspo
  },
  backBtn: {
    marginBottom: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
  },
  hello: {
    fontSize: 28,
    fontWeight: "400",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 2,
  },
  welcomeTitle: {
    fontSize: 38,
    fontWeight: "800",
    color: colors.white,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  welcomeSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    marginBottom: 4,
  },

  // Form
  formCard: {
    paddingHorizontal: 28,
    paddingTop: 32,
  },

  // Server error banner
  serverError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  serverErrorText: {
    fontSize: 13,
    color: colors.error,
    flex: 1,
  },

  // Input
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputRowError: {
    borderColor: colors.error,
    backgroundColor: "#FFF8F8",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 0,
  },
  fieldError: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },

  // Forgot password
  forgotRow: {
    alignSelf: "flex-end",
    marginTop: 10,
    marginBottom: 28,
  },
  forgotText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },

  // Submit button
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  // Switch to register
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  switchText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  switchLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "700",
  },
});