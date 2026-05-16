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

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, isLoading, error, clearError } = useAuth();

  const [name, setName]                   = useState("");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [fieldErrors, setFieldErrors]     = useState({});

  // ── Client-side validation ─────────────────────────────────
  const validate = () => {
    const errors = {};
    if (!name.trim())              errors.name    = "Full name is required";
    else if (name.trim().length < 2) errors.name  = "Name too short";
    if (!email.trim())             errors.email   = "Email is required";
    else if (!email.includes("@")) errors.email   = "Enter a valid email";
    if (!password)                 errors.password = "Password is required";
    else if (password.length < 6)  errors.password = "Minimum 6 characters";
    if (!confirmPassword)          errors.confirmPassword = "Please confirm password";
    else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    clearError();
    if (!validate()) return;

    const result = await register(
      name.trim(),
      email.trim().toLowerCase(),
      password
    );

    if (result.success) {
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

        <Text style={styles.createText}>Create Your</Text>
        <Text style={styles.accountTitle}>Account</Text>
        <Text style={styles.sub}>Join us and start your skincare journey</Text>
      </View>

      {/* ── Form ── */}
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

          {/* Full name */}
          <Text style={styles.label}>Full Name</Text>
          <View style={[
            styles.inputRow,
            fieldErrors.name && styles.inputRowError,
          ]}>
            <Ionicons name="person-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={(v) => {
                setName(v);
                setFieldErrors((e) => ({ ...e, name: null }));
              }}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {name.trim().length >= 2 && !fieldErrors.name && (
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            )}
          </View>
          {fieldErrors.name ? (
            <Text style={styles.fieldError}>{fieldErrors.name}</Text>
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
            {email.includes("@") && !fieldErrors.email && (
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

          {/* Confirm password */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={[
            styles.inputRow,
            fieldErrors.confirmPassword && styles.inputRowError,
          ]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Re-enter password"
              placeholderTextColor={colors.textMuted}
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                setFieldErrors((e) => ({ ...e, confirmPassword: null }));
              }}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirm((p) => !p)}
              hitSlop={8}
            >
              <Ionicons
                name={showConfirm ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
          {fieldErrors.confirmPassword ? (
            <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text>
          ) : null}

          {/* Sign up button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              isLoading && styles.submitBtnDisabled,
              { marginTop: 28 },
            ]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.88}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.submitBtnText}>SIGN UP</Text>
            )}
          </TouchableOpacity>

          {/* Login link */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.switchLink}>Sign in</Text>
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

  // Top section
  topSection: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingBottom: 36,
    borderBottomRightRadius: 60,
  },
  backBtn: {
    marginBottom: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
  },
  createText: {
    fontSize: 28,
    fontWeight: "400",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 2,
  },
  accountTitle: {
    fontSize: 38,
    fontWeight: "800",
    color: colors.white,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
  },

  // Form
  formCard: {
    paddingHorizontal: 28,
    paddingTop: 28,
  },

  // Server error
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

  // Inputs
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

  // Submit
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

  // Switch
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