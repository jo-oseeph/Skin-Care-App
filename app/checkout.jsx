import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../src/context/CartContext";
import { createOrder } from "../src/services/orderService";
import { colors } from "../src/constants/colors";

export default function CheckoutScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { items, totalItems, totalPrice, clearCart } = useCart();

  const [phone, setPhone]       = useState("254");  // M-Pesa format
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [phoneError, setPhoneError] = useState(null);

  // ── Validate Kenyan phone number ───────────────────────────
  const validatePhone = (value) => {
    // Accept: 2547XXXXXXXX or 07XXXXXXXX or 7XXXXXXXX
    const cleaned = value.replace(/\s/g, "");
    const kenyanPhone = /^(254|0)?7\d{8}$/.test(cleaned);
    return kenyanPhone;
  };

  // Normalize to 2547XXXXXXXX format
  const formatPhone = (value) => {
    const cleaned = value.replace(/\s/g, "");
    if (cleaned.startsWith("0")) return "254" + cleaned.slice(1);
    if (cleaned.startsWith("7")) return "254" + cleaned;
    return cleaned;
  };

  const handlePlaceOrder = async () => {
    setError(null);
    setPhoneError(null);

    if (!validatePhone(phone)) {
      setPhoneError("Enter a valid Kenyan number e.g. 0712345678");
      return;
    }

    setLoading(true);

    const formattedPhone = formatPhone(phone);
    const result = await createOrder(formattedPhone);

    setLoading(false);

    if (result.success) {
      // Clear local cart — backend already cleared it
      clearCart();
      // Navigate to order confirmation
      router.replace(`/order-confirmation/${result.data._id}`);
    } else {
      setError(result.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Order summary ── */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.card}>
          {items.map((item) => (
            <View key={item.productId} style={styles.orderItem}>
              <View style={styles.orderItemLeft}>
                <Text style={styles.orderItemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.orderItemQty}>x{item.quantity}</Text>
              </View>
              <Text style={styles.orderItemPrice}>
                KSh {(item.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}

          <View style={styles.cardDivider} />

          <View style={styles.orderItem}>
            <Text style={styles.orderItemName}>Delivery</Text>
            <Text style={styles.freeText}>Free</Text>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.orderItem}>
            <Text style={styles.totalLabel}>
              Total ({totalItems} items)
            </Text>
            <Text style={styles.totalValue}>
              KSh {totalPrice.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* ── Payment section ── */}
        <Text style={styles.sectionTitle}>Payment</Text>
        <View style={styles.card}>

          {/* M-Pesa badge */}
          <View style={styles.paymentMethod}>
            <View style={styles.mpesaBadge}>
              <Text style={styles.mpesaText}>M-PESA</Text>
            </View>
            <View>
              <Text style={styles.paymentMethodTitle}>Pay via M-Pesa</Text>
              <Text style={styles.paymentMethodSub}>
                Enter your M-Pesa number below
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Phone input */}
          <Text style={styles.inputLabel}>M-Pesa Phone Number</Text>
          <View style={[
            styles.inputRow,
            phoneError && styles.inputRowError,
          ]}>
            <Ionicons
              name="phone-portrait-outline"
              size={18}
              color={colors.textMuted}
            />
            <TextInput
              style={styles.input}
              placeholder="0712 345 678"
              placeholderTextColor={colors.textMuted}
              value={phone}
              onChangeText={(v) => {
                setPhone(v);
                setPhoneError(null);
              }}
              keyboardType="phone-pad"
              maxLength={13}
            />
          </View>
          {phoneError ? (
            <Text style={styles.fieldError}>{phoneError}</Text>
          ) : (
            <Text style={styles.inputHint}>
              You will receive an STK push on this number
            </Text>
          )}
        </View>

        {/* ── Note about payment ── */}
        <View style={styles.noteCard}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={styles.noteText}>
            Your order will be placed immediately. M-Pesa payment integration
            coming soon — you will be contacted to complete payment.
          </Text>
        </View>

        {/* Server error */}
        {error ? (
          <View style={styles.errorCard}>
            <Ionicons
              name="alert-circle-outline"
              size={16}
              color={colors.error}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

      </ScrollView>

      {/* ── Place order button — fixed at bottom ── */}
      <View style={[
        styles.bottomBar,
        { paddingBottom: insets.bottom + 16 },
      ]}>
        <View style={styles.bottomTotal}>
          <Text style={styles.bottomTotalLabel}>Total</Text>
          <Text style={styles.bottomTotalValue}>
            KSh {totalPrice.toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderBtn, loading && styles.placeOrderBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.white} />
              <Text style={styles.placeOrderText}>Place Order</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },

  // Content
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: -8,
  },

  // Cards
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
  },

  // Order items
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
    flex: 1,
  },
  orderItemQty: {
    fontSize: 12,
    color: colors.textMuted,
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  freeText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.success,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary,
  },

  // Payment method
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mpesaBadge: {
    backgroundColor: "#00A651",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mpesaText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  paymentMethodTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  paymentMethodSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },

  // Phone input
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: -4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 48,
  },
  inputRowError: {
    borderColor: colors.error,
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
    marginTop: -4,
  },
  inputHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -4,
  },

  // Note card
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.accentDark,
  },
  noteText: {
    fontSize: 13,
    color: colors.primary,
    lineHeight: 19,
    flex: 1,
  },

  // Error card
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    flex: 1,
  },

  // Bottom bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  bottomTotal: {
    gap: 2,
  },
  bottomTotalLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  bottomTotalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
  },
  placeOrderBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  placeOrderBtnDisabled: {
    opacity: 0.7,
  },
  placeOrderText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});