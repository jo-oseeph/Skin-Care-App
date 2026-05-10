import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getProducts } from "../../src/services/productService";
import ProductCard from "../../src/components/common/ProductCard";
import { useCart } from "../../src/context/CartContext";
import { colors } from "../../src/constants/colors";

const { width } = Dimensions.get("window");

const BANNER_IMAGE =
  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80";

const CATEGORIES = [
  "All",
  "cleanser",
  "serum",
  "moisturizer",
  "sunscreen",
  "toner",
  "exfoliant",
  "mask",
  "eye_cream",
  "spot_treatment",
  "oil",
];

const formatCategory = (cat) => {
  if (cat === "All") return "All";
  return cat
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

// ── Featured product card — horizontal scroll ──────────────
function FeaturedCard({ product, onPress }) {
  return (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {product.images?.[0] ? (
        <Image
          source={{ uri: product.images[0] }}
          style={styles.featuredImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.featuredImagePlaceholder}>
          <Ionicons name="image-outline" size={28} color={colors.textMuted} />
        </View>
      )}

      {/* NEW badge */}
      <View style={styles.newBadge}>
        <Text style={styles.newBadgeText}>NEW</Text>
      </View>

      <View style={styles.featuredInfo}>
        <Text style={styles.featuredCategory}>
          {formatCategory(product.category)}
        </Text>
        <Text style={styles.featuredName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.featuredPrice}>
          KSh {product.price.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Main screen ────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { totalItems } = useCart();

  const [featured, setFeatured]       = useState([]);  // newest 6 products
  const [allProducts, setAllProducts] = useState([]);  // full grid
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  // Fetch on mount + when category changes
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Featured — always newest 6, no category filter
      const featuredResult = await getProducts({
        sortBy: "newest",
        limit: 6,
      });

      // All products — filtered by category if one is selected
      const params = { sortBy: "newest", limit: 20 };
      if (activeCategory !== "All") params.category = activeCategory;
      const allResult = await getProducts(params);

      if (featuredResult.success) setFeatured(featuredResult.products);
      if (allResult.success) setAllProducts(allResult.products);
      if (!featuredResult.success && !allResult.success) {
        setError("Failed to load products");
      }

      setLoading(false);
    };

    load();
  }, [activeCategory]);

  const handleProductPress = (product) => {
    router.push(`/product/${product._id}`);
  };

  // ── List header — everything above the product grid ───────
  const ListHeader = () => (
    <View>

      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={styles.greeting}>Hello 👋</Text>
          <Text style={styles.tagline}>Find your perfect skincare</Text>
        </View>

        {/* Cart icon with badge */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push("/(tabs)/cart")}
          activeOpacity={0.8}
        >
          <Ionicons name="bag-outline" size={22} color={colors.primary} />
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {totalItems > 99 ? "99+" : totalItems}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Hero banner ── */}
      <TouchableOpacity
        style={styles.banner}
        activeOpacity={0.92}
        onPress={() => router.push("/(tabs)/products")}
      >
        <Image
          source={{ uri: BANNER_IMAGE }}
          style={styles.bannerImage}
          resizeMode="cover"
        />

        {/* Dark overlay so text is readable over the image */}
        <View style={styles.bannerOverlay} />

        <View style={styles.bannerContent}>
          <Text style={styles.bannerLabel}>SKINCARE COLLECTION</Text>
          <Text style={styles.bannerTitle}>
            Glow up your{"\n"}daily routine
          </Text>
          <View style={styles.bannerBtn}>
            <Text style={styles.bannerBtnText}>Shop Now</Text>
            <Ionicons name="arrow-forward" size={13} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>

      {/* ── Categories ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
      </View>

      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.pillsRow}
        renderItem={({ item }) => {
          const isActive = activeCategory === item;
          return (
            <TouchableOpacity
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => setActiveCategory(item)}
              activeOpacity={0.75}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {formatCategory(item)}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* ── Featured products ── */}
      {featured.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Arrivals</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/products")}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={featured}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.featuredRow}
            renderItem={({ item }) => (
              <FeaturedCard
                product={item}
                onPress={() => handleProductPress(item)}
              />
            )}
          />
        </>
      )}

      {/* ── All products label ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {activeCategory === "All" ? "All Products" : formatCategory(activeCategory)}
        </Text>
        <Text style={styles.productCount}>
          {allProducts.length} items
        </Text>
      </View>

    </View>
  );

  // ── Error state ────────────────────────────────────────────
  if (error && !loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Ionicons name="wifi-outline" size={48} color={colors.textMuted} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => setActiveCategory(activeCategory)}
        >
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {loading ? (
        // ── Loading state ──
        <View style={[styles.centered, { paddingTop: insets.top + 60 }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        // ── Product grid with header ──
        <FlatList
          data={allProducts}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => handleProductPress(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="leaf-outline" size={44} color={colors.textMuted} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      )}

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
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 2,
  },
  tagline: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: -0.3,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  cartBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "700",
  },

  // Hero banner
  banner: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    height: 180,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    // Semi-transparent dark layer over the image
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  bannerContent: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    padding: 24,
    justifyContent: "flex-end",
  },
  bannerLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.white,
    lineHeight: 28,
    marginBottom: 12,
  },
  bannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bannerBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  // Section headers
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  seeAll: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },
  productCount: {
    fontSize: 12,
    color: colors.textMuted,
  },

  // Category pills
  pillsRow: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 8,
    alignItems: "center",
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.white,
    fontWeight: "600",
  },

  // Featured horizontal cards
  featuredRow: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  featuredCard: {
    width: 150,
    backgroundColor: colors.card,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  featuredImage: {
    width: "100%",
    height: 130,
  },
  featuredImagePlaceholder: {
    width: "100%",
    height: 130,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  newBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  newBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  featuredInfo: {
    padding: 10,
    gap: 2,
  },
  featuredCategory: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  featuredName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  featuredPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 2,
  },

  // Product grid
  listContent: {
    paddingBottom: 30,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  // Empty + error states
  emptyContainer: {
    alignItems: "center",
    paddingTop: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
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