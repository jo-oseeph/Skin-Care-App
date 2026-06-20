import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "../../src/context/CartContext";
import { useRequireAuth } from "../../src/hooks/useRequireAuth";
import { colors } from "../../src/constants/colors";

const { height } = Dimensions.get("window");

// Single Cart Item 
function CartItem({ item, onIncrease, onDecrease }) {
  const isMaxStock = item.quantity >= item.stock;

  return (
    <View style={styles.itemCard}>
      {/* Product Image Showcase */}
      <View style={styles.imageShowcase}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.itemImage}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="sparkles-outline" size={24} color={colors.primary} />
        )}
      </View>

      {/* Product Details */}
      <View style={styles.itemDetails}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          <TouchableOpacity 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => onDecrease(true)} 
          >
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.itemPrice}>
          KSh {item.price.toLocaleString()}
        </Text>

        <View style={styles.itemBottom}>
          {/* Soft Pill Quantity Selector */}
          <View style={styles.qtyContainer}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => onDecrease(false)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.quantity === 1 ? "trash-outline" : "remove"}
                size={16}
                color={item.quantity === 1 ? "#E74C3C" : colors.primary}
              />
            </TouchableOpacity>

            <Text style={styles.qtyValue}>{item.quantity}</Text>

            <TouchableOpacity
              style={[styles.qtyBtn, isMaxStock && styles.qtyBtnDisabled]}
              onPress={onIncrease}
              disabled={isMaxStock}
              activeOpacity={0.7}
            >
              <Ionicons
                name="add"
                size={16}
                color={isMaxStock ? colors.textMuted : colors.primary}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.itemSubtotal}>
            KSh {(item.price * item.quantity).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Main Cart Screen
export default function CartScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { requireAuth } = useRequireAuth();
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const isEmpty = items.length === 0;

  const handleIncrease = (item) => {
    updateQuantity(item.productId, item.quantity + 1);
  };

  const handleDecrease = (item, forceDelete = false) => {
    if (item.quantity === 1 || forceDelete) {
      removeFromCart(item.productId);
    } else {
      updateQuantity(item.productId, item.quantity - 1);
    }
  };

  const handleCheckout = () => {
    requireAuth(() => router.push("/checkout"));
  };

  //Empty State 
  if (isEmpty) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Cart</Text>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyVisual}>
            <Ionicons name="bag-handle-outline" size={64} color={colors.primary} />
            <View style={styles.emptyVisualAccent} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Discover our latest skincare collections and find your new glow.
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => router.push("/(tabs)/products")}
            activeOpacity={0.85}
          >
            <Text style={styles.shopBtnText}>Explore Products</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.background} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Active Cart State
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Floating Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <Text style={styles.headerSubtitle}>{totalItems} items</Text>
        </View>
        <TouchableOpacity onPress={clearCart} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onIncrease={() => handleIncrease(item)}
            onDecrease={(force) => handleDecrease(item, force)}
          />
        )}
      />

      {/* Unified Bottom Checkout Sheet */}
      <View style={[styles.checkoutSheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>KSh {totalPrice.toLocaleString()}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          activeOpacity={0.85}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          <View style={styles.checkoutBtnArrow}>
            <Ionicons name="arrow-forward" size={18} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface, 
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
  headerSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "500",
    marginTop: 2,
  },
  clearText: {
    fontSize: 13,
    color: "#E74C3C", // Subtle red
    fontWeight: "600",
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 240, 
    gap: 16,
  },

  // Cart Item Card
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    flexDirection: "row",
    padding: 12,
    gap: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  imageShowcase: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: "rgba(246,221,207,0.5)", 
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 20,
    paddingRight: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
    marginTop: 4,
  },
  itemBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  
  // Soft Pill Quantity Controls
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 999,
    padding: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  qtyBtnDisabled: {
    opacity: 0.4,
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    minWidth: 24,
    textAlign: "center",
  },
  itemSubtotal: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
  },

  // Unified Bottom Sheet
  checkoutSheet: {
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
  summaryContainer: {
    gap: 12,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  deliveryFree: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textMuted,
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.primary,
  },
  checkoutBtn: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  checkoutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.background,
    textAlign: "center",
  },
  checkoutBtnArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: -height * 0.1, 
  },
  emptyVisual: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  emptyVisualAccent: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(246,221,207,0.8)",
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 999,
  },
  shopBtnText: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 15,
  },
});