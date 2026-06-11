import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
} from "react-native";

import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getFeaturedProducts } from "../../src/services/productService";
import { useCart } from "../../src/context/CartContext";
import { colors } from "../../src/constants/colors";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 52) / 2;

const BANNER_IMAGE =
  "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=1400&auto=format&fit=crop";

// Categories are now navigation shortcuts — they don't filter Home,
// they take the user into the Products tab pre-filtered.
const CATEGORIES = [
  { id: "All", label: "All", icon: "apps-outline" },
  { id: "cleanser", label: "Cleanser", icon: "water-outline" },
  { id: "serum", label: "Serum", icon: "flask-outline" },
  { id: "moisturizer", label: "Moisturizer", icon: "leaf-outline" },
  { id: "sunscreen", label: "Sunscreen", icon: "sunny-outline" },
  { id: "toner", label: "Toner", icon: "color-filter-outline" },
  { id: "exfoliant", label: "Exfoliant", icon: "sparkles-outline" },
  { id: "mask", label: "Mask", icon: "happy-outline" },
  { id: "eye_cream", label: "Eye Cream", icon: "eye-outline" },
  { id: "spot_treatment", label: "Spot Care", icon: "medical-outline" },
  { id: "oil", label: "Oil", icon: "water-outline" },
];

// Category pill — no active state here since we're navigating, not filtering
function CategoryPill({ item, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.categoryPill}
    >
      <View style={styles.categoryIconCircle}>
        <Ionicons
          name={item.icon}
          size={18}
          color={colors.textSecondary}
        />
      </View>
      <Text style={styles.categoryLabel}>{item.label}</Text>
    </TouchableOpacity>
  );
}

function ProductCard({ product, onPress }) {
  const imageUri =
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop";

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.cardImageBox}>
        <Image
          source={{ uri: imageUri }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        {product.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text numberOfLines={1} style={styles.cardName}>
          {product.name}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>
            KSh {product.price.toLocaleString()}
          </Text>
          <TouchableOpacity style={styles.cardCta} activeOpacity={0.85} onPress={onPress}>
            <Ionicons name="arrow-forward" size={13} color={colors.background} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { totalItems } = useCart();

  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = async () => {
    setLoading(true);
    // Only fetch latest 8 products for the Home featured section
    const result = await getFeaturedProducts({ sortBy: "newest", limit: 8 });
    if (result.success) setFeatured(result.products);
    setLoading(false);
  };

  // Navigate to Products tab with a category pre-selected
  const handleCategoryPress = (categoryId) => {
    router.push({
      pathname: "/(tabs)/products",
      params: { category: categoryId },
    });
  };

  // Navigate to Products tab with no filter
  const handleSeeAllProducts = () => {
    router.push({
      pathname: "/(tabs)/products",
      params: { category: "All" },
    });
  };

  const handleProductPress = (product) =>
    router.push(`/product/${product._id}`);

  const ListHeader = () => (
    <View>
      {/* ── Top Bar ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.logo}>LUMERA</Text>
        <View style={styles.topIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/(tabs)/cart")}
          >
            <Ionicons name="bag-outline" size={19} color={colors.text} />
            {totalItems > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Hero Banner ── */}
      <TouchableOpacity
        activeOpacity={0.92}
        style={styles.banner}
        onPress={handleSeeAllProducts}
      >
        <Image
          source={{ uri: BANNER_IMAGE }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={[
            "rgba(42,22,15,0.82)",
            "rgba(42,22,15,0.55)",
            "rgba(42,22,15,0.08)",
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Crafted for{"\n"}Radiant Skin</Text>
          <View style={styles.bannerBtn}>
            <Text style={styles.bannerBtnText}>Shop Now</Text>
            <Ionicons name="arrow-forward" size={13} color={colors.text} />
          </View>
        </View>
      </TouchableOpacity>

      {/* ── Collections (navigate into Products tab) ── */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Collections</Text>
        <TouchableOpacity onPress={handleSeeAllProducts}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {CATEGORIES.map((cat) => (
          <CategoryPill
            key={cat.id}
            item={cat}
            onPress={() => handleCategoryPress(cat.id)}
          />
        ))}
      </ScrollView>

      {/* ── New Arrivals Header ── */}
      <View style={[styles.sectionRow, { marginTop: 8 }]}>
        <Text style={styles.sectionTitle}>New Arrivals</Text>
        <TouchableOpacity onPress={handleSeeAllProducts}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && featured.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <FlatList
        data={featured}
        keyExtractor={(item) => item._id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handleProductPress(item)}
          />
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products yet</Text>
            </View>
          )
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: 36,
  },

  // ── Top Bar ──
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginBottom: 22,
  },
  logo: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 6,
    color: colors.text,
  },
  topIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 17,
    height: 17,
    borderRadius: 999,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  badgeText: {
    color: colors.background,
    fontSize: 9,
    fontWeight: "700",
  },

  // ── Banner ──
  banner: {
    marginHorizontal: 20,
    height: 200,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 30,
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  bannerContent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "55%",
    justifyContent: "center",
    paddingHorizontal: 22,
    gap: 12,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 31,
    color: "#F9E5D9",
    letterSpacing: 0.2,
  },
  bannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.background,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  bannerBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: 0.3,
  },

  // ── Sections ──
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.2,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
  },

  // ── Categories ──
  categoriesScroll: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 10,
    marginBottom: 22,
  },
  categoryPill: {
    alignItems: "center",
    gap: 6,
  },
 // AFTER
categoryIconCircle: {
  width: 52,
  height: 52,
  borderRadius: 999,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.white,       
  borderWidth: 2.5,
  borderColor: colors.accent,        
},
  categoryLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.3,
  },

  // ── Product Grid ──
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 10,
    shadowColor: "#2A160F",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardImageBox: {
    width: "100%",
    height: 148,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.surface,
    marginBottom: 10,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  newBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.background,
    letterSpacing: 0.8,
  },
  cardBody: {
    paddingHorizontal: 4,
    paddingBottom: 2,
    gap: 8,
  },
  cardName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: 0.1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  cardCta: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});