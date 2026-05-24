import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getOrderById } from "../../src/services/orderService";
import { colors } from "../../src/constants/colors";

// Format status to readable label + color
const statusConfig = {
  pending:   { label: "Awaiting Payment", icon: "time", color: "#F39C12", bg: "rgba(243, 156, 18, 0.1)" },
  paid:      { label: "Payment Received", icon: "checkmark-circle", color: "#2ECC71", bg: "rgba(46, 204, 113, 0.1)" },
  delivered: { label: "Delivered",        icon: "cube", color: colors.primary, bg: "rgba(42,22,15,0.05)" },
  cancelled: { label: "Cancelled",        icon: "close-circle", color: "#E74C3C", bg: "rgba(231, 76, 60, 0.1)" },
};

export default function OrderConfirmationScreen() {
  const { id }  = useLocalSearchParams();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);

  // M-Pesa details for manual payment instructions
  const MPESA_TILL = "123456"; 

  useEffect(() => {
    const load = async () => {
      const result = await getOrderById(id);
      if (result.success) setOrder(result.data);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Ionicons name="search-outline" size={48} color={colors.textMuted} />
        <Text style={styles.errorText}>We couldn't find this order.</Text>
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace("/(tabs)/home")}
        >
          <Text style={styles.homeBtnText}>Return Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const date   = new Date(order.createdAt).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  
  const shortOrderId = order._id.slice(-8).toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* ── Status Header ── */}
        <View style={styles.headerState}>
          <View style={[styles.iconCircle, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={42} color={status.color} />
          </View>

          <Text style={styles.successTitle}>
            {order.status === "pending" ? "Order Reserved!" : "Order Confirmed!"}
          </Text>
          <Text style={styles.successSub}>
            {order.status === "pending" 
              ? "Your items are locked in. Please complete the payment to proceed." 
              : "Thank you for your order. We're getting it ready."}
          </Text>
        </View>

        {/* ── Action Required: Payment Instructions (Only if Pending) ── */}
        {order.status === "pending" && (
          <View style={styles.paymentInstructionCard}>
            <View style={styles.paymentInstructionHeader}>
              <Ionicons name="phone-portrait" size={18} color={colors.background} />
              <Text style={styles.paymentInstructionTitle}>Action Required: Pay via M-Pesa</Text>
            </View>
            
            <View style={styles.paymentStep}>
              <Text style={styles.stepNum}>1.</Text>
              <Text style={styles.stepText}>Go to M-Pesa {'>'} Lipa na M-Pesa {'>'} Buy Goods and Services</Text>
            </View>
            <View style={styles.paymentStep}>
              <Text style={styles.stepNum}>2.</Text>
              <Text style={styles.stepText}>Enter Till Number: <Text style={styles.highlightText}>{MPESA_TILL}</Text></Text>
            </View>
            <View style={styles.paymentStep}>
              <Text style={styles.stepNum}>3.</Text>
              <Text style={styles.stepText}>Enter Amount: <Text style={styles.highlightText}>KSh {order.totalAmount.toLocaleString()}</Text></Text>
            </View>
            
            <View style={styles.paymentNote}>
              <Ionicons name="information-circle" size={16} color={colors.background} />
              <Text style={styles.noteText}>
                We will verify payment using the phone number provided ({order.phoneNumber}). Once verified, your status will update.
              </Text>
            </View>
          </View>
        )}

        {/* ── Order Summary Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Number</Text>
            <Text style={styles.detailValue}>#{shortOrderId}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{date}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Items List ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items Ordered</Text>
          
          {order.items.map((item, index) => (
            <View key={index}>
              <View style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemQty}>x{item.quantity}</Text>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>
                  KSh {(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>
              {index < order.items.length - 1 && <View style={styles.divider} />}
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              KSh {order.totalAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* ── Actions ── */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace("/(tabs)/home")}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Continue Shopping</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push("/(tabs)/profile")}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Track Order Status</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface, 
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  homeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    marginTop: 10,
  }, 
  homeBtnText: {
    color: colors.background,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
  },

  // State Header
  headerState: {
    alignItems: "center",
    marginTop: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  successSub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },

  // Payment Instruction Card
  paymentInstructionCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  paymentInstructionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  paymentInstructionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.background,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  paymentStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  stepNum: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: "700",
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    color: colors.background,
    fontSize: 15,
    lineHeight: 22,
  },
  highlightText: {
    fontWeight: "800",
    fontSize: 16,
    color: colors.background,
  },
  paymentNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
  },
  noteText: {
    flex: 1,
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    lineHeight: 18,
  },

  // Soft Cards
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Items
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  itemQty: {
    fontSize: 13,
    color: colors.primary,
    backgroundColor: "rgba(246,221,207,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: "700",
  },
  itemName: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "500",
    flex: 1,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  
  // Total
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
  },

  // Actions
  actionContainer: {
    gap: 12,
    marginTop: 10,
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    width: "100%",
    backgroundColor: "transparent",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryBtnText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
});