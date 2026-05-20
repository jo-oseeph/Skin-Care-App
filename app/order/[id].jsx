import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getOrderById } from "../../src/services/orderService";
import { colors } from "../../src/constants/colors";

// ── Status config ──────────────────────────────────────────
const STATUS = {
  pending:   { label: "Pending",   color: "#92400E", bg: "#FEF3C7", icon: "time-outline",           description: "Your order is being processed" },
  paid:      { label: "Paid",      color: "#065F46", bg: "#D1FAE5", icon: "checkmark-circle-outline", description: "Payment confirmed" },
  delivered: { label: "Delivered", color: colors.primary, bg: colors.accent, icon: "bag-check-outline",  description: "Your order has been delivered" },
  cancelled: { label: "Cancelled", color: colors.error,   bg: "#FEE2E2", icon: "close-circle-outline",   description: "This order was cancelled" },
};

// ── Timeline step ──────────────────────────────────────────
function TimelineStep({ icon, label, description, isActive, isLast }) {
  return (
    <View style={timelineStyles.step}>
      {/* Icon circle */}
      <View style={timelineStyles.iconCol}>
        <View style={[
          timelineStyles.circle,
          isActive && timelineStyles.circleActive,
        ]}>
          <Ionicons
            name={icon}
            size={14}
            color={isActive ? colors.white : colors.textMuted}
          />
        </View>
        {/* Connector line — hidden on last step */}
        {!isLast && (
          <View style={[
            timelineStyles.line,
            isActive && timelineStyles.lineActive,
          ]} />
        )}
      </View>

      {/* Text */}
      <View style={timelineStyles.textCol}>
        <Text style={[
          timelineStyles.label,
          isActive && timelineStyles.labelActive,
        ]}>
          {label}
        </Text>
        {isActive && (
          <Text style={timelineStyles.description}>{description}</Text>
        )}
      </View>
    </View>
  );
}

const timelineStyles = StyleSheet.create({
  step: {
    flexDirection: "row",
    gap: 12,
    minHeight: 44,
  },
  iconCol: {
    alignItems: "center",
    width: 28,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  circleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  line: {
    width: 1.5,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  lineActive: {
    backgroundColor: colors.primary,
  },
  textCol: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.text,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

// ── Main screen ────────────────────────────────────────────
export default function OrderDetailScreen() {
  const { id }  = useLocalSearchParams();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const load = async () => {
      const result = await getOrderById(id);
      if (result.success) {
        setOrder(result.data);
      } else {
        setError(result.message);
      }
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

  if (error || !order) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
        <Text style={styles.errorText}>{error || "Order not found"}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = STATUS[order.status] || STATUS.pending;

  const date = new Date(order.createdAt).toLocaleDateString("en-KE", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    year:    "numeric",
  });

  const time = new Date(order.createdAt).toLocaleTimeString("en-KE", {
    hour:   "2-digit",
    minute: "2-digit",
  });

  // Order timeline steps — which ones are active depends on status
  const timelineSteps = [
    {
      icon:        "receipt-outline",
      label:       "Order Placed",
      description: `Placed on ${date} at ${time}`,
      isActive:    true, // always active
    },
    {
      icon:        "checkmark-circle-outline",
      label:       "Payment Confirmed",
      description: "Payment received via M-Pesa",
      isActive:    ["paid", "delivered"].includes(order.status),
    },
    {
      icon:        "cube-outline",
      label:       "Processing",
      description: "Your order is being prepared",
      isActive:    ["paid", "delivered"].includes(order.status),
    },
    {
      icon:        "bag-check-outline",
      label:       "Delivered",
      description: "Order delivered successfully",
      isActive:    order.status === "delivered",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backIconBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
      >

        {/* ── Order ID + status ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>Order ID</Text>
              <Text style={styles.heroId}>
                #{order._id.slice(-8).toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Ionicons name={status.icon} size={13} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
              <Text style={styles.heroMetaText}>{date}</Text>
            </View>
            <View style={styles.heroMetaItem}>
              <Ionicons name="phone-portrait-outline" size={14} color={colors.textMuted} />
              <Text style={styles.heroMetaText}>{order.phoneNumber}</Text>
            </View>
          </View>
        </View>

        {/* ── Order timeline ── */}
        <Text style={styles.sectionTitle}>Order Status</Text>
        <View style={styles.card}>
          {timelineSteps.map((step, index) => (
            <TimelineStep
              key={index}
              icon={step.icon}
              label={step.label}
              description={step.description}
              isActive={step.isActive}
              isLast={index === timelineSteps.length - 1}
            />
          ))}
        </View>

        {/* ── Items ordered ── */}
        <Text style={styles.sectionTitle}>Items Ordered</Text>
        <View style={styles.card}>
          {order.items.map((item, index) => (
            <View key={index}>
              <View style={styles.itemRow}>
                {/* Item number circle */}
                <View style={styles.itemNumberCircle}>
                  <Text style={styles.itemNumber}>{index + 1}</Text>
                </View>

                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>
                    KSh {item.price.toLocaleString()} × {item.quantity}
                  </Text>
                </View>

                <Text style={styles.itemTotal}>
                  KSh {(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>

              {index < order.items.length - 1 && (
                <View style={styles.itemDivider} />
              )}
            </View>
          ))}
        </View>

        {/* ── Payment summary ── */}
        <Text style={styles.sectionTitle}>Payment Summary</Text>
        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Subtotal ({order.items.length} items)
            </Text>
            <Text style={styles.summaryValue}>
              KSh {order.totalAmount.toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.freeText}>Free</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Method</Text>
            <View style={styles.mpesaBadge}>
              <Text style={styles.mpesaText}>M-PESA</Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>
              KSh {order.totalAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* ── Actions ── */}
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => router.push("/(tabs)/products")}
          activeOpacity={0.85}
        >
          <Ionicons name="bag-outline" size={16} color={colors.white} />
          <Text style={styles.shopBtnText}>Continue Shopping</Text>
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
    gap: 12,
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
  backIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.primary,
  },

  // Content
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: -8,
  },

  // Hero card
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  heroId: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: 0.3,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  heroDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  heroMeta: {
    gap: 6,
  },
  heroMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroMetaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Cards
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 0,
  },

  // Items
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  itemNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  itemNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 19,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  itemDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 40,
  },

  // Summary
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  freeText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.success,
  },
  mpesaBadge: {
    backgroundColor: "#00A651",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mpesaText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
  },

  // Actions
  shopBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  shopBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },

  // Error
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  backBtn: {
    paddingHorizontal: 22,
    paddingVertical: 9,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backBtnText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 13,
  },
});