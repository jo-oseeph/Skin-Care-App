import { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  StatusBar,
  ScrollView,
  Animated,
  Modal,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { getProducts } from "../../src/services/productService";
import ProductCard from "../../src/components/common/ProductCard";
import { colors } from "../../src/constants/colors";

const { width } = require("react-native").Dimensions.get("window");
const CARD_WIDTH = (width - 56) / 2;

const CATEGORIES = [
  { id: "All",            label: "All",        icon: "apps-outline"         },
  { id: "cleanser",       label: "Cleanser",   icon: "water-outline"        },
  { id: "serum",          label: "Serum",      icon: "flask-outline"        },
  { id: "moisturizer",    label: "Moisturizer",icon: "leaf-outline"         },
  { id: "sunscreen",      label: "Sunscreen",  icon: "sunny-outline"        },
  { id: "toner",          label: "Toner",      icon: "color-filter-outline" },
  { id: "exfoliant",      label: "Exfoliant",  icon: "sparkles-outline"     },
  { id: "mask",           label: "Mask",       icon: "happy-outline"        },
  { id: "eye_cream",      label: "Eye Cream",  icon: "eye-outline"          },
  { id: "spot_treatment", label: "Spot Care",  icon: "medical-outline"      },
  { id: "oil",            label: "Oil",        icon: "water-outline"        },
];

const SORT_OPTIONS = [
  { id: "newest",       label: "Newest First",    icon: "time-outline"          },
  { id: "price_asc",    label: "Price: Low → High",icon: "trending-up-outline"  },
  { id: "price_desc",   label: "Price: High → Low",icon: "trending-down-outline"},
  { id: "name_asc",     label: "Name: A → Z",     icon: "text-outline"          },
];

// ─────────────────────────────────────────────
// Shimmer skeleton
// ─────────────────────────────────────────────
function useShimmer() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    ).start();
  }, []);
  return anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.skeleton, colors.skeletonHighlight],
  });
}

function SkeletonBox({ style }) {
  const bg = useShimmer();
  return <Animated.View style={[{ borderRadius: 8, backgroundColor: bg }, style]} />;
}

function SkeletonProductCard() {
  return (
    <View style={[styles.skeletonCard, { width: CARD_WIDTH }]}>
      <SkeletonBox style={styles.skeletonImage} />
      <View style={{ padding: 10, gap: 6 }}>
        <SkeletonBox style={{ height: 10, width: "50%", borderRadius: 5 }} />
        <SkeletonBox style={{ height: 13, width: "80%", borderRadius: 5 }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
          <SkeletonBox style={{ height: 13, width: "40%", borderRadius: 5 }} />
          <SkeletonBox style={{ width: 34, height: 34, borderRadius: 17 }} />
        </View>
      </View>
    </View>
  );
}

function SkeletonCategoryPill() {
  return (
    <View style={{ alignItems: "center", gap: 6 }}>
      <SkeletonBox style={{ width: 52, height: 52, borderRadius: 999 }} />
      <SkeletonBox style={{ width: 44, height: 10, borderRadius: 5 }} />
    </View>
  );
}

function SkeletonHeader({ insets }) {
  return (
    <View style={styles.headerContainer}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <SkeletonBox style={{ width: 120, height: 28, borderRadius: 6 }} />
        <SkeletonBox style={{ width: 42, height: 42, borderRadius: 999 }} />
      </View>
      {/* Search */}
      <SkeletonBox style={{ marginHorizontal: 20, height: 48, borderRadius: 999, marginBottom: 24 }} />
      {/* Section label */}
      <View style={[styles.sectionRow, { marginBottom: 16 }]}>
        <SkeletonBox style={{ width: 110, height: 22, borderRadius: 6 }} />
      </View>
      {/* Category pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.categoriesScroll]} scrollEnabled={false}>
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCategoryPill key={i} />)}
      </ScrollView>
      {/* Count row */}
      <View style={[styles.sectionRow, { marginTop: 10, marginBottom: 16 }]}>
        <SkeletonBox style={{ width: 130, height: 22, borderRadius: 6 }} />
        <SkeletonBox style={{ width: 55, height: 16, borderRadius: 6 }} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// Category pill
// ─────────────────────────────────────────────
function CategoryPill({ item, active, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.categoryPill}
    >
      <View style={[styles.categoryIconCircle, active && styles.categoryIconCircleActive]}>
        <Ionicons
          name={item.icon}
          size={18}
          color={active ? colors.background : colors.primary}
        />
      </View>
      <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

// Sort modal
function SortModal({ visible, currentSort, onSelect, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Sort By</Text>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.sortRow, currentSort === opt.id && styles.sortRowActive]}
              onPress={() => { onSelect(opt.id); onClose(); }}
              activeOpacity={0.8}
            >
              <View style={styles.sortRowLeft}>
                <Ionicons
                  name={opt.icon}
                  size={18}
                  color={currentSort === opt.id ? colors.background : colors.primary}
                />
                <Text style={[styles.sortLabel, currentSort === opt.id && styles.sortLabelActive]}>
                  {opt.label}
                </Text>
              </View>
              {currentSort === opt.id && (
                <Ionicons name="checkmark" size={18} color={colors.background} />
              )}
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Products screen 
export default function ProductsScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { category: incomingCategory } = useLocalSearchParams();

  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);
  const [error,     setError]     = useState(null);
  const [sortModal, setSortModal] = useState(false);
  const [sortBy,    setSortBy]    = useState("newest");

  const [category, setCategory] = useState(
    incomingCategory && CATEGORIES.find((c) => c.id === incomingCategory)
      ? incomingCategory
      : "All"
  );

  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (incomingCategory && CATEGORIES.find((c) => c.id === incomingCategory)) {
      setCategory(incomingCategory);
    }
  }, [incomingCategory]);

  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(h);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = { sortBy, limit: 20 };
    if (category !== "All")       params.category = category;
    if (debouncedSearch.trim())   params.search   = debouncedSearch.trim();

    const result = await getProducts(params);
    if (result.success) {
      setProducts(result.products);
      setError(null);
    } else {
      setError(result.message || "Failed to load products");
    }
    setLoading(false);
  }, [category, debouncedSearch, sortBy]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const activeSortLabel = SORT_OPTIONS.find((o) => o.id === sortBy)?.label || "Sort";

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Discover</Text>
        {/* Sort button — shows active sort label */}
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setSortModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="funnel-outline" size={15} color={colors.text} />
          <Text style={styles.sortBtnText} numberOfLines={1}>
            {activeSortLabel.split(":")[0].split(" ")[0]}
          </Text>
          <Ionicons name="chevron-down" size={13} color={colors.textMuted} />
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

      {/* ── Count row ── */}
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

      <SortModal
        visible={sortModal}
        currentSort={sortBy}
        onSelect={setSortBy}
        onClose={() => setSortModal(false)}
      />

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
          data={loading && products.length === 0 ? [] : products}
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
          ListHeaderComponent={
            loading && products.length === 0
              ? () => <SkeletonHeader insets={insets} />
              : ListHeader
          }
          ListFooterComponent={
            loading && products.length === 0 ? (
              <View style={styles.skeletonGrid}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonProductCard key={i} />
                ))}
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={44} color={colors.textMuted} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingBottom: 10,
  },
  listContent: {
    paddingBottom: 40,
  },

  // ── Top bar ──
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
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sortBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    maxWidth: 70,
  },

  // ── Search ──
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 999,
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

  // ── Section rows ──
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

  // ── Categories ──
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
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.accent,
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

  // ── Grid ──
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  // ── Sort modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(42,22,15,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 6,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortRowActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  sortLabelActive: {
    color: colors.background,
  },

  // ── States ──
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
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

  //Skeleton 
  skeletonCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  skeletonImage: {
    width: "100%",
    height: 148,
    borderRadius: 0,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 16,
  },
});