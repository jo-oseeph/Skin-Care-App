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
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "../src/context/CartContext";
import { createOrder } from "../src/services/orderService";
import { colors } from "../src/constants/colors";

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    items,
    totalItems,
    totalPrice,
    clearCart,
    validateCartStock,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [fullName, setFullName] = useState("");
  const [county, setCounty] = useState("");
  const [town, setTown] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");

  const [fullNameError, setFullNameError] = useState(null);
  const [countyError, setCountyError] = useState(null);
  const [townError, setTownError] = useState(null);
  const [addressError, setAddressError] = useState(null);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(null);
  const [phoneError, setPhoneError] = useState(null);
  const [stockIssues, setStockIssues] = useState([]);

  // ── Phone Validation ──
  const validatePhone = (value) => {
    const cleaned = value.replace(/\s/g, "");
    return /^(254|0)?7\d{8}$/.test(cleaned) || /^(254|0)?1\d{8}$/.test(cleaned); 
  };

  const formatPhone = (value) => {
    const cleaned = value.replace(/\s/g, "");
    if (cleaned.startsWith("0")) return "254" + cleaned.slice(1);
    if (cleaned.startsWith("7") || cleaned.startsWith("1"))
      return "254" + cleaned;
    return cleaned;
  };

  //Place Order 
 const handlePlaceOrder = async () => {
  setError(null);
  setPhoneError(null);
  setFullNameError(null);
  setCountyError(null);
  setTownError(null);
  setAddressError(null);
  setStockIssues([]);

  let hasError = false;

  if (!fullName.trim()) {
    setFullNameError("Full name is required");
    hasError = true;
  }

  if (!validatePhone(phone)) {
    setPhoneError("Enter a valid Kenyan number");
    hasError = true;
  }

  if (!county.trim()) {
    setCountyError("County is required");
    hasError = true;
  }

  if (!town.trim()) {
    setTownError("Town is required");
    hasError = true;
  }

  if (!address.trim()) {
    setAddressError("Address is required");
    hasError = true;
  }

  if (hasError) return;

  setValidating(true);
  const issues = await validateCartStock();
  setValidating(false);

  if (issues.length > 0) {
    setStockIssues(issues);
    return;
  }

  setLoading(true);

  const result = await createOrder({
    deliveryDetails: {
      fullName: fullName.trim(),
      phoneNumber: formatPhone(phone),
      county: county.trim(),
      town: town.trim(),
      address: address.trim(),
      landmark: landmark.trim(),
    },
  });

  setLoading(false);

  if (!result.success) {
    setError(result.message || "Failed to place order");
    return;
  }

  const orderId = result.data._id;

  const message = `
New Order #${orderId}

Name: ${fullName}
Phone: ${formatPhone(phone)}
Location: ${county}, ${town}
Address: ${address}
Landmark: ${landmark}

Items:
${items.map(i => `- ${i.name} x${i.quantity} = KSh ${i.price * i.quantity}`).join("\n")}

Total: KSh ${totalPrice}
`;

  const ownerPhone = "254719238337"; 

  const url = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(message)}`;

  clearCart();

  router.replace(`/order-confirmation/${orderId}`);

  setTimeout(() => {
    Linking.openURL(url);
  }, 500);
};
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 140 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        Dynamic Stock Issues Resolution 
        {stockIssues.length > 0 && (
          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Ionicons name="alert-circle" size={22} color="#E74C3C" />
              <Text style={styles.warningTitle}>Inventory Update</Text>
            </View>
            <Text style={styles.warningSub}>
              Some items in your cart sold out while you were browsing. Please
              review the changes below.
            </Text>

            {stockIssues.map((issue) => (
              <View key={issue.productId} style={styles.issueRow}>
                <View style={styles.issueInfo}>
                  <Text style={styles.issueName} numberOfLines={1}>
                    {issue.name}
                  </Text>
                  <Text style={styles.issueDetail}>
                    {issue.availableStock > 0
                      ? `Only ${issue.availableStock} left`
                      : "Out of stock"}
                  </Text>
                </View>

                {issue.availableStock > 0 ? (
                  <TouchableOpacity
                    style={styles.actionBtnUpdate}
                    onPress={() => {
                      updateQuantity(issue.productId, issue.availableStock);
                      setStockIssues((prev) =>
                        prev.filter((i) => i.productId !== issue.productId),
                      );
                    }}
                  >
                    <Text style={styles.actionBtnTextUpdate}>Update</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.actionBtnRemove}
                    onPress={() => {
                      removeFromCart(issue.productId);
                      setStockIssues((prev) =>
                        prev.filter((i) => i.productId !== issue.productId),
                      );
                    }}
                  >
                    <Text style={styles.actionBtnTextRemove}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── Order Summary ── */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.card}>
          {items.map((item, index) => (
            <View key={item.productId}>
              <View style={styles.orderItemRow}>
                <View style={styles.orderItemLeft}>
                  <Text style={styles.orderItemQty}>x{item.quantity}</Text>
                  <Text style={styles.orderItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
                <Text style={styles.orderItemPrice}>
                  KSh {(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>
              {index < items.length - 1 && <View style={styles.divider} />}
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.orderItemRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>Calculated next step</Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Delivery Details</Text>

<View style={styles.card}>
  <Text style={styles.inputLabel}>Full Name</Text>

  <View
    style={[
      styles.inputWrapperNormal,
      fullNameError && styles.inputWrapperError,
    ]}
  >
    <TextInput
      style={styles.normalInput}
      placeholder="John Doe"
      value={fullName}
      onChangeText={(v) => {
        setFullName(v);
        setFullNameError(null);
      }}
    />
  </View>

  {fullNameError && (
    <Text style={styles.errorText}>{fullNameError}</Text>
  )}

  <View style={{ height: 16 }} />

  <Text style={styles.inputLabel}>County</Text>

  <View
    style={[
      styles.inputWrapperNormal,
      countyError && styles.inputWrapperError,
    ]}
  >
    <TextInput
      style={styles.normalInput}
      placeholder="Nairobi"
      value={county}
      onChangeText={(v) => {
        setCounty(v);
        setCountyError(null);
      }}
    />
  </View>

  {countyError && (
    <Text style={styles.errorText}>{countyError}</Text>
  )}

  <View style={{ height: 16 }} />

  <Text style={styles.inputLabel}>Town / Area</Text>

  <View
    style={[
      styles.inputWrapperNormal,
      townError && styles.inputWrapperError,
    ]}
  >
    <TextInput
      style={styles.normalInput}
      placeholder="Westlands"
      value={town}
      onChangeText={(v) => {
        setTown(v);
        setTownError(null);
      }}
    />
  </View>

  {townError && (
    <Text style={styles.errorText}>{townError}</Text>
  )}

  <View style={{ height: 16 }} />

  <Text style={styles.inputLabel}>Delivery Address</Text>

  <View
    style={[
      styles.inputWrapperNormal,
      addressError && styles.inputWrapperError,
    ]}
  >
    <TextInput
      style={styles.normalInput}
      placeholder="Building, Street, House Number"
      value={address}
      onChangeText={(v) => {
        setAddress(v);
        setAddressError(null);
      }}
      multiline
    />
  </View>

  {addressError && (
    <Text style={styles.errorText}>{addressError}</Text>
  )}

  <View style={{ height: 16 }} />

  <Text style={styles.inputLabel}>
    Landmark (Optional)
  </Text>

  <View style={styles.inputWrapperNormal}>
    <TextInput
      style={styles.normalInput}
      placeholder="Near Quickmart"
      value={landmark}
      onChangeText={setLandmark}
    />
  </View>
</View>

        {/* ── Payment Section ── */}
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <View style={styles.card}>
          <View style={styles.mpesaHeader}>
            <View style={styles.mpesaIconWrapper}>
              <Ionicons name="phone-portrait" size={20} color="#2ECC71" />
            </View>
            <View>
              <Text style={styles.paymentMethodTitle}>
                M-Pesa Manual Transfer
              </Text>
              <Text style={styles.paymentMethodSub}>
                You will send money securely on the next page.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.inputLabel}>M-Pesa Phone Number</Text>
          <Text style={styles.inputContext}>
            Provide the number you will use to send the payment so we can verify
            your transaction.
          </Text>

          <View
            style={[
              styles.inputWrapper,
              phoneError && styles.inputWrapperError,
            ]}
          >
            <Text style={styles.inputPrefix}>+254</Text>
            <TextInput
              style={styles.input}
              placeholder="712 345 678"
              placeholderTextColor={colors.textMuted}
              value={phone.replace(/^(254|0)/, "")} // Strip prefix for display if they typed it
              onChangeText={(v) => {
                setPhone(v);
                setPhoneError(null);
              }}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
          {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}
        </View>

        {/* ── Server Error ── */}
        {error && (
          <View style={styles.serverErrorBlock}>
            <Ionicons name="warning" size={18} color="#E74C3C" />
            <Text style={styles.serverErrorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Sticky Bottom Sheet ── */}
      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total to Pay</Text>
          <Text style={styles.totalValue}>
            KSh {totalPrice.toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutBtn,
            (loading || validating) && styles.checkoutBtnDisabled,
          ]}
          onPress={handlePlaceOrder}
          disabled={loading || validating}
          activeOpacity={0.85}
        >
          {loading || validating ? (
            <ActivityIndicator color={colors.background} size="small" />
          ) : (
            <>
              <Text style={styles.checkoutText}>Confirm & Pay</Text>
              <Ionicons
                name="lock-closed"
                size={16}
                color={colors.background}
              />
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
    backgroundColor: colors.surface, // Warm background
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.3,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
    marginTop: 20,
  },

  // Soft Cards
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    shadowColor: colors.primary,
    shadowOpacity: 0.03,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },

  // Order Summary Items
  orderItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  orderItemQty: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    backgroundColor: "rgba(246,221,207,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orderItemName: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "500",
    flex: 1,
  },
  orderItemPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: "italic",
  },

  // Payment Section
  mpesaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  mpesaIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(46, 204, 113, 0.15)", // Soft Mpesa green
    justifyContent: "center",
    alignItems: "center",
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  paymentMethodSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  inputContext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 999, // Pill shape
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    height: 52,
  },
  inputWrapperError: {
    borderColor: "#E74C3C",
    backgroundColor: "rgba(231, 76, 60, 0.05)",
  },
  inputPrefix: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    paddingVertical: 0, // Reset android padding
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 8,
    marginLeft: 8,
  },

  // Warning/Stock Block
  warningCard: {
    backgroundColor: "rgba(231, 76, 60, 0.05)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(231, 76, 60, 0.2)",
    marginBottom: 10,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E74C3C",
  },
  warningSub: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  issueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  issueInfo: {
    flex: 1,
    paddingRight: 12,
  },
  issueName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  issueDetail: {
    fontSize: 12,
    color: "#E74C3C",
    fontWeight: "500",
    marginTop: 2,
  },
  actionBtnUpdate: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  actionBtnTextUpdate: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  actionBtnRemove: {
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  actionBtnTextRemove: {
    color: "#E74C3C",
    fontSize: 12,
    fontWeight: "600",
  },

  // Server Error
  serverErrorBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  serverErrorText: {
    flex: 1,
    color: "#E74C3C",
    fontSize: 13,
    fontWeight: "500",
  },

  // Bottom Sticky Sheet
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary,
  },
  checkoutBtn: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  checkoutBtnDisabled: {
    backgroundColor: colors.textMuted,
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.background,
  },
  inputWrapperNormal: {
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 16,
  paddingHorizontal: 16,
  minHeight: 54,
  justifyContent: "center",
},

normalInput: {
  fontSize: 15,
  color: colors.text,
  paddingVertical: 12,
},
});
