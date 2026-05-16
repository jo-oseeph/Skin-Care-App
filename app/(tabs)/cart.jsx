import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../../src/context/CartContext";
import { colors } from "../../src/constants/colors";


// ── Single cart item row ───────────────────────────────────
function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <View style={styles.itemCard}>

      {/* Product image */}
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={styles.itemImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.itemImagePlaceholder}>
          <Ionicons name="image-outline" size={24} color={colors.textMuted} />
        </View>
      )}

      {/* Product details */}
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>
          KSh {item.price.toLocaleString()}
        </Text>

        {/* Quantity controls + remove button */}
        <View style={styles.itemBottom}>
          <View style={styles.qtyControls}>

            {/* Decrease — if qty is 1 this removes the item */}
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={onDecrease}
              activeOpacity={0.75}
            >
              <Ionicons
                name={item.quantity === 1 ? "trash-outline" : "remove"}
                size={16}
                color={item.quantity === 1 ? colors.error : colors.primary}
              />
            </TouchableOpacity>

            <Text style={styles.qtyValue}>{item.quantity}</Text>

            {/* Increase — disabled at max stock */}
            <TouchableOpacity
              style={[
                styles.qtyBtn,
                item.quantity >= item.stock && styles.qtyBtnDisabled,
              ]}
              onPress={onIncrease}
              disabled={item.quantity >= item.stock}
              activeOpacity={0.75}
            >
              <Ionicons
                name="add"
                size={16}
                color={
                  item.quantity >= item.stock
                    ? colors.textMuted
                    : colors.primary
                }
              />
            </TouchableOpacity>
          </View>

          {/* Subtotal for this item */}
          <Text style={styles.itemSubtotal}>
            KSh {(item.price * item.quantity).toLocaleString()}
          </Text>
        </View>
      </View>

    </View>
  );
}

// ── Cart screen ────────────────────────────────────────────
export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();

  const isEmpty = items.length === 0;

  const handleIncrease = (item) => {
    updateQuantity(item.productId, item.quantity + 1);
  };

  const handleDecrease = (item) => {
    if (item.quantity === 1) {
      // qty is already 1 — remove item entirely
      removeFromCart(item.productId);
    } else {
      updateQuantity(item.productId, item.quantity - 1);
    }
  };

  // ── Empty state ───────────────────────────────────────────
  if (isEmpty) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Cart</Text>
        </View>

        {/* Empty illustration */}
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="bag-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Browse our products and add something you love
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => router.push("/(tabs)/products")}
            activeOpacity={0.85}
          >
            <Text style={styles.shopBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>

      </View>
    );
  }

  // ── Cart with items ───────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        {/* Item count badge */}
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{totalItems} items</Text>
        </View>
        {/* Clear all button */}
        <TouchableOpacity onPress={clearCart} hitSlop={8}>
          <Text style={styles.clearText}>Clear all</Text>
        </TouchableOpacity>
      </View>

      {/* Cart items list */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onIncrease={() => handleIncrease(item)}
            onDecrease={() => handleDecrease(item)}
            onRemove={() => removeFromCart(item.productId)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}

        // Order summary pinned above the checkout button
        ListFooterComponent={
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Subtotal ({totalItems} items)
              </Text>
              <Text style={styles.summaryValue}>
                KSh {totalPrice.toLocaleString()}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.deliveryFree}>Free</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                KSh {totalPrice.toLocaleString()}
              </Text>
            </View>
          </View>
        }
      />

      {/* Checkout button — sits above the phone's home bar */}
      <View style={[styles.checkoutBar, { paddingBottom: insets.bottom + 16 }]}>
       <TouchableOpacity
  style={styles.checkoutBtn}
  activeOpacity={0.85}
  onPress={() => requireAuth(() => router.push("/checkout"))}
>
  <Text style={styles.checkoutText}>Proceed to Checkout</Text>
  <Ionicons name="arrow-forward" size={18} color={colors.white} />
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
    flex: 1,              // pushes badge and clear button to the right
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
  clearText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: "500",
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },

  // Cart item card
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    padding: 12,
    gap: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: colors.accent,
  },
  itemImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },

  // Quantity controls
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnDisabled: {
    opacity: 0.35,
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    minWidth: 18,
    textAlign: "center",
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },

  // Order summary card
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginTop: 8,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  deliveryFree: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
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

  // Checkout bar
  checkoutBar: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  checkoutBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 14,
    marginTop: -40,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 21,
  },
  shopBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 8,
  },
  shopBtnText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
});