import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { getMyOrders } from "../../src/services/orderService";
import { colors } from "../../src/constants/colors";

// ── Status config ──────────────────────────────────────────
const STATUS = {
  pending:   { label: "Pending",   color: "#92400E", bg: "#FEF3C7", icon: "time-outline" },
  paid:      { label: "Paid",      color: "#065F46", bg: "#D1FAE5", icon: "checkmark-circle-outline" },
  delivered: { label: "Delivered", color: colors.primary, bg: colors.accent, icon: "bag-check-outline" },
  cancelled: { label: "Cancelled", color: colors.error, bg: "#FEE2E2", icon: "close-circle-outline" },
};

// ── Single order card ──────────────────────────────────────
function OrderCard({ order, onPress }) {
  const status = STATUS[order.status] || STATUS.pending;

  const date = new Date(order.createdAt).toLocaleDateString("en-KE", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });

  // Show first 2 item names, then "+X more" if there are more
  const itemPreview = order.items
    .slice(0, 2)
    .map((i) => i.name)
    .join(", ");
  const moreCount = order.items.length - 2;

  return (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Top row — order ID + status badge */}
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.orderId}>
            #{order._id.slice(-8).toUpperCase()}
          </Text>
          <Text style={styles.orderDate}>{date}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Ionicons name={status.icon} size={12} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      {/* Items preview */}
      <Text style={styles.itemPreview} numberOfLines={1}>
        {itemPreview}
        {moreCount > 0 ? ` +${moreCount} more` : ""}
      </Text>

      {/* Bottom row — item count + total */}
      <View style={styles.cardBottom}>
        <View style={styles.itemCountBadge}>
          <Text style={styles.itemCountText}>
            {order.items.length} {order.items.length === 1 ? "item" : "items"}
          </Text>
        </View>

        <Text style={styles.orderTotal}>
          KSh {order.totalAmount.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Orders screen ──────────────────────────────────────────
export default function OrdersScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();

  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Refetch every time this tab comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) return;

      const load = async () => {
        setLoading(true);
        const result = await getMyOrders();
        if (result.success) {
          setOrders(result.data);
          setError(null);
        } else {
          setError(result.message);
        }
        setLoading(false);
      };

      load();
    }, [isAuthenticated])
  );

  // ── Guest view ─────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>

        <View style={styles.centered}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="receipt-outline" size={40} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Sign in to view orders</Text>
          <Text style={styles.emptySubtitle}>
            Your order history will appear here after you sign in
          </Text>
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.85}
          >
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  // ── Error ──────────────────────────────────────────────────
  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <View style={styles.centered}>
          <Ionicons name="wifi-outline" size={44} color={colors.textMuted} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => useFocusEffect}
          >
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        {orders.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{orders.length} orders</Text>
          </View>
        )}
      </View>

      {/* ── Orders list ── */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => router.push(`/order/${item._id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.centered}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="bag-outline" size={40} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>
              Your orders will appear here after you make a purchase
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
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 40,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
    flex: 1,
  },
  countBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  countText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
    flexGrow: 1,
  },

  // Order card
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderId: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.3,
  },
  orderDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  itemPreview: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemCountBadge: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  itemCountText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary,
  },

  // Empty / guest states
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 19,
  },
  shopBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 4,
  },
  shopBtnText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
  signInBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 36,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  signInBtnText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },

  // Error
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 22,
    paddingVertical: 9,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 13,
  },
});