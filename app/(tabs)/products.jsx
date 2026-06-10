import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TextInput,
  StatusBar,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { getProducts } from "../../src/services/productService";
import ProductCard from "../../src/components/common/ProductCard";
import { colors } from "../../src/constants/colors";

// Consistent data structure with the Home screen
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

// Reusable Category Pill matching Home Screen
function CategoryPill({ item, active, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.categoryPill, active && styles.categoryPillActive]}
    >
      <View
        style={[
          styles.categoryIconCircle,
          active && styles.categoryIconCircleActive,
        ]}
      >
        <Ionicons
          name={item.icon}
          size={18}
          color={active ? colors.background : colors.textSecondary}
        />
      </View>
      <Text
        style={[styles.categoryLabel, active && styles.categoryLabelActive]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

export default function ProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState("All");
  const [error, setError] = useState(null);

  // Search state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce logic: wait 500ms after the user stops typing before setting the actual search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch logic strictly depends on category and debouncedSearch, NOT raw search
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = { sortBy: "newest", limit: 20 };
    if (category !== "All") params.category = category;
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

    const result = await getProducts(params);
    if (result.success) {
      setProducts(result.products);
      setError(null);
    } else {
      setError(result.message || "Failed to load products");
    }
    setLoading(false);
  }, [category, debouncedSearch]);

  // Trigger fetch when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Discover</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons
            name="options-outline" // Changed to filter/options icon for a products page
            size={20}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for serums, cleansers..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearch("")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Categories ── */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Categories</Text>
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
            active={category === cat.id}
            onPress={() => setCategory(cat.id)}
          />
        ))}
      </ScrollView>

      {/* ── Product Count ── */}
      <View style={[styles.sectionRow, { marginTop: 10 }]}>
        <Text style={styles.sectionTitle}>
          {category === "All" && !search ? "All Products" : "Results"}
        </Text>
        {!loading && (
          <Text style={styles.itemCount}>{products.length} items</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {error ? (
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
              onAddToCart={() => {
                // Handle add to cart
                console.log("Add to cart:", item._id);
              }}
            />
          )}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="search-outline"
                  size={44}
                  color={colors.textMuted}
                />
                <Text style={styles.emptyText}>No products found</Text>
              </View>
            )
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

      {/* Loading Overlay for Search/Filter changes */}
      {loading && products.length === 0 && !refreshing && (
        <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Match Home: #F6DDCF
  },
  headerContainer: {
    paddingBottom: 10,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  topBarTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.2,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 999, // Match circular icon buttons from Home
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },

  // Search
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface, // Match surface color (#FBEAE0)
    borderRadius: 999, // Pill shape is much cleaner for search
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    paddingVertical: 0,
  },

  // Sections
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.2,
  },
  itemCount: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textMuted,
  },

  // Categories (Matched to Home)
  categoriesScroll: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 10,
    marginBottom: 20,
  },
  categoryPill: {
    alignItems: "center",
    gap: 6,
  },
  categoryIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  categoryIconCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  categoryLabelActive: {
    color: colors.text,
    fontWeight: "600",
  },

  // Grid
  listContent: {
    paddingBottom: 40,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  // States
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingOverlay: {
    backgroundColor: "rgba(246,221,207,0.7)", // Semi-transparent warm background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textMuted,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 999,
    marginTop: 8,
  },
  retryText: {
    color: colors.background,
    fontWeight: "600",
    fontSize: 13,
  },
});
