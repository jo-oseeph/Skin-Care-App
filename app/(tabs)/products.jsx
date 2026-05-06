import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getProducts } from '../../src/services/productService';
import ProductCard from '../../src/components/common/ProductCard';
import { colors } from '../../src/constants/colors';

// Exact values from your backend PRODUCT_CATEGORIES constant
// 'All' is a frontend-only option meaning no category filter
const CATEGORIES = [
  'All',
  'cleanser',
  'serum',
  'moisturizer',
  'sunscreen',
  'toner',
  'exfoliant',
  'mask',
  'eye_cream',
  'spot_treatment',
  'oil',
];

export default function ProductsScreen() {
  const router = useRouter();

  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('All');
  const [error, setError]           = useState(null);

  // ── Fetch products ──────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    const params = {};

    // Only send category param if it's not 'All'
    if (category !== 'All') params.category = category;

    // Only send search param if user typed something
    if (search.trim()) params.search = search.trim();

    const result = await getProducts(params);

    if (result.success) {
      // result.products matches what our updated productService returns
      setProducts(result.products);
      setError(null);
    } else {
      setError(result.message);
    }
  }, [search, category]);

  // Run on first load and whenever search or category changes
  useEffect(() => {
    setLoading(true);
    fetchProducts().finally(() => setLoading(false));
  }, [fetchProducts]);

  // ── Pull to refresh ─────────────────────────────────────
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  // ── Navigate to product detail ──────────────────────────
  const handleProductPress = (product) => {
    router.push(`/product/${product._id}`);
  };

  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
    />
  );

  // Capitalize first letter for display (eye_cream → Eye_cream)
  // We do a simple replace of underscore with space too
  const formatCategory = (cat) => {
    if (cat === 'All') return 'All';
    return cat.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products</Text>
      </View>

      {/* ── Search bar ── */}
      <View style={styles.searchRow}>
        <Ionicons
          name="search-outline"
          size={18}
          color={colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Category filter pills ── */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.categoriesContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryPill,
              category === item && styles.categoryPillActive,
            ]}
            onPress={() => setCategory(item)}
          >
            <Text
              style={[
                styles.categoryText,
                category === item && styles.categoryTextActive,
              ]}
            >
              {formatCategory(item)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* ── Main content ── */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>

      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="wifi-outline" size={48} color={colors.textMuted} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>

      ) : products.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="search-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>No products found</Text>
        </View>

      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={renderProduct}
          numColumns={2}                      // 2 column grid
          columnWrapperStyle={styles.row}     // styles the row wrapper
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});