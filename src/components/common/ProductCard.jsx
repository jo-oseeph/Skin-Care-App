import { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { useCart } from "../../context/CartContext";

const CARD_WIDTH = (Dimensions.get("window").width - 56) / 2;

const formatCategory = (cat) => {
  if (!cat) return "";
  return cat
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export default function ProductCard({ product, onPress }) {
  const { addToCart } = useCart();

  // Per-card state: idle | loading | added | error
  const [status, setStatus] = useState("idle");

  if (!product) {
    return (
      <View style={styles.card}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={28} color={colors.textMuted} />
        </View>
        <View style={styles.info}>
          <View style={styles.textCol}>
            <Text style={styles.name}>Product unavailable</Text>
          </View>
        </View>
      </View>
    );
  }

  const isOutOfStock = product.stock === 0;
  const displayPrice = product.price
    ? parseInt(product.price).toLocaleString()
    : "0";

  const handleAddToCart = async () => {
    if (status !== "idle" || isOutOfStock) return;

    setStatus("loading");
    const result = await addToCart(product, 1);

    if (result?.success === false) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    } else {
      setStatus("added");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  // ── Button appearance driven by status ──
  const btnBg =
    status === "added" ? colors.success
    : status === "error" ? colors.error
    : isOutOfStock ? colors.textMuted
    : colors.primary;

  const btnIcon =
    status === "loading" ? null
    : status === "added"  ? "checkmark"
    : status === "error"  ? "alert"
    : "add";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Image */}
      {product.images?.length > 0 ? (
        <Image
          source={{ uri: product.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={28} color={colors.textMuted} />
        </View>
      )}

      {/* Out of stock overlay badge */}
      {isOutOfStock && (
        <View style={styles.outOfStockBadge}>
          <Text style={styles.outOfStockText}>Out of stock</Text>
        </View>
      )}

      {/* Info row */}
      <View style={styles.info}>
        <View style={styles.textCol}>
          <Text style={styles.category}>
            {formatCategory(product.category)}
          </Text>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.price}>KSh {displayPrice}</Text>
        </View>

        {/* Add to cart button */}
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: btnBg }]}
          onPress={handleAddToCart}
          disabled={status !== "idle" || isOutOfStock}
          activeOpacity={0.8}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          {status === "loading" ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name={btnIcon} size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    width: CARD_WIDTH,
  },
  image: {
    width: "100%",
    height: 148,
  },
  imagePlaceholder: {
    width: "100%",
    height: 148,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(42,22,15,0.75)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  outOfStockText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  info: {
    padding: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  textCol: {
    flex: 1,
    gap: 2,
    paddingRight: 8,
  },
  category: {
    fontSize: 10,
    color: colors.primarySoft,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "500",
    lineHeight: 18,
  },
  price: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "700",
    marginTop: 2,
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
});