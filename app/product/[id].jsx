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
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const [product, setProduct]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity]       = useState(1);
  const [added, setAdded]             = useState(false);
  const [stockError, setStockError]   = useState(false);

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
    if (typeof addToCart !== "function") return;

    try {
      const result = await addToCart(product, quantity);

      if (result?.success === false) {
        setStockError(true);
        setTimeout(() => setStockError(false), 2000);
        return;
      }

      setAdded(true);
      // Reset quantity to 1 after successful add to prevent accidental double-ordering
      setQuantity(1); 
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("addToCart error:", err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.fullCenter}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
  // Scarcity principle: highlight low stock, standard text for normal stock
  const stockMessage = isOutOfStock 
    ? "Out of stock" 
    : product.stock < 10 
      ? `Only ${product.stock} left!` 
      : `${product.stock} in stock`;

  const imageUri = product.images?.[activeImage] || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <View style={[styles.floatingHeader, { top: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.8}>
          <Ionicons name="heart-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 70 }]}
      >
        <View style={styles.showcaseContainer}>
          <Image
            source={{ uri: imageUri }}
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
        </View>

        <View style={styles.infoContainer}>
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
                { backgroundColor: isOutOfStock ? "#E74C3C" : (product.stock < 10 ? "#F39C12" : "#2ECC71") },
              ]} />
              <Text style={[
                styles.stockText,
                { color: isOutOfStock ? "#E74C3C" : (product.stock < 10 ? "#F39C12" : "#2ECC71") },
              ]}>
                {stockMessage}
              </Text>
            </View>
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.price}>
            KSh {product.price.toLocaleString()}
          </Text>

          {product.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Details</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          ) : null}

          {!isOutOfStock && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.qtyContainer}>
                <TouchableOpacity
                  style={[styles.qtyBtn, quantity === 1 && styles.qtyBtnDisabled]}
                  onPress={decreaseQty}
                  disabled={quantity === 1}
                >
                  <Ionicons name="remove" size={20} color={quantity === 1 ? colors.textMuted : colors.primary} />
                </TouchableOpacity>

                <Text style={styles.qtyValue}>{quantity}</Text>

                <TouchableOpacity
                  style={[styles.qtyBtn, quantity === product.stock && styles.qtyBtnDisabled]}
                  onPress={increaseQty}
                  disabled={quantity === product.stock}
                >
                  <Ionicons name="add" size={20} color={quantity === product.stock ? colors.textMuted : colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.totalCol}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>
            KSh {(product.price * quantity).toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.addToCartBtn,
            isOutOfStock  && styles.addToCartBtnDisabled,
            added         && styles.addToCartBtnSuccess,
            stockError    && styles.addToCartBtnError,
          ]}
          disabled={isOutOfStock || added || stockError}
          onPress={handleAddToCart}
          activeOpacity={0.85}
        >
          {/* Use numberOfLines and adjustsFontSizeToFit to prevent UI breaking on long error messages */}
          <Text 
            style={styles.addToCartText}
            numberOfLines={1} 
            adjustsFontSizeToFit
          >
            {isOutOfStock ? "Out of stock"
              : stockError  ? `Only ${product.stock} available`
              : added       ? "Added to Cart"
              :               "Add to Cart"}
          </Text>
          <Ionicons
            name={
              stockError  ? "alert-circle" :
              added       ? "checkmark-circle" :
                            "arrow-forward"
            }
            size={18}
            color={colors.background}
          />
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
  fullCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.background,
  },
  
  floatingHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
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

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  showcaseContainer: {
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 32,
    padding: 16,
    shadowColor: colors.primary,
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    marginBottom: 24,
  },
  mainImage: {
    width: "100%",
    height: width * 0.85,
    borderRadius: 24,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },

  infoContainer: {
    paddingHorizontal: 24,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: "rgba(246,221,207,0.3)", 
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(246,221,207,0.8)",
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.card,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  stockText: {
    fontSize: 12,
    fontWeight: "600",
  },
  productName: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 32,
  },

  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
    fontWeight: "400",
  },

  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 999,
    alignSelf: "flex-start",
    padding: 6,
    shadowColor: colors.primary,
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.surface,
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
    minWidth: 40,
    textAlign: "center",
  },

  bottomBar: {
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  totalCol: {
    gap: 4,
  },
  totalLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.primary,
  },
  addToCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 999,
    maxWidth: "60%", // Prevent button from blowing out the layout
  },
  addToCartBtnDisabled: {
    backgroundColor: colors.textMuted,
  },
  addToCartBtnSuccess: {
    backgroundColor: "#2ECC71", 
  },
  addToCartBtnError: {
    backgroundColor: "#E74C3C", 
  },
  addToCartText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.background,
  },
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
    marginTop: 10,
  },
  backBtnText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 13,
  },
});