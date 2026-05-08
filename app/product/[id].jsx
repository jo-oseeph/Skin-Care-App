import { useState, useEffect } from "react";
import { useCart } from "../../src/context/CartContext";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getProduct } from "../../src/services/productService";
import { colors } from "../../src/constants/colors";

const { width } = Dimensions.get("window");

const formatCategory = (cat) => {
  if (!cat) return "";
  return cat
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();

  useEffect(() => {
    const load = async () => {
      const result = await getProduct(id);
      if (result.success) {
        setProduct(result.product);
      } else {
        setError(result.message);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const increaseQty = () => {
    if (product && quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const decreaseQty = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  const handleAddToCart = async () => {
    console.log("--- ADD TO CART PRESSED ---");
    console.log("Product ID:", product._id);
    console.log("Product name:", product.name);
    console.log("Quantity:", quantity);
    console.log("addToCart type:", typeof addToCart);

    if (typeof addToCart !== "function") {
      console.error("addToCart is NOT a function — CartContext is broken");
      return;
    }

    try {
      await addToCart(product, quantity);
      console.log("addToCart completed successfully");
    } catch (err) {
      console.error("addToCart threw an error:", err.message);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <View style={styles.fullCenter}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ── Error ──
  if (error || !product) {
    return (
      <View style={styles.fullCenter}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
        <Text style={styles.errorText}>{error || "Product not found"}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Floating back + heart — position absolute over image */}
      <View style={[styles.floatingHeader, { top: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.floatingBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.floatingBtn} activeOpacity={0.85}>
          <Ionicons name="heart-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ScrollView takes all space above the bottom bar */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Image gallery ── */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.images?.[activeImage] }}
            style={styles.mainImage}
            resizeMode="cover"
          />

          {product.images?.length > 1 && (
            <View style={styles.dotsRow}>
              {product.images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setActiveImage(index)}
                  style={[
                    styles.dot,
                    activeImage === index && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}

          {product.images?.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailRow}
            >
              {product.images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setActiveImage(index)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: img }}
                    style={[
                      styles.thumbnail,
                      activeImage === index && styles.thumbnailActive,
                    ]}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Product info card ── */}
        <View style={styles.infoCard}>

          {/* Category + stock row */}
          <View style={styles.topRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {formatCategory(product.category)}
              </Text>
            </View>

            <View style={[
              styles.stockBadge,
              isOutOfStock ? styles.stockBadgeOut : styles.stockBadgeIn,
            ]}>
              <View style={[
                styles.stockDot,
                { backgroundColor: isOutOfStock ? colors.error : colors.success },
              ]} />
              <Text style={[
                styles.stockText,
                { color: isOutOfStock ? colors.error : colors.success },
              ]}>
                {isOutOfStock ? "Out of stock" : `${product.stock} in stock`}
              </Text>
            </View>
          </View>

          {/* Name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Price */}
          <Text style={styles.price}>
            KSh {product.price.toLocaleString()}
          </Text>

          <View style={styles.divider} />

          {/* Description */}
          {product.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this product</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          ) : null}

          {product.description ? <View style={styles.divider} /> : null}

          {/* Quantity selector */}
          {!isOutOfStock && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={[
                    styles.qtyBtn,
                    quantity === 1 && styles.qtyBtnDisabled,
                  ]}
                  onPress={decreaseQty}
                  disabled={quantity === 1}
                >
                  <Ionicons
                    name="remove"
                    size={18}
                    color={quantity === 1 ? colors.textMuted : colors.primary}
                  />
                </TouchableOpacity>

                <Text style={styles.qtyValue}>{quantity}</Text>

                <TouchableOpacity
                  style={[
                    styles.qtyBtn,
                    quantity === product.stock && styles.qtyBtnDisabled,
                  ]}
                  onPress={increaseQty}
                  disabled={quantity === product.stock}
                >
                  <Ionicons
                    name="add"
                    size={18}
                    color={
                      quantity === product.stock
                        ? colors.textMuted
                        : colors.primary
                    }
                  />
                </TouchableOpacity>

                <Text style={styles.qtyHint}>
                  {product.stock} available
                </Text>
              </View>
            </View>
          )}

        </View>
      </ScrollView>

      {/* ── Bottom bar — OUTSIDE ScrollView so it's never blocked ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.totalCol}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>
            KSh {(product.price * quantity).toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.addToCartBtn,
            isOutOfStock && styles.addToCartBtnDisabled,
          ]}
          disabled={isOutOfStock}
          onPress={handleAddToCart}
          activeOpacity={0.85}
        >
          <Ionicons name="bag-outline" size={18} color={colors.white} />
          <Text style={styles.addToCartText}>
            {isOutOfStock ? "Out of stock" : "Add to cart"}
          </Text>
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
  fullCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.background,
  },

  // Floating buttons over image
  floatingHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  floatingBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // ScrollView
  scroll: {
    flex: 1,           // takes all space between top and bottom bar
  },
  scrollContent: {
    paddingBottom: 16,
  },

  // Image
  imageContainer: {
    backgroundColor: colors.accent,
    paddingBottom: 16,
  },
  mainImage: {
    width,
    height: width * 0.9,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
  thumbnailRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailActive: {
    borderColor: colors.primary,
  },

  // Info card
  infoCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    minHeight: 300,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockText: {
    fontSize: 11,
    fontWeight: "600",
  },
  productName: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 30,
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnDisabled: {
    opacity: 0.4,
  },
  qtyValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    minWidth: 24,
    textAlign: "center",
  },
  qtyHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4,
  },

  // Bottom bar — natural flow, not absolute
  bottomBar: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  totalCol: {
    gap: 2,
  },
  totalLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
  },
  addToCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  addToCartBtnDisabled: {
    backgroundColor: colors.textMuted,
  },
  addToCartText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.white,
  },

  // Error state
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