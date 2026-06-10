import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";

const CARD_WIDTH = (Dimensions.get("window").width - 56) / 2;

const formatCategory = (cat) => {
  if (!cat) return "";
  return cat
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export default function ProductCard({ product, onPress, onAddToCart }) {
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

  const displayPrice = product.price
    ? parseInt(product.price).toLocaleString()
    : "0";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Image area */}
      {product.images && product.images.length > 0 ? (
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

      {/* Out of stock badge over image */}
      {product.stock === 0 && (
        <View style={styles.outOfStockBadge}>
          <Text style={styles.outOfStockText}>Out of stock</Text>
        </View>
      )}

      {/* Info row */}
      <View style={styles.info}>
        <View style={styles.textCol}>
          {/* Category */}
          <Text style={styles.category}>
            {formatCategory(product.category)}
          </Text>
          {/* Name */}
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          {/* Price */}
          <Text style={styles.price}>KSh {displayPrice}</Text>
        </View>

        {/* Add to cart circular button — bottom right like in the reference */}
        <TouchableOpacity
          style={[styles.addBtn, product.stock === 0 && styles.addBtnDisabled]}
          onPress={onAddToCart}
          disabled={product.stock === 0}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={colors.white} />
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

  // Image
  image: {
    width: "100%",
    height: 148,
  },
  imagePlaceholder: {
    width: "100%",
    height: 148,
    backgroundColor: colors.accent, // blush placeholder
    justifyContent: "center",
    alignItems: "center",
  },

  // Out of stock badge
  outOfStockBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  outOfStockText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "600",
  },

  // Bottom info section
  info: {
    padding: 10,
    flexDirection: "row", // text on left, button on right
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
    color: colors.primary,
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

  // Add to cart button — circular, forest green
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0, // don't shrink when name is long
  },
  addBtnDisabled: {
    backgroundColor: colors.textMuted,
  },
});
