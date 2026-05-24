import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../../src/context/AuthContext";
import { getMyOrders } from "../../src/services/orderService";
import { colors } from "../../src/constants/colors";

const { height } = Dimensions.get("window");

// ── Status Config (Aligned with Checkout Logic) ─────────────
const STATUS = {
  pending:   { label: "Awaiting Payment", color: "#F39C12", bg: "rgba(243, 156, 18, 0.1)", icon: "time" },
  paid:      { label: "Processing",       color: "#2ECC71", bg: "rgba(46, 204, 113, 0.1)", icon: "checkmark-circle" },
  delivered: { label: "Delivered",        color: colors.primary, bg: "rgba(42,22,15,0.05)", icon: "cube" },
  cancelled: { label: "Cancelled",        color: "#E74C3C", bg: "rgba(231, 76, 60, 0.1)", icon: "close-circle" },
};

// ── Single Order Card ──────────────────────────────────────
function OrderCard({ order, onPress }) {
  const status = STATUS[order.status] || STATUS.pending;

  const date = new Date(order.createdAt).toLocaleDateString("en-KE", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });

  const itemPreview = order.items.slice(0, 2).map((i) => i.name).join(", ");
  const moreCount = order.items.length - 2;

  return (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Top row */}
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.orderId}>
            Order #{order._id.slice(-8).toUpperCase()}
          </Text>
          <Text style={styles.orderDate}>{date}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Ionicons name={status.icon} size={14} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      {/* Items preview */}
      <View style={styles.previewRow}>
        <View style={styles.previewTextContainer}>
          <Text style={styles.itemPreview} numberOfLines={1}>
            {itemPreview}
          </Text>
          {moreCount > 0 && (
            <Text style={styles.moreCountText}>+{moreCount} more</Text>
          )}
        </View>
      </View>

      {/* Bottom row */}
      <View style={styles.cardBottom}>
        <Text style={styles.itemCountText}>
          {order.items.length} {order.items.length === 1 ? "Item" : "Items"}
        </Text>
        <Text style={styles.orderTotal}>
          KSh {order.totalAmount.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Orders Screen ──────────────────────────────────────────
export default function OrdersScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();

  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Extracted fetch logic so it can be called by hooks AND buttons safely
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    const result = await getMyOrders();
    if (result.success) {
      setOrders(result.data);
      setError(null);
    } else {
      setError(result.message || "Failed to load orders.");
    }
    setLoading(false);
  }, [isAuthenticated]);

  // Refetch every time this tab comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  // ── Guest View ──
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Order History</Text>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyVisual}>
            <Ionicons name="receipt-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Sign in to view orders</Text>
          <Text style={styles.emptySubtitle}>
            Track your purchases and view your complete order history.
          </Text>
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.85}
          >
            <Text style={styles.signInBtnText}>Sign In / Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Loading State ──
  if (loading && orders.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Order History</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  // ── Error State ──
  if (error && orders.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Order History</Text>
        </View>
        <View style={styles.centered}>
          <Ionicons name="warning-outline" size={44} color={colors.textMuted} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={fetchOrders} // Correctly calling the extracted function
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* ── Protected Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>Order History</Text>
        {orders.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{orders.length} Total</Text>
          </View>
        )}
      </View>

      {/* ── Orders List ── */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => router.push(`/order/${item._id}`)} // Assumes you have an order details screen
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyVisual}>
              <Ionicons name="bag-handle-outline" size={48} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>
              When you make a purchase, your orders will appear here.
            </Text>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => router.push("/(tabs)/products")}
              activeOpacity={0.85}
            >
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
    gap: 16,
    paddingHorizontal: 40,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: "rgba(246,221,207,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  countText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
    flexGrow: 1,
  },

  // Order Card (Premium aesthetic)
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderId: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.2,
  },
  orderDate: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  previewTextContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  itemPreview: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
    flexShrink: 1,
  },
  moreCountText: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemCountText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
  },

  // Empty / Guest States
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: height * 0.1, // Visual center compensation
  },
  emptyVisual: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  shopBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 999,
  },
  shopBtnText: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 15,
  },
  signInBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 999,
  },
  signInBtnText: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 15,
  },

  // Error
  errorText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  retryBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 999,
    marginTop: 8,
  },
  retryText: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 14,
  },
});