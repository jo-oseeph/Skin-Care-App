import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Image,
  TextInput,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getProducts } from "../../src/services/productService";
import ProductCard from "../../src/components/common/ProductCard";
import { colors } from "../../src/constants/colors";

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

const BANNER_IMAGE =
  "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80";

export default function ProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState("All");
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchProducts = useCallback(async () => {
    const params = {};
    if (category !== "All") params.category = category;
    if (search.trim()) params.search = search.trim();

    const result = await getProducts(params);
    if (result.success) {
      setProducts(result.products);
      setError(null);
    } else {
      setError(result.message);
    }
  }, [category, search]);

  useEffect(() => {
    setLoading(true);
    fetchProducts().finally(() => setLoading(false));
  }, [fetchProducts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const ListHeader = () => (
    <View>
      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarTitle}>Discover Products</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons
            name="notifications-outline"
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Banner ── */}
      <View style={styles.banner}>
        <View style={styles.bannerTextCol}>
          <Text style={styles.bannerTitle}>Glow up your skincare routine</Text>
          <TouchableOpacity style={styles.bannerBtn} activeOpacity={0.85}>
            <Text style={styles.bannerBtnText}>Explore</Text>
            <Ionicons name="arrow-forward" size={12} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Image
          source={{ uri: BANNER_IMAGE }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </View>

      {/* ── Categories ── */}
      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.pillsRow}
        renderItem={({ item }) => {
          const isActive = category === item;
          return (
            <TouchableOpacity
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => setCategory(item)}
              activeOpacity={0.75}
            >
              <Text
                style={[styles.pillText, isActive && styles.pillTextActive]}
              >
                {formatCategory(item)}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* ── Popular row ── */}
      <View style={styles.popularRow}>
        <Text style={styles.sectionTitle}>Popular</Text>
        {products.length > 0 && (
          <Text style={styles.itemCount}>{products.length} items</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="wifi-outline" size={44} color={colors.textMuted} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchProducts}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => router.push(`/product/${item._id}`)}
            />
          )}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons
                name="leaf-outline"
                size={44}
                color={colors.textMuted}
              />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
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

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  greeting: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 2,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: -0.3,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },

  // Search
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },

  // Banner
  banner: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 18,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    height: 150,
  },
  bannerTextCol: {
    flex: 1,
    paddingLeft: 20,
    paddingVertical: 20,
    gap: 6,
  },
  bannerLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.accent,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.white,
    lineHeight: 22,
  },
  bannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 6,
  },
  bannerBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  bannerImage: {
    width: 130,
    height: "100%",
  },

  // Section titles
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  popularRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 20,
    marginBottom: 4,
  },
  itemCount: {
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

  // Grid
  listContent: {
    paddingBottom: 30,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  // States
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingTop: 80,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
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
