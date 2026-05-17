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
  pending:   { label: "Pending",   color: "#F59E0B", bg: "#FEF3C7" },
  paid:      { label: "Paid",      color: colors.success, bg: "#D1FAE5" },
  delivered: { label: "Delivered", color: colors.primary, bg: colors.accent },
  cancelled: { label: "Cancelled", color: colors.error, bg: "#FEE2E2" },
};

export default function OrderConfirmationScreen() {
  const { id }  = useLocalSearchParams();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);

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
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace("/(tabs)/home")}
        >
          <Text style={styles.homeBtnText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const date   = new Date(order.createdAt).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* ── Success icon ── */}
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={52} color={colors.white} />
        </View>

        <Text style={styles.successTitle}>Order Placed!</Text>
        <Text style={styles.successSub}>
          Thank you for your order. We'll process it shortly.
        </Text>

        {/* ── Order info card ── */}
        <View style={styles.card}>

          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Order ID</Text>
            <Text style={styles.cardValue} numberOfLines={1}>
              #{order._id.slice(-8).toUpperCase()}
            </Text>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Date</Text>
            <Text style={styles.cardValue}>{date}</Text>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Phone</Text>
            <Text style={styles.cardValue}>{order.phoneNumber}</Text>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>

        </View>

        {/* ── Items ── */}
        <Text style={styles.sectionTitle}>Items Ordered</Text>
        <View style={styles.card}>
          {order.items.map((item, index) => (
            <View key={index}>
              <View style={styles.cardRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.itemRight}>
                  <Text style={styles.itemQty}>x{item.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    KSh {(item.price * item.quantity).toLocaleString()}
                  </Text>
                </View>
              </View>
              {index < order.items.length - 1 && (
                <View style={styles.cardDivider} />
              )}
            </View>
          ))}
        </View>

        {/* ── Total ── */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>
            KSh {order.totalAmount.toLocaleString()}
          </Text>
        </View>

        {/* ── Actions ── */}
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
          <Text style={styles.secondaryBtnText}>View My Orders</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 16,
  },

  // Success header
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.3,
  },
  successSub: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 4,
  },

  // Cards
  card: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  cardValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    maxWidth: "60%",
    textAlign: "right",
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Section title
  sectionTitle: {
    alignSelf: "flex-start",
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: -4,
  },

  // Items
  itemName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
    flex: 1,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemQty: {
    fontSize: 12,
    color: colors.textMuted,
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },

  // Total
  totalCard: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.white,
  },

  // Buttons
  primaryBtn: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryBtn: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },

  // Error
  errorText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  homeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  }, 
  homeBtnText: {
    color: colors.white,
    fontWeight: "700",
  },
});