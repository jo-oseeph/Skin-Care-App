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

  const {
    items,
    totalItems,
    totalPrice,
    clearCart,
    validateCartStock,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [phone, setPhone]           = useState("254");
  const [loading, setLoading]       = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError]           = useState(null);
  const [phoneError, setPhoneError] = useState(null);
  const [stockIssues, setStockIssues] = useState([]);

  // ── Phone validation ───────────────────────────────────────
  const validatePhone = (value) => {
    const cleaned = value.replace(/\s/g, "");
    return /^(254|0)?7\d{8}$/.test(cleaned);
  };

  const formatPhone = (value) => {
    const cleaned = value.replace(/\s/g, "");
    if (cleaned.startsWith("0")) return "254" + cleaned.slice(1);
    if (cleaned.startsWith("7")) return "254" + cleaned;
    return cleaned;
  };

  // ── Place order ────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setError(null);
    setPhoneError(null);
    setStockIssues([]);

    if (!validatePhone(phone)) {
      setPhoneError("Enter a valid Kenyan number e.g. 0712345678");
      return;
    }

    // Step 1 — check fresh stock for every cart item
    setValidating(true);
    const issues = await validateCartStock();
    setValidating(false);

    if (issues.length > 0) {
      // Show stock issues — user must resolve before ordering
      setStockIssues(issues);
      return;
    }

    // Step 2 — create order on backend
    setLoading(true);
    const result = await createOrder(formatPhone(phone));
    setLoading(false);

    if (result.success) {
      // Backend cleared cart in DB — clear local cart too
      clearCart();
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

        {/* ── Stock issues — shown when cart has stale stock ── */}
        {stockIssues.length > 0 && (
          <View style={styles.stockIssuesCard}>
            <View style={styles.stockIssuesHeader}>
              <Ionicons name="warning-outline" size={18} color="#F59E0B" />
              <Text style={styles.stockIssuesTitle}>
                Stock has changed
              </Text>
            </View>
            <Text style={styles.stockIssuesSub}>
              Some items are no longer available in the quantity you selected.
              Please resolve before placing your order.
            </Text>

            {stockIssues.map((issue) => (
              <View key={issue.productId} style={styles.stockIssueRow}>
                <View style={styles.stockIssueLeft}>
                  <Text style={styles.stockIssueName} numberOfLines={1}>
                    {issue.name}
                  </Text>
                  <Text style={styles.stockIssueDetail}>{issue.issue}</Text>
                </View>

                {issue.availableStock > 0 ? (
                  // Reduce to available stock
                  <TouchableOpacity
                    style={styles.fixBtn}
                    onPress={() => {
                      updateQuantity(issue.productId, issue.availableStock);
                      setStockIssues((prev) =>
                        prev.filter((i) => i.productId !== issue.productId)
                      );
                    }}
                  >
                    <Text style={styles.fixBtnText}>
                      Keep {issue.availableStock}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  // Remove item entirely
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => {
                      removeFromCart(issue.productId);
                      setStockIssues((prev) =>
                        prev.filter((i) => i.productId !== issue.productId)
                      );
                    }}
                  >
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

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

        {/* ── Payment ── */}
        <Text style={styles.sectionTitle}>Payment</Text>
        <View style={styles.card}>
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

        {/* ── Info note ── */}
        <View style={styles.noteCard}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={styles.noteText}>
            Your order will be placed immediately. M-Pesa payment
            integration coming soon — you will be contacted to complete payment.
          </Text>
        </View>

        {/* ── Server error ── */}
        {error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

      </ScrollView>

      {/* ── Bottom bar ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.bottomTotal}>
          <Text style={styles.bottomTotalLabel}>Total</Text>
          <Text style={styles.bottomTotalValue}>
            KSh {totalPrice.toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.placeOrderBtn,
            (loading || validating) && styles.placeOrderBtnDisabled,
          ]}
          onPress={handlePlaceOrder}
          disabled={loading || validating}
          activeOpacity={0.88}
        >
          {loading || validating ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={colors.white}
              />
              <Text style={styles.placeOrderText}>
                {validating ? "Checking stock..." : "Place Order"}
              </Text>
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
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "400",
  },
});